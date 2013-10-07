Stream.prototype.filter = function (test) {
	return new FilterStream(this, test)
}

function FilterStream(source, test) {
	StreamTransformer.call(this, source)
	this.test = test
}

FilterStream.prototype = Object.create(Stream.prototype)

FilterStream.prototype.add = function (data) {
	if (this.test(data))
		Stream.prototype.add.call(this, data)
}
