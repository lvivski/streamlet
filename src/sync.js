function SyncStream() {
	Stream.call(this)
}

SyncStream.prototype = Object.create(Stream.prototype)
SyncStream.prototype.constructor = SyncStream

SyncStream.prototype.add = function (data) {
	for (var i = 0; i < this.listeners.length; ++i) {
		this.listeners[i].call(null, data)
	}
}
