function Observer(subscription) {
	this.__subscription__ = subscription
}

Observer.prototype = {}

Object.defineProperty(Observer.prototype, 'closed', {
	get: function () { return Subscription.isClosed(this.__subscription__) },
	configurable: true
})

Observer.prototype.next = function(value) {
	return Observer.next(this.__subscription__, value)
}

Observer.prototype.error = function(reason) {
	return Observer.error(this.__subscription__, reason)
}

Observer.prototype.complete = function(value) {
	return Observer.complete(this.__subscription__, value)
}

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

Observer.handle = function (subscription, type, data) {
    if (Subscription.isClosed(subscription) && type === Observer.FAILURE) throw data
	if (Subscription.isClosed(subscription)) return
	var observer = subscription.__observer__
	if (type === Observer.DONE) {
		subscription.__observer__ = undefined
	}
	try {
		var fn = observer[type]
		if (fn) {
			if (typeof fn !== 'function') {
				throw new TypeError(fn + " is not a function")
			}
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
	if (type === Observer.DONE || type === Observer.FAILURE) {
		Subscription.unsubscribe(subscription)
		Subscription.cleanup(subscription)
	}
	return data
}
