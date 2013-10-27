Stream.prototype.filter = function (test) {
	return new FilterStream(this, test)
}

function FilterStream(source, test) {
	Stream.call(this)
	source.listen(function (data) {
		if (test(data))
			this.add(data)
	}.bind(this))
}

FilterStream.prototype = Object.create(Stream.prototype)
