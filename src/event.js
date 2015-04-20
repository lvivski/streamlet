function EventStream(element, event) {
	var stream = new SyncStream
	element.addEventListener(event, function (e) {
		stream.add(e)
	}, false)
	return stream
}

if (typeof window === 'object') {
	window.on = function (event) {
		return new EventStream(this, event)
	}

	if(typeof Node === 'object') {
		Node.prototype.on = window.on
	}
}
