function Subscription(observer, subscriber) {
    if (!isObject(observer)) {
        throw new TypeError('Observer must be an object')
    }
    
    this.__observer__ = observer
    this.__cleanup__ = undefined

    if (isFunction(observer.start)) {
        observer.start(this)
        if (Subscription.isClosed(this)) return
    }

    observer = new Observer(this)

    try {
        var cleanup
        if (subscriber.length > 1) {
            cleanup = subscriber(function (value) {
                    return observer.next(value)
                }, function (error) {
                    return observer.error(error)
                }, function (value) {
                    return observer.complete(value)
                })
        } else {
            cleanup = subscriber(observer)
        }
        if (cleanup != null) {
            if (isFunction(cleanup.unsubscribe)) {
                cleanup = Subscription.wrapCleanup(cleanup)
            } else {
                ensureFunction(cleanup || 1)
            }
            this.__cleanup__ = cleanup
        }
    } catch (e) {
        observer.error(e)
    }

    if (Subscription.isClosed(this)) {
        Subscription.cleanup(this)
    }
}

Subscription.prototype = {}

defineMethod(Subscription.prototype, 'unsubscribe', function unsubscribe() {
    Subscription.unsubscribe(this)
})

defineProperty(Subscription.prototype, 'closed', function closed() {
    return Subscription.isClosed(this)
})

Subscription.isClosed = function (subscription) {
    return subscription.__observer__ === undefined
}

Subscription.wrapCleanup = function (subscription) {
    return function () { subscription.unsubscribe() }
}

Subscription.unsubscribe = function (subscription) {
    if (Subscription.isClosed(subscription)) return
    subscription.__observer__ = undefined
    Subscription.cleanup(subscription)
}

Subscription.cleanup = function (subscription) {
    var cleanup = subscription.__cleanup__
    if (!cleanup) return
    subscription.__cleanup__ = undefined
    cleanup()
}
