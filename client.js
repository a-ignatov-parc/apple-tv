var net = require('net'),
	events = require('events').EventEmitter;

var _ = require('underscore'),
	plist = require('plist');

var requestTemplate = _.template('<%= method %> <%= path %> HTTP/1.1\nUser-Agent: MediaControl/1.0\nContent-Length: <%= body.length %>\n\n<%= body %>'),
	bodyTemplate = _.template('<% _.each(data, function(value, key) { %><%= key %>: <%= value %>\n<% }); %>');

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

var Api = function(callback, options) {
		options = _.extend({}, options, {
			host: 'apple-tv.local',
			// host: '10.0.1.5', // If dns name won't be able to resolve then use ip address
			port: 7000
		});

		this._timer = null;
		this._responseCallback = [];
		this._socket = net.createConnection(options.port, options.host);

		this._socket.on('data', function(chunk) {
			if (this._responseCallback.length) {
				this._responseCallback.shift()(parseResponse(chunk));
			}
		}.bind(this));

		this._socket.on('connect', function() {
			this.serverInfo(callback);
		}.bind(this));

		this._socket.on('error', function() {
			console.log(arguments);
		}.bind(this));
	};

Api.prototype = {
	_request: function(resource, data, callback) {
		var method = 'GET';

		if (typeof(data) === 'function') {
			callback = data;
			data = null;
		}
		data || (data = {});

		switch(resource) {
			case 'server-info':
			case 'playback-info':
				break;
			case 'play':
				method = 'POST';
				_.defaults(data, {
					'Content-Location': '',
					'Start-Position': 0
				});
				break;
			case 'stop':
				method = 'POST';
				break;
		}

		if (typeof(callback) === 'function') {
			this._responseCallback.push(callback);
		}

		this._socket.write(requestTemplate({
			method: method,
			path: '/' + resource,
			body: bodyTemplate({
				data: data
			})
		}));
	},

	serverInfo: function(callback) {
		this._request('server-info', callback);
	},

	play: function(url, callback) {
		this.stop(function() {
			this._request('play', {
				'Content-Location': url
			}, function() {
				this.emit('playback-started');

				if (typeof(callback) === 'function') {
					callback.apply(null, arguments);
				}
			}.bind(this));

			this._timer = setInterval(function() {
				this.playbackInfo(function(info) {
					if (info.readyToPlay && info.rate !== 0) {
						this.emit('playback', info);
					}

					if ((info.duration - info.position) < 2) {
						this.emit('playback-ended');
					}
				}.bind(this));
			}.bind(this), 1000);
		}.bind(this));
	},

	stop: function(callback) {
		this._timer && clearInterval(this._timer);
		this._request('stop', callback);
	},

	playbackInfo: function(callback) {
		this._request('playback-info', callback);
	}
};

Api.prototype.__proto__ = events.prototype;

module.exports = Api;