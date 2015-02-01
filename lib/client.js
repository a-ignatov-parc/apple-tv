var fs = require('fs');
var net = require('net');
var events = require('events').EventEmitter;

var plist = require('plist');
var _ = require('underscore');
var jsdom = require('jsdom').jsdom();
var $ = require('jquery')(jsdom.parentWindow);

var requestBody = _.template(fs.readFileSync(__dirname + '/templates/body.tpl').toString());
var requestPayload = _.template(fs.readFileSync(__dirname + '/templates/request.tpl').toString());

var defaults = {
	host: 'apple-tv.local',
	port: 7000
};
var supportedResources = [
	'playback-info',
	'server-info',
	'play',
	'stop',
];
var socket;
var timer;

var client = _.extend(Object.create(events.prototype), {
	connect: function(options) {
		var deferred = new $.Deferred();
		var params = _.defaults(options, defaults);

		if (socket) {
			this.disconnect().then(function() {
				return this.connect(options);
			}.bind(this));
		} else {
			socket = new net.Socket();

			// Конфигурируем сокет.
			// socket.setKeepAlive(true);

			// Подписываемся на события.
			socket.once('connect', function() {
				request('server-info').then(function(info) {
					deferred.resolve(info);
				});
			});
			socket.on('error', function(error) {
				if (deferred.state() === 'pending') {
					deferred.reject(error);
				} else {
					this.emit('error', error);
				}
			}.bind(this));

			// Подключаемся по созданному сокету.
			socket.connect(params.port, params.host);
		}

		return deferred;
	},

	disconnect: function() {
		var deferred = new $.Deferred();

		if (socket) {
			socket.once('close', function() {
				socket = void(0);
				deferred.resolve();
			});

			socket.end();
		}

		return deferred;
	},

	play: function(url) {
		return request('play', {
			'Content-Location': url
		}).then(function() {
			this.emit('playback-started');
			startPollingPlaybackInfo();
		}.bind(this));
	},

	stop: function() {
		stopPollingPlaybackInfo();
		return request('stop').then(function() {
			this.emit('playback-stopped');
		}.bind(this));
	}
});

function request(resource, payload) {
	var deferred = new $.Deferred();

	if (!socket) {
		return deferred.reject('No open connection');
	}

	if (supportedResources.indexOf(resource) < 0) {
		return deferred.reject('Unsupported request');
	}

	var params = {
		body: '',
		method: 'GET',
		path: '/' + resource,
	}
	var data = payload || {}

	switch (resource) {
		case 'play':
			_.extend(params, {
				method: 'POST'
			});

			_.defaults(data, {
				'Content-Location': '',
				'Start-Position': 0
			});
			break;
		case 'stop':
			_.extend(params, {
				method: 'POST'
			});
			break;
	}

	params.body = requestBody({
		data: data
	});

	socket.once('data', function(chunk) {
		deferred.resolve(parseResponse(chunk));
	});

	socket.write(requestPayload(params));

	return deferred;
}

function startPollingPlaybackInfo() {
	stopPollingPlaybackInfo();

	timer = setInterval(function() {
		request('playback-info').then(function(info) {
			if (info.readyToPlay && info.rate !== 0) {
				client.emit('playback', info);
			}

			if ((info.duration - info.position) < 2) {
				client.emit('playback-ended');
			}
		});
	}, 1000);
}

function stopPollingPlaybackInfo() {
	timer && clearInterval(timer);
}

function parseResponse(data, callback) {
	var result = data.toString(),
		index = result.indexOf('<plist'),
		plistStr = result.substr(index);

	if (index < 0) {
		return {};
	} else {
		return plist.parseStringSync(plistStr);
	}
}

module.exports = client;