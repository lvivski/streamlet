function Stream() {
	this.__listeners__ = []
	this.isDone = false
}

Stream.prototype.add = function (data) {
	if (this.isDone) return

	async(handle, this.__listeners__, data)
}

Stream.prototype.done = function () {
	if (this.isDone) return
	this.isDone = true

	async(handle, this.__listeners__, null, true)
	this.__listeners__ = undefined
}

Stream.prototype.listen = function (onUpdate, onDone) {
	if (this.isDone) return

	var listeners = this.__listeners__,
		listener = {
			update: onUpdate,
			done: onDone
		}

	listeners.push(listener)
	return function () {
		var index = listeners.indexOf(listener)
		listeners.splice(index, 1)
	}
}

Stream.prototype.transform = function (transformer) {
	var stream = new this.constructor()
	this.listen(transformer(stream))
	return stream
}

Stream.prototype.map = function (convert) {
	return this.transform(function (stream) {
		return function (data) {
			data = convert(data)
			stream.add(data)
		}
	})
}

Stream.prototype.filter = function (test) {
	return this.transform(function (stream) {
		return function (data) {
			if (test(data))
				stream.add(data)
		}
	})
}

Stream.prototype.skip = function (count) {
	return this.transform(function (stream) {
		return function (data) {
			if (count-- > 0) {
				stream.done()
			} else {
				stream.add(data)
			}
		}
	})
}

Stream.prototype.take = function (count) {
	return this.transform(function (stream) {
		return function (data) {
			if (count-- > 0) {
				stream.add(data)
			} else {
				stream.done()
			}
		}
	})
}

Stream.prototype.expand = function (expand) {
	return this.transform(function (stream) {
		return function (data) {
			data = expand(data)
			for (var i in data) {
				stream.add(data[i])
			}
		}
	})
}

Stream.prototype.merge = function (streamTwo) {
	return Stream.merge(this, streamTwo)
}
