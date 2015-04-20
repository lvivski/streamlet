function SyncStream() {
	Stream.call(this)
}

SyncStream.prototype = Object.create(Stream.prototype)
SyncStream.prototype.constructor = SyncStream

SyncStream.prototype.add = function (data) {
	if (this.isDone) return

	handleSync(this.__listeners__, data)
}

SyncStream.prototype.done = function () {
	if (this.isDone) return
	this.isDone = true

	handleSync(this.__listeners__, null, true)
	this.__listeners__ = undefined
}

function handleSync(listeners, data, handleDone) {
	var i = 0
	while (i < listeners.length) {
		var listener = listeners[i++],
			update = listener.update,
			done = listener.done

		if (handleDone) {
			if (isFunction(done)) {
				done()
			}
		} else {
			update(data)
		}
	}
}
