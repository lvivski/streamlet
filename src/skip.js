Stream.prototype.skip = function (count) {
	return new SkipStream(this, count)
}

function SkipStream(source, count) {
	StreamTransformer.call(this, source)
	this.count = count
}

SkipStream.prototype = Object.create(Stream.prototype)

SkipStream.prototype.add = function (data) {
	if (this.count-- > 0) return
	Stream.prototype.add.call(this, data)
}
