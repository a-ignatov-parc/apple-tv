global.app_require = function(name) {
	return require(__dirname + '/' + name);
}

var client = app_require('client');
var time = app_require('utils/time');
var Queue = app_require('utils/queue');

var playingQueue = new Queue();

var playingList = [
	// 'http://185.49.70.143/watch/xWik82YPEuvzGL3Vx4FjhA==,1422184880/6pkM5i4qHFZ8Q.mp4',
	// 'http://185.49.70.144/watch/2YtvEJQQFaJx3W_4nKaRkA==,1422184913/3i5whhE514INN.mp4',
	// 'http://185.49.70.142/watch/cb-migijf03_8eq81dUHwg==,1422173386/TyMSbKnKmgHbK.mp4',
	// 'http://185.49.70.142/watch/TqjwRxeoBdteUUKhyh8AyA==,1422769430/Xa80SWwXESI7B.mp4',
	'http://185.49.70.142/watch/nVZoQ7hzdTGdo4jCB0sx7w==,1422850998/XhhEe5IC41dlB.mp4',
	'http://185.49.70.144/watch/GvmJdIkZbFcOE1WWcSWiHA==,1422769467/kmdHOitWNHb9i.mp4',
];

client.connect({
	host: '10.0.1.5'
}).then(function(details) {
	console.log(details.model + ' is ready to work!\n');

	playingQueue.setQueue(playingList);
	playingQueue.execute(client.play, client);
}, function(error) {
	console.error(error);
});

client.on('playback-started', function() {
	console.log('Starting playback...');
});

client.on('playback', function(info) {
	console.log('Playback: ' + time(info.position) + '/' + time(info.duration));
});

client.on('playback-ended', function(info) {
	console.log('Switching to next track...');
	playingQueue.next();
});