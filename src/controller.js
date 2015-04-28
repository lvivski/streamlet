function Controller(stream) {
	this.stream = stream
}

Controller.NEXT = 'next'
Controller.FAIL = 'fail'
Controller.DONE = 'done'

Controller.prototype.add =
Controller.prototype.next = function (data) {
	this.update(Controller.NEXT, data)
}

Controller.prototype.fail = function (reason) {
	this.update(Controller.FAIL, reason)
}

Controller.prototype.done = function () {
	this.update(Controller.DONE)
}

Controller.prototype.update = function (type, data) {
	var stream = this.stream
	if (stream.isDone) return

	if (stream.isSync) {
		Controller.handle(stream.__listeners__, type, data)
	} else {
		delay(Controller.handle, stream.__listeners__, type, data)
	}

	if (type === Controller.DONE) {
		stream.isDone = true
		stream.__listeners__ = undefined
	}
}

Controller.handle = function (listeners, type, data) {
	if (!listeners.length) return

	var i = 0
	while (i < listeners.length) {
		var listener = listeners[i++],
			fn = listener[type],
			fail = listener.fail

		if (isFunction(fn)) {
			try {
				fn(data)
			} catch (e) {
				if (isFunction(fail)) {
					fail(e)
				} else {
					throw e
				}
			}
		}
	}
}
