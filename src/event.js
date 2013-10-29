function EventStream(element, event, constrains) {
	var stream = new Stream
	element.addEventListener(event, function (e) {
		if (Event.PREVENT & constrains) e.preventDefault()
		if (Event.STOP & constrains) e.stopPropagation()
		stream.add(e)
	}, false)
	return stream
}

if (typeof window !== 'undefined') {
	Event.PREVENT = 1
	Event.STOP = 2

	window.on = Node.prototype.on = function (event, constrains) {
		return new EventStream(this, event, constrains)
	}
}