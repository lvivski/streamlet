function SyncStream() {
	Stream.call(this)
}

SyncStream.prototype = Object.create(Stream.prototype)
SyncStream.prototype.constructor = SyncStream

SyncStream.prototype.add = function (data) {
	if (this.isDone) return

	handle(this.__listeners__, data)
}

SyncStream.prototype.done = function () {
	if (this.isDone) return
	this.isDone = true

	handle(this.__listeners__, null, true)
	this.__listeners__ = undefined
}
