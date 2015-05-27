function Observable(fn) {
	this.__listeners__ = []
	if (arguments.length > 0) {
		var controller = new Controller(this)
		if (typeof fn == 'function') {
			try {
				fn(function (val) {
						controller.next(val)
					},
					function (err) {
						controller.fail(err)
					},
					function () {
						controller.done()
					})
			} catch (e) {
				controller.fail(e)
			}
		}
	}
}

Observable.prototype.isDone = false
Observable.prototype.isSync = false

Observable.prototype.listen = function (onNext, onFail, onDone) {
	if (this.isDone) return

	var listeners = this.__listeners__,
		listener = {
			next: onNext,
			fail: onFail,
			done: onDone
		}
	listeners.push(listener)

	return function () {
		var index = (listeners || []).indexOf(listener)
		if (index !== -1) {
			listeners.splice(index, 1)
		}
	}
}

Observable.prototype.transform = function (transformer) {
	var controller = Observable.control(this.isSync),
		unsubscribe = this.listen(
			transformer(controller)
		, function (reason) {
			controller.fail(reason)
		}, function () {
			controller.done()
		})

	controller.stream.end(unsubscribe)

	return controller.stream
}

Observable.prototype.pipe = function (stream) {
	var controller = new Controller(stream),
		unsubscribe = this.listen(function (data) {
			controller.next(data)
		}, function (reason) {
			controller.fail(reason)
		}, function () {
			controller.done()
		})

	stream.end(unsubscribe)

	return stream
}
