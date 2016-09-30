(function(root) {
  "use strict";
  if (typeof define === "function" && define.amd) {
    define([ "davy" ], function(Davy) {
      return Observable;
    });
  } else if (typeof module === "object" && module.exports) {
    module.exports = Observable;
  } else {
    root.Streamlet = Observable;
  }
  function Observable(subscriber) {
    if (typeof subscriber !== "function") {
      throw new TypeError("Observable initializer must be a function");
    }
    this.__subscriber__ = subscriber;
  }
  Observable.prototype["@@observable"] = function() {
    return this;
  };
  Observable.prototype.subscribe = function(observer) {
    if (typeof observer === "function") {
      var args = Array.prototype.slice.call(arguments, 1);
      observer = {
        next: observer,
        error: args[0],
        complete: args[1]
      };
    }
    return new Subscription(observer, this.__subscriber__);
  };
  Observable.prototype.forEach = function(fn) {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (typeof fn !== "function") {
        return Promise.reject(new TypeError(fn + " is not a function"));
      }
      return self.subscribe({
        next: function(value) {
          try {
            return fn(value);
          } catch (err) {
            reject(err);
          }
        },
        error: reject,
        complete: resolve
      });
    });
  };
  function Subscription(observer, subscriber) {
    if (typeof observer !== "object") {
      throw new TypeError("Observer must be an object");
    }
    this.__observer__ = observer;
    this.__cleanup__ = undefined;
    if (typeof observer.start === "function") {
      observer.start(this);
      if (Subscription.isClosed(this)) return;
    }
    observer = new Observer(this);
    try {
      var cleanup = subscriber(observer);
      if (cleanup != null) {
        if (typeof cleanup.unsubscribe === "function") {
          cleanup = Subscription.wrapCleanup(cleanup);
        } else if (typeof cleanup !== "function") {
          throw new TypeError(cleanup + " is not a function");
        }
        this.__cleanup__ = cleanup;
      }
    } catch (e) {
      Observer.error(this, e);
    }
    if (Subscription.isClosed(this)) {
      Subscription.cleanup(this);
    }
  }
  Subscription.prototype = {};
  Subscription.prototype.unsubscribe = function() {
    Subscription.unsubscribe(this);
  };
  Object.defineProperty(Subscription.prototype, "closed", {
    get: function() {
      return Subscription.isClosed(this);
    },
    configurable: true
  });
  Subscription.isClosed = function(subscription) {
    return subscription.__observer__ === undefined;
  };
  Subscription.wrapCleanup = function(subscription) {
    return function() {
      subscription.unsubscribe();
    };
  };
  Subscription.unsubscribe = function(subscription) {
    if (Subscription.isClosed(subscription)) return;
    subscription.__observer__ = undefined;
    Subscription.cleanup(subscription);
  };
  Subscription.cleanup = function(subscription) {
    var cleanup = subscription.__cleanup__;
    if (!cleanup) return;
    subscription.__cleanup__ = undefined;
    cleanup();
  };
  function Observer(subscription) {
    this.__subscription__ = subscription;
  }
  Observer.prototype = {};
  Object.defineProperty(Observer.prototype, "closed", {
    get: function() {
      return Subscription.isClosed(this.__subscription__);
    },
    configurable: true
  });
  Observer.prototype.next = function(value) {
    return Observer.next(this.__subscription__, value);
  };
  Observer.prototype.error = function(reason) {
    return Observer.error(this.__subscription__, reason);
  };
  Observer.prototype.complete = function(value) {
    return Observer.complete(this.__subscription__, value);
  };
  Observer.SUCCESS = "next";
  Observer.FAILURE = "error";
  Observer.DONE = "complete";
  Observer.next = function(subscription, value) {
    return Observer.handle(subscription, Observer.SUCCESS, value);
  };
  Observer.error = function(subscription, reason) {
    return Observer.handle(subscription, Observer.FAILURE, reason);
  };
  Observer.complete = function(subscription, value) {
    return Observer.handle(subscription, Observer.DONE, value);
  };
  Observer.handle = function(subscription, type, data) {
    if (Subscription.isClosed(subscription) && type === Observer.FAILURE) throw data;
    if (Subscription.isClosed(subscription)) return;
    var observer = subscription.__observer__;
    if (type === Observer.DONE) {
      subscription.__observer__ = undefined;
    }
    try {
      var fn = observer[type];
      if (fn) {
        if (typeof fn !== "function") {
          throw new TypeError(fn + " is not a function");
        }
        data = fn(data);
      } else {
        if (type === Observer.FAILURE) {
          throw data;
        }
        data = undefined;
      }
    } catch (e) {
      try {
        if (type === Observer.SUCCESS) {
          Subscription.unsubscribe(subscription);
        } else {
          Subscription.cleanup(subscription);
        }
      } finally {
        throw e;
      }
    }
    if (type === Observer.DONE || type === Observer.FAILURE) {
      Subscription.unsubscribe(subscription);
      Subscription.cleanup(subscription);
    }
    return data;
  };
  Observable.of = function() {
    var args = Array.prototype.slice.call(arguments);
    return new Observable(function(observer) {
      for (var i = 0; i < args.length; ++i) {
        observer.next(args[i]);
      }
      observer.complete();
    });
  };
  Observable.from = function(obj) {
    if (obj == null) throw new TypeError(obj + " is not an object");
    var method = obj["@@observable"];
    if (typeof method === "function") {
      var observable = method.call(obj);
      if (Object(observable) !== observable) throw new TypeError(observable + " is not an object");
      if (observable.constructor === Observable) return observable;
      return new Observable(function(observer) {
        return observable.subscribe(observer);
      });
    }
    if (typeof obj === "object" && typeof obj.next === "function") {
      return new Observable(function(observer) {
        var n;
        while (!(n = obj.next()).done) {
          observer.next(n.value);
        }
        observer.complete();
      });
    }
    if (Array.isArray(obj)) {
      return new Observable(function(observer) {
        for (var i = 0; i < obj.length; ++i) {
          observer.next(obj[i]);
        }
        observer.complete();
      });
    }
    throw new TypeError(obj + " is not observable");
  };
  function isFunction(fn) {
    return fn && typeof fn === "function";
  }
  function parse(obj) {
    if (obj.length === 1 && Array.isArray(obj[0])) {
      return obj[0];
    } else {
      var args = new Array(obj.length), i = 0;
      while (i < args.length) {
        args[i] = obj[i++];
      }
      return args;
    }
  }
})(Function("return this")());