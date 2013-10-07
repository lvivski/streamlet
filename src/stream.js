function Stream() {
	this.listeners = []
}

function handle(listener, data) {
	nextTick(function () {
		listener(data)
	})
}

Stream.prototype.add = function (data) {
	for (var i = 0; i < this.listeners.length; ++i) {
		handle(this.listeners[i], data)
	}
}

Stream.prototype.listen = function (listener) {
	this.listeners.push(listener)
}
