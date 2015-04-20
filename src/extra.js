Stream.merge = function (streams) {
	streams = parse(streams)

	var stream = new Stream,
		listener = function (data) {
			stream.add(data)
		}

	if (!streams.length) return stream

	var i = 0
	while (i < streams.length) {
		streams[i++].listen(listener)
	}
	return stream
}
