var assert = require('assert'),
	Sinon = require('sinon'),
	Observable = require('../')

describe('Chained stream', function () {
	specify('handles errors', function (done) {
		var controller = Observable.control()
		var callback = Sinon.spy()

		controller.stream.listen(function () {
			throw new Error()
		}, callback)

		controller.stream.map(function (_) { return _ }).listen(null, callback, function () {
			assert.equal(callback.callCount, 1)
			done()
		})

		controller.add(1)
		controller.done()
	})

	specify('handles errors 2', function (done) {
		var controller = Observable.control()
		var callback = Sinon.spy()

		controller.stream.listen(function () {
			throw new Error()
		}, callback)

		controller.stream.map(function (_) { return _ }).listen(null, callback, function () {
			assert.equal(callback.callCount, 2)
			done()
		})

		controller.fail(1)
		controller.done()
	})
})
