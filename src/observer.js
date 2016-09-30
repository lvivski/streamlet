function Observer(subscription) {
	this.__subscription__ = subscription
}

Observer.prototype = {}

Object.defineProperty(Observer.prototype, 'closed', {
	get: function () { return this.__subscription__.closed }
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

Observer.NEXT = 'next'
Observer.ERROR = 'error'
Observer.COMPLETE = 'complete'

Observer.next = function (subscription, value) {
	return Observer.handle(subscription, Observer.NEXT, value)
}

Observer.error = function (subscription, reason) {
	return Observer.handle(subscription, Observer.ERROR, reason)
}

Observer.complete = function (subscription, value) {
	return Observer.handle(subscription, Observer.COMPLETE, value)
}

Observer.handle = function (subscription, type, data) {
	if (subscription.closed && type === Observer.ERROR) throw data
	if (subscription.closed) return
	var observer = subscription.__observer__
	if (!observer) return
	var fn
	try {
		fn = observer[type]
		if (fn) {
			if (typeof fn !== 'function') {
				throw new TypeError(fn + " is not a function")
			}
			data = fn(data)
		} else {
			if (type === Observer.ERROR) {
				throw data
			}
			data = undefined
		}
	} catch (e) {
		try {
			Subscription.cleanup(subscription)
		}
		finally {
			throw e
		}
	}
	if (type === Observer.COMPLETE || type === Observer.ERROR) {
		subscription.__observer__ = undefined
		Subscription.cleanup(subscription)
	}
	return data
}
