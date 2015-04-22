function Stream(fn) {
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
		} else {
			controller.add(fn)
		}
	}
}

Stream.prototype.isDone = false
Stream.prototype.isSync = false

Stream.prototype.listen = function (onNext, onFail, onDone) {
	if (this.isDone) return

	var listeners = this.__listeners__,
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

Stream.prototype.transform = function (transformer) {
	var controller = new Controller(new Stream)

	this.listen(transformer(controller), function (reason) {
		controller.fail(reason)
	}, function () {
		controller.done()
	})

	return controller.stream
}

Stream.prototype.map = function (convert) {
	return this.transform(function (controller) {
		return function (data) {
			data = convert(data)
			controller.add(data)
		}
	})
}

Stream.prototype.filter = function (test) {
	return this.transform(function (controller) {
		return function (data) {
			if (test(data))
				controller.add(data)
		}
	})
}

Stream.prototype.skip = function (count) {
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

Stream.prototype.take = function (count) {
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

Stream.prototype.expand = function (expand) {
	return this.transform(function (controller) {
		return function (data) {
			data = expand(data)
			for (var i in data) {
				controller.add(data[i])
			}
		}
	})
}

Stream.prototype.merge = function (streamTwo) {
	return Stream.merge(this, streamTwo)
}
