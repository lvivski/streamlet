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
    if (!isFunction(subscriber)) {
      throw new TypeError("Observable initializer must be a function");
    }
    this.__subscriber__ = subscriber;
  }
  defineMethod(Observable.prototype, "@@observable", function $$observable() {
    return this;
  });
  defineMethod(Observable.prototype, "subscribe", function subscribe(observer) {
    if (isFunction(observer)) {
      var args = Array.prototype.slice.call(arguments, 1);
      observer = {
        next: observer,
        error: args[0],
        complete: args[1]
      };
    }
    return new Subscription(observer, this.__subscriber__);
  });
  Observable.prototype.forEach = function(fn) {
    var self = this;
    return new Promise(function(resolve, reject) {
      if (!isFunction(fn)) {
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
  Observable.prototype.transform = function(transformer) {
    var self = this;
    return new Observable(function(observer) {
      return self.subscribe(transformer(observer), function(error) {
        return observer.error(error);
      }, function(value) {
        return observer.complete(value);
      });
    });
  };
  function Subscription(observer, subscriber) {
    if (!isObject(observer)) {
      throw new TypeError("Observer must be an object");
    }
    this.__observer__ = observer;
    this.__cleanup__ = undefined;
    if (isFunction(observer.start)) {
      observer.start(this);
      if (Subscription.isClosed(this)) return;
    }
    observer = new Observer(this);
    try {
      var cleanup;
      if (subscriber.length > 1) {
        cleanup = subscriber(function(value) {
          return observer.next(value);
        }, function(error) {
          return observer.error(error);
        }, function(value) {
          return observer.complete(value);
        });
      } else {
        cleanup = subscriber(observer);
      }
      if (cleanup != null) {
        if (isFunction(cleanup.unsubscribe)) {
          cleanup = Subscription.wrapCleanup(cleanup);
        } else {
          ensureFunction(cleanup || 1);
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
  defineMethod(Subscription.prototype, "unsubscribe", function unsubscribe() {
    Subscription.unsubscribe(this);
  });
  defineProperty(Subscription.prototype, "closed", function closed() {
    return Subscription.isClosed(this);
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
  defineProperty(Observer.prototype, "closed", function closed() {
    return Subscription.isClosed(this.__subscription__);
  });
  defineMethod(Observer.prototype, "next", function next(value) {
    return Observer.next(this.__subscription__, value);
  });
  defineMethod(Observer.prototype, "error", function error(reason) {
    return Observer.error(this.__subscription__, reason);
  });
  defineMethod(Observer.prototype, "complete", function complete(value) {
    return Observer.complete(this.__subscription__, value);
  });
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
    if (Subscription.isClosed(subscription)) {
      if (type === Observer.FAILURE) throw data;
      return;
    }
    var observer = subscription.__observer__;
    if (type === Observer.DONE || type === Observer.FAILURE) {
      subscription.__observer__ = undefined;
    }
    try {
      var fn = ensureFunction(observer[type]);
      if (fn) {
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
      Subscription.cleanup(subscription);
    }
    return data;
  };
  defineMethod(Observable, "of", function of() {
    var args = Array.prototype.slice.call(arguments);
    var Constructor = isFunction(this) ? this : Observable;
    return new Constructor(function(observer) {
      for (var i = 0; i < args.length; ++i) {
        observer.next(args[i]);
      }
      observer.complete();
    });
  });
  defineMethod(Observable, "from", function from(obj) {
    if (!isObject(obj)) throw new TypeError(obj + " is not an object");
    var Constructor = isFunction(this) ? this : Observable;
    var method = ensureFunction(obj["@@observable"]);
    if (method) {
      var observable = method.call(obj);
      if (Object(observable) !== observable) throw new TypeError(observable + " is not an object");
      if (observable.constructor === Constructor) return observable;
      return new Constructor(function(observer) {
        return observable.subscribe(observer);
      });
    }
    if (isObject(obj) && isFunction(obj.next)) {
      return new Constructor(function(observer) {
        var n;
        while (!(n = obj.next()).done) {
          observer.next(n.value);
        }
        observer.complete();
      });
    }
    if (Array.isArray(obj)) {
      return new Constructor(function(observer) {
        for (var i = 0; i < obj.length; ++i) {
          observer.next(obj[i]);
        }
        observer.complete();
      });
    }
    throw new TypeError(obj + " is not observable");
  });
  function isFunction(fn) {
    return typeof fn === "function";
  }
  function isObject(obj) {
    return obj && typeof obj === "object";
  }
  function ensureFunction(fn) {
    if (fn && !isFunction(fn)) {
      throw new TypeError(fn + " is not a function");
    }
    return fn;
  }
  function defineProperty(obj, propName, getter) {
    Object.defineProperty(obj, propName, {
      get: getter,
      enumerable: false,
      configurable: true
    });
  }
  function defineMethod(obj, methodName, fn) {
    Object.defineProperty(obj, methodName, {
      value: fn,
      writable: true,
      enumerable: false,
      configurable: true
    });
  }
})(Function("return this")());