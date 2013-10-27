Stream.prototype.skip = function (count) {
	return new SkipStream(this, count)
}

function SkipStream(source, count) {
	Stream.call(this)
	source.listen(function (data) {
		if (count-- > 0) return
		this.add(data)
	}.bind(this))
}

SkipStream.prototype = Object.create(Stream.prototype)
