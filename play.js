global.app_require = function(name) {
	return require(__dirname + '/' + name);
}

var Client = app_require('client'),
	time = app_require('utils/time');

var url = 'https://281405721f3e2032-cdn.turbik.tv/0/x32X8ywhq2C+oMO4siCLGBau3dknrWNP2vTw8Po+CtKWgWGvNY7zXiRUy8VkAMuhjaTcjIIkawBbbYcoHQpbE+rtE2rE-tPkeJYS7hlj8W94eBNUFOQbeCGQqO2UvPsHWGEdsPrVbGPFbZEis4fobQGQTwPUHJ8fc53oMYC4xBzzYWp0lx4UqfBIPMNYmOL3zkBz+YXZH5zXc6a7oOWrjd6qRCDa92klhdHYAIfuwlOPbyuNTnXPSAsBlJg+sARxW7SIQuu9fLOvXSQPIKP1u+Ne7EaQWD450HEwLtQQ3XFH9cyM',
	client = new Client(function(details) {
		console.log(details.model + ' is ready to work!\n');

		client.on('playback', function(info) {
			console.log('Playback: ' + time(info.position) + '/' + time(info.duration));
		});

		console.log('Starting playback...');

		client.play(url);
	});