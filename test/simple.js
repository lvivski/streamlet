var assert = require('assert'),
	Sinon = require('sinon'),
	Stream = require('../')

describe('Stream', function () {
	var stream  = new Stream

	specify('sends data to listeners', function (done) {
		stream.listen(function (data) {
			assert.equal(data, 'data')
			done()
		})
		stream.add('data')
	})

	specify('fires done', function (done) {
		stream.listen(null, function () {
			done()
		})
		stream.done()
	})

})
