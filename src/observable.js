var LISTENERS = '__listeners' + Math.random() + '__'

function Observable(fn) {
	this[LISTENERS] = []
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

Object.defineProperty(Observable.prototype, LISTENERS, {
	configurable: true,
	writable: true,
	value: undefined
})

Observable.prototype.isDone = false
Observable.prototype.isSync = false

Observable.prototype.listen = function (onNext, onFail, onDone) {
	if (this.isDone) return

	var listeners = this[LISTENERS],
		listener = {
			next: onNext,
			fail: onFail,
			done: onDone
		}

	listeners.push(listener)
	return function () {
		var index = listeners.indexOf(listener)
		listeners.splice(index, 1)
	}
}

Observable.prototype.transform = function (transformer) {
	var controller = this.isSync ? Observable.controlSync() : Observable.control()

	this.listen(transformer(controller), function (reason) {
		controller.fail(reason)
	}, function () {
		controller.done()
	})

	return controller.stream
}

Observable.prototype.map = function (convert) {
	return this.transform(function (controller) {
		return function (data) {
			data = convert(data)
			controller.add(data)
		}
	})
}

Observable.prototype.filter = function (test) {
	return this.transform(function (controller) {
		return function (data) {
			if (test(data))
				controller.add(data)
		}
	})
}

Observable.prototype.skip = function (count) {
	return this.transform(function (controller) {
		return function (data) {
			if (count-- > 0) {
				controller.done()
			} else {
				controller.add(data)
			}
		}
	})
}

Observable.prototype.take = function (count) {
	return this.transform(function (controller) {
		return function (data) {
			if (count-- > 0) {
				controller.add(data)
			} else {
				controller.done()
			}
		}
	})
}

Observable.prototype.expand = function (expand) {
	return this.transform(function (controller) {
		return function (data) {
			data = expand(data)
			for (var i in data) {
				controller.add(data[i])
			}
		}
	})
}

Observable.prototype.merge = function (streamTwo) {
	return Observable.merge(this, streamTwo)
}
