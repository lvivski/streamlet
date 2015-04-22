Stream.create = function () {
	return new Controller(new Stream)
}


Stream.merge = function (streams) {
	streams = parse(streams)

	var controller = new Controller(new Stream),
		listener = function (data) {
			controller.add(data)
		}

	var i = 0
	while (i < streams.length) {
		streams[i++].listen(listener)
	}
	return controller.stream
}
