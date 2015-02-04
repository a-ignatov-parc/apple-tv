function format(num) {
	return ('000' + num).slice(-2);
}

module.exports = function(seconds) {
	seconds = Math.floor(seconds);

	var sec = Math.floor(seconds) % 60,
		min = Math.floor(seconds / 60) % 60,
		hour = Math.floor(seconds / 60 / 60) % 24,
		result = [];

	if (hour) {
		result.push(format(hour));
	}
	result.push(format(min), format(sec));
	return result.join(':');
};
