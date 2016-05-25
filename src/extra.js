Observable.prototype['catch'] = function (onFail) {
	return this.listen(null, onFail)
}

Observable.prototype.end = function (onDone) {
	return this.listen(null, null, onDone)
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
			if (!test(data)) return
			controller.add(data)
		}
	})
}

Observable.prototype.skip = function (count) {
	return this.transform(function (controller) {
		return function (data) {
			if (count-- > 0) return
			controller.add(data)
		}
	})
}

Observable.prototype.skipWhile = function (test) {
	return this.transform(function (controller) {
		return function (data) {
			if (test(data)) return
			controller.add(data)
		}
	})
}

Observable.prototype.skipDuplicates = function (compare, seed) {
	compare || (compare = function (a, b) { return a === b })
	return this.transform(function (controller) {
		return function (data) {
			if (compare(data, seed)) return
			controller.add(seed = data)
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

Observable.prototype.takeWhile = function (test) {
	return this.transform(function (controller) {
		return function (data) {
			if (test(data)) {
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

Observable.prototype.scan = function (combine, seed) {
	return this.transform(function (controller) {
		return function (data) {
			if (seed != null) {
				data = combine(seed, data)
			}
			controller.add(seed = data)
		}
	})
}

Observable.prototype.merge = function (stream) {
	return Observable.merge(this, stream)
}

Observable.control = function (isSync) {
	var observable = new Observable
	observable.isSync = isSync
	return new Controller(observable)
}

Observable.fromEvent = function (element, eventName) {
	var controller = Observable.control(true)
	element.addEventListener(eventName, function (e) {
		controller.add(e)
	}, false)
	return controller.stream
}

Observable.fromPromise = function (promise) {
	var controller = Observable.control()
		onFullfilled = function (data) {
			controller.add(data)
			controller.done()
		},
		onRejected = function (reason) {
			controller.fail(reason)
			controller.done()
		}
	promise.then(onFullfilled, onRejected)

	return controller.stream
}

Observable.merge = function (streams) {
	streams = parse(arguments)

	var isSync = streams[0].isSync,
		controller = Observable.control(isSync),
		count = streams.length,
		i = 0,
		onNext = function (data) {
			controller.add(data)
		},
		onFail = function (reason) {
			controller.fail(reason)
		},
		onDone = function () {
			if (--count > 0) return
			controller.done()
		}

	while (i < count) {
		streams[i++].listen(onNext, onFail, onDone)
	}

	return controller.stream
}
