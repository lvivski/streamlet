Stream.prototype.map = function (convert) {
	return new MapStream(this, convert)
}

function MapStream(source, convert) {
	Stream.call(this)
	source.listen(function (data) {
		data = convert(data)
		this.add(data)
	}.bind(this))
}

MapStream.prototype = Object.create(Stream.prototype)
