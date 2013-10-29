function EventStream(element, event) {
	var stream = new SyncStream
	element.addEventListener(event, function (e) {
		stream.add(e)
	}, false)
	return stream
}

if (typeof window !== 'undefined') {
	window.on = Node.prototype.on = function (event) {
		return new EventStream(this, event)
	}
}