Stream.prototype.take = function (count) {
	return new TakeStream(this, count)
}

function TakeStream(source, count) {
	Stream.call(this)
	source.listen(function (data) {
		if (count-- > 0) {
			this.add(data)
		}
	}.bind(this))
}

TakeStream.prototype = Object.create(Stream.prototype)
