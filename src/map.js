Stream.prototype.map = function (convert) {
	return new MapStream(this, convert)
}

function MapStream(source, convert) {
	StreamTransformer.call(this, source)
	this.convert = convert
}

MapStream.prototype = Object.create(Stream.prototype)

MapStream.prototype.add = function (data) {
	data = this.convert(data)
	Stream.prototype.add.call(this, data)
}
