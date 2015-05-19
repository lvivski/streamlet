var assert = require('assert'),
	Sinon = require('sinon'),
	Observable = require('../')

describe('Stream', function () {
	specify('sends data to listeners', function (done) {
		var controller = Observable.control()
		controller.stream.listen(function (data) {
			assert.equal(data, 'data')
			done()
		})
		controller.add('data')
	})

	specify('throws to onFail from next', function (done) {
		var controller = Observable.control()
		controller.stream.listen(function () {
			throw new Error
		}, function () {
			done()
		})
		controller.add()
	})

	specify('fails to listeners', function (done) {
		var controller = Observable.control()
		controller.stream.listen(null, done)
		controller.fail()
	})

	specify('fires done', function (done) {
		var controller = Observable.control()
		controller.stream.listen(null, null, done)
		controller.done()
	})

	specify('supports function passing', function (done) {
		var callback = Sinon.spy()
		var stream = new Observable(function (next, fail, done) {
			setTimeout(next, 10)
			setTimeout(done, 0)
		})
		stream.listen(callback, callback, function () {
			callback()
			assert.equal(callback.callCount, 1)
			done()
		})
	})

})
