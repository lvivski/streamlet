function Subscription(observer, subscriber) {
    if (typeof observer !== 'object') {
        throw new TypeError('Observer must be an object')
    }
    
    this.__observer__ = observer
    this.__cleanup__ = undefined

    if (typeof observer.start === 'function') {
        observer.start(this)
        if (this.closed) return
    }

    observer = new Observer(this)

    try {
        var cleanup = subscriber(observer)
        if (cleanup != null) {
            if (typeof cleanup.unsubscribe === 'function') {
                cleanup = Subscription.wrapCleanup(cleanup)
            } else if (typeof cleanup !== 'function') {
                throw new TypeError(cleanup + " is not a function")
            }
            this.__cleanup__ = cleanup
        }
    } catch (e) {
        Observer.error(this, e)
    }

    if (this.closed) {
        Subscription.cleanup(this)
    }
}

Subscription.prototype = {}

Subscription.prototype.unsubscribe = function() {
    Subscription.unsubscribe(this)
}

Subscription.prototype.closed = false

Subscription.wrapCleanup = function (subscription) {
    return function () { subscription.unsubscribe() }
}

Subscription.unsubscribe = function (subscription) {
    if (subscription.closed) return
    subscription.closed = true
    subscription.__observer__ = undefined
    Subscription.cleanup(subscription)
}

Subscription.cleanup = function (subscription) {
    var cleanup = subscription.__cleanup__
    if (!cleanup) return;
    subscription.__cleanup__ = undefined
    cleanup()
}
