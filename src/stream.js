function Stream() {
	this.listeners = []
}

function handle(listener, data) {
	nextTick(function () {
		listener(data)
	})
}

Stream.prototype.add = function (data) {
	for (var i = 0; i < this.listeners.length; ++i) {
		handle(this.listeners[i], data)
	}
}

Stream.prototype.listen = function (listener) {
	this.listeners.push(listener)
}

Stream.prototype.map = function (convert) {
	var stream = new this.constructor()

	this.listen(function (data) {
		data = convert(data)
		stream.add(data)
	})

	return stream
}

Stream.prototype.filter = function (test) {
	var stream = new this.constructor()

	this.listen(function (data) {
		if (test(data))
			stream.add(data)
	})

	return stream
}

Stream.prototype.skip = function (count) {
	var stream = new this.constructor()

	this.listen(function (data) {
		if (count-- > 0) return
		stream.add(data)
	})

	return stream
}

Stream.prototype.take = function (count) {
	var stream = new this.constructor()

	this.listen(function (data) {
		if (count-- > 0) {
			stream.add(data)
		}
	})

	return stream
}

Stream.prototype.expand = function (expand) {
	var stream = new this.constructor()

	this.listen(function (data) {
		data = expand(data)
		for (var i in data) {
			stream.add(data[i])
		}
	})

	return stream
}
