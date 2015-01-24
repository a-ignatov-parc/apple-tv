global.app_require = function(name) {
	return require(__dirname + '/' + name);
}

var Client = app_require('client'),
	Queue = app_require('utils/queue'),
	time = app_require('utils/time');

var playingQueue = new Queue(),
	client = new Client(function(details) {
		console.log(details.model + ' is ready to work!\n');

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

		playingQueue.setQueue(playingList);
		playingQueue.execute(client.play, client);
	});

var playingList = [
	'http://185.49.70.143/watch/xWik82YPEuvzGL3Vx4FjhA==,1422184880/6pkM5i4qHFZ8Q.mp4',
	'http://185.49.70.144/watch/2YtvEJQQFaJx3W_4nKaRkA==,1422184913/3i5whhE514INN.mp4',
	'http://185.49.70.142/watch/cb-migijf03_8eq81dUHwg==,1422173386/TyMSbKnKmgHbK.mp4',
	'http://185.49.70.142/watch/WqmsNhjUuvqcK7HbaBbU-g==,1422184936/Xa80SWwXESI7B.mp4',
	'http://185.49.70.142/watch/GQFiq4rOJcU8LIfWqw5nIQ==,1422184949/XhhEe5IC41dlB.mp4',
	'http://185.49.70.144/watch/WE2BiCUZcWcUtMOjJlPvIQ==,1422184962/kmdHOitWNHb9i.mp4',
];