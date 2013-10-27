Stream.prototype.expand = function (expand) {
	return new ExpandStream(this, expand)
}

function ExpandStream(source, expand) {
	Stream.call(this)
	source.listen(function (data) {
		data = expand(data)
		for (var i in data) {
			this.add(data[i])
		}
	}.bind(this))
}

ExpandStream.prototype = Object.create(Stream.prototype)
