var _ = require('underscore');

var Queue = function() {
		this._queue = [];
		this._handler = function() {};
	};

Queue.prototype = {
	setQueue: function(list) {
		if (_.isArray(list)) {
			this._queue = list;
		}
		return this;
	},

	push: function(item) {
		if (item != null) {
			this._queue.push(item);
		}
	},

	execute: function(handler, context) {
		var item = this._queue[0];

		if (typeof(handler) === 'function') {
			this._handler = handler.bind(context);
		}

		if (item != null) {
			this._handler(item);
		}
	},

	next: function() {
		this._queue.shift();
		this.execute();
	}
};

module.exports = Queue;