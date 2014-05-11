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
	'https://281405721f3e2032-cdn.turbik.tv/0/SeoL4X9CuCx6PWp+DNfWhQ+xrJV-PACbYe2wICy39mbi9WU7N8D0q5WZPf5ykvgy5TShzM1wNSblZBeAmOhyKIyEFpV7wiJj4lzzercFKz6NGj6twv-1xPKOHx0hyBFPzIF0KsmxYuLWKaUNiI29Vme8H95hGiqMRTq6R6NW+LKf5JWEucJ2ZeBJ96DS-mfk6gaBUIBXU8W5kh8+dqS-YlI-BKbJW66XUK4JKoGWOhlT2lIzWR-AkLk3nC-a3Q3WWXDC1NjIE02sNbBfR7LVNErze34Q0JuoyHr3bqPk',
	'https://4328d6579b4dbae8-cdn.turbik.tv/0/-Ud7EH4lJ1atNAGEi-rF5ia6DboAu3ZLM29mETGC1O2XiHXR6nDsod6CdQNJGIQfXo+Ur6y4n8OOqqtGGV2wrJCruE6xOzm2KirXwf+KGlvUDcM0EFZrRiylL2UHNM0n2kkYCAcGw1f+iijESF1-SfKLJsKoVth2GIO18YUKZRq0HmyLJ0X+rA10zpzw3BIyHrh8mqjYsvUOfyzEL+tw-Z-FQ5ROZBuIXNHWLI5NFvixjXgW0GbtLbupxZeb5OtQzTv9FKg8HH62pPZFk5+aAKAw00VqrRmWYG7Fcmtr',
	'https://5cd9419a4550d395-cdn.turbik.tv/0/lpc1tIXk4BtgIzWsKCPN+HS4qBOpIUIJTvxwtETm5uEipKZH12RjEz9Fyq8D3Kl5HpzVSieRBkf28xtGDniOVulred2pdiiPF7kCU-nmkj4bcFebGBbIXZIvBqYwMbhmh9krmcMSs0ptM2ENqJU++eLLpJyKTocTMXmxXOpTPc15YRy-dwLjlAxPBcwuITYifuZV88i1b05QFqVxLwX0Xw34FgqMmCrjhpeXuvCuBDEDGMWAeiIhpEZxtTx7SNrMVwHk+vJ7iPz6Of+lFu0qIImgnwbvkkInjhvI3B3l'
];