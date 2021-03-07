function Observer(subscription) {
	this.__subscription__ = subscription
}

Observer.prototype = {}

defineProperty(Observer.prototype, 'closed', function closed() {
	return Subscription.isClosed(this.__subscription__)
})

defineMethod(Observer.prototype, 'next', function next(value) {
	return Observer.next(this.__subscription__, value)
})

defineMethod(Observer.prototype, 'error', function error(reason) {
	return Observer.error(this.__subscription__, reason)
})

defineMethod(Observer.prototype, 'complete', function complete(value) {
	return Observer.complete(this.__subscription__, value)
})

Observer.SUCCESS = 'next'
Observer.FAILURE = 'error'
Observer.DONE = 'complete'

Observer.next = function (subscription, value) {
	return Observer.handle(subscription, Observer.SUCCESS, value)
}

Observer.error = function (subscription, reason) {
	return Observer.handle(subscription, Observer.FAILURE, reason)
}

Observer.complete = function (subscription, value) {
	return Observer.handle(subscription, Observer.DONE, value)
}

Observer.isDone = function(type) {
	return type === Observer.DONE || type === Observer.FAILURE
}

Observer.handle = function (subscription, type, data) {
  if (Subscription.isClosed(subscription)) {
		if (type === Observer.FAILURE) throw data
		return
	}
	var observer = subscription.__observer__
	if (Observer.isDone(type)) {
		subscription.__observer__ = undefined
	}
	try {
		var fn = ensureFunction(observer[type])
		if (fn) {
			data = fn(data)
		} else {
			if (type === Observer.FAILURE) {
				throw data
			}
			data = undefined
		}
	} catch (e) {
		try {
			if (type === Observer.SUCCESS) {
				Subscription.unsubscribe(subscription)
			} else {
				Subscription.cleanup(subscription)
			}
		}
		finally {
			throw e
		}
	}
	if (Observer.isDone(type)) {
		Subscription.cleanup(subscription)
	}
	return data
}
