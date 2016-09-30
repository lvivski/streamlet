function Observable(subscriber) {
    if (typeof subscriber !== 'function') {
        throw new TypeError('Observable initializer must be a function')
    }
    this.__subscriber__ = subscriber
}

Observable.prototype['@@observable'] = function () {
    return this
}

Observable.prototype.subscribe = function (observer) {
    if (typeof observer === 'function') {
        var args = Array.prototype.slice.call(arguments, 1)
        observer = {
            next: observer,
            error: args[0],
            complete: args[1]
        }
    }
    return new Subscription(observer, this.__subscriber__)
}

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
