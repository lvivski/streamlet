Stream.prototype.expand = function (expand) {
	return new ExpandStream(this, expand)
}

function ExpandStream(source, expand) {
	StreamTransformer.call(this, source)
	this.expand = expand
}

ExpandStream.prototype = Object.create(Stream.prototype)

ExpandStream.prototype.add = function (data) {
	data = this.expand(data)
	for (var i in data) {
		Stream.prototype.add.call(this, data[i])
	}
}
