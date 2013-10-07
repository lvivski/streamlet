function EventStream(element, event) {
	var stream = new Stream
	element.addEventListener(event, stream.add.bind(stream), false)
	return stream
}

if (typeof window !== 'undefined') {
	window.on = Node.prototype.on = function (event) {
		return new EventStream(this, event)
	}
}