Observable.create = function (fn) {
	return new Observable(fn)
}

Observable.createSync = function (fn) {
	var stream = Observable.create(fn)
	stream.isSync = true
	return stream
}

Observable.control = function () {
	return new Controller(Observable.create())
}

Observable.controlSync = function () {
	return new Controller(Observable.createSync())
}


Observable.fromEvent = function (element, eventName) {
	return Observable.createSync(function (next) {
		element.addEventListener(eventName, function (e) {
			next(e)
		}, false)
	})
}

Observable.merge = function (streams) {
	streams = parse(arguments)

	var isSync = streams[0].isSync,
		controller = isSync ? Observable.controlSync() : Observable.control(),
		listener = function (data) {
			controller.add(data)
		}

	var i = 0
	while (i < streams.length) {
		streams[i++].listen(listener)
	}
	return controller.stream
}
