function Observable(subscriber) {
    if (typeof subscriber !== 'function') {
        throw new TypeError('Observable initializer must be a function')
    }
    this.__subscriber__ = subscriber
}

defineMethod(Observable.prototype, '@@observable', function $$observable() {
	return this
})

defineMethod(Observable.prototype, 'subscribe', function subscribe(observer) {
	if (typeof observer === 'function') {
		var args = Array.prototype.slice.call(arguments, 1)
		observer = {
			next: observer,
			error: args[0],
			complete: args[1]
		}
	}
	return new Subscription(observer, this.__subscriber__)
})

Observable.prototype.forEach = function (fn) {
    var self = this
    return new Promise(function (resolve, reject) {
        if (typeof fn !== 'function') {
            return Promise.reject(new TypeError(fn + ' is not a function'))
        }
        return self.subscribe({
            next: function (value) {
                try {
                    return fn(value)
                } catch (err) {
                    reject(err)
                }
            },
            error: reject,
            complete: resolve
        })
    })
}

Observable.prototype.transform = function (transformer) {
	var self = this
	return new Observable(function (observer) {
		return self.subscribe(
			transformer(observer),
			function (error) {
				return observer.error(error)
			},
			function (value) {
				return observer.complete(value)
			})
	})
}
