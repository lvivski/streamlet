Stream.prototype.take = function (count) {
	return new TakeStream(this, count)
}

function TakeStream(source, count) {
	StreamTransformer.call(this, source)
	this.count = count
}

TakeStream.prototype = Object.create(Stream.prototype)

TakeStream.prototype.add = function (data) {
	if (this.count-- > 0) {
		Stream.prototype.add.call(this, data)
	}
}
