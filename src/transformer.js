function StreamTransformer(source) {
	Stream.call(this)
	source.listen(this.add.bind(this))
}
