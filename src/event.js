function EventStream(element, event) {
	var controller = Stream.create(true)
	element.addEventListener(event, function (e) {
		controller.add(e)
	}, false)
	return controller.stream
}

if (typeof window === 'object') {
	window.on = function (event) {
		return new EventStream(this, event)
	}

	if (typeof Node === 'object') {
		Node.prototype.on = window.on
	}
}
