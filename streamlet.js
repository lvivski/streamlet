(function(global) {
  "use strict";
  var nextTick;
  if (typeof define === "function" && define.amd) {
    define([ "subsequent" ], function(subsequent) {
      nextTick = subsequent;
      return Observable;
    });
  } else if (typeof module === "object" && module.exports) {
    module.exports = Observable;
    nextTick = require("subsequent");
  } else {
    global.Streamlet = Observable;
    nextTick = global.subsequent;
  }
  function Observable(fn) {
    this.__listeners__ = [];
    if (arguments.length > 0) {
      var controller = new Controller(this);
      if (typeof fn == "function") {
        try {
          fn(function(val) {
            controller.next(val);
          }, function(err) {
            controller.fail(err);
          }, function() {
            controller.done();
          });
        } catch (e) {
          controller.fail(e);
        }
      }
    }
  }
  Observable.prototype.isDone = false;
  Observable.prototype.isSync = false;
  Observable.prototype.listen = function(onNext, onFail, onDone) {
    if (this.isDone) return;
    var listeners = this.__listeners__, listener = {
      next: onNext,
      fail: onFail,
      done: onDone
    };
    listeners.push(listener);
    return function() {
      var index = (listeners || []).indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  };
  Observable.prototype.transform = function(transformer) {
    var controller = Observable.control(this.isSync);
    this.listen(transformer(controller), function(reason) {
      controller.fail(reason);
    }, function() {
      controller.done();
    });
    return controller.stream;
  };
  Observable.prototype.pipe = function(stream) {
    var controller = new Controller(stream);
    this.listen(function(data) {
      controller.next(data);
    }, function(reason) {
      controller.fail(reason);
    }, function() {
      controller.done();
    });
    return stream;
  };
  function Controller(stream) {
    this.stream = stream;
  }
  Controller.NEXT = "next";
  Controller.FAIL = "fail";
  Controller.DONE = "done";
  Controller.prototype.add = Controller.prototype.next = function(data) {
    this.update(Controller.NEXT, data);
  };
  Controller.prototype.fail = function(reason) {
    this.update(Controller.FAIL, reason);
  };
  Controller.prototype.done = function() {
    this.update(Controller.DONE);
  };
  Controller.prototype.update = function(type, data) {
    var stream = this.stream;
    if (stream.isDone) return;
    if (stream.isSync) {
      Controller.handle(stream.__listeners__, type, data);
    } else {
      delay(Controller.handle, stream.__listeners__, type, data);
    }
    if (type === Controller.DONE) {
      stream.isDone = true;
      stream.__listeners__ = undefined;
    }
  };
  Controller.handle = function(listeners, type, data) {
    if (!listeners.length) return;
    var i = 0;
    while (i < listeners.length) {
      var listener = listeners[i++], fn = listener[type], fail = listener.fail;
      if (isFunction(fn)) {
        try {
          fn(data);
        } catch (e) {
          if (isFunction(fail)) {
            fail(e);
          }
        }
      }
    }
  };
  Observable.prototype["catch"] = function(onFail) {
    return this.listen(null, onFail);
  };
  Observable.prototype.end = function(onDone) {
    return this.listen(null, null, onDone);
  };
  Observable.prototype.map = function(convert) {
    return this.transform(function(controller) {
      return function(data) {
        data = convert(data);
        controller.add(data);
      };
    });
  };
  Observable.prototype.filter = function(test) {
    return this.transform(function(controller) {
      return function(data) {
        if (!test(data)) return;
        controller.add(data);
      };
    });
  };
  Observable.prototype.skip = function(count) {
    return this.transform(function(controller) {
      return function(data) {
        if (count-- > 0) return;
        controller.add(data);
      };
    });
  };
  Observable.prototype.skipWhile = function(test) {
    return this.transform(function(controller) {
      return function(data) {
        if (test(data)) return;
        controller.add(data);
      };
    });
  };
  Observable.prototype.skipDuplicates = function(compare, seed) {
    compare || (compare = function(a, b) {
      return a === b;
    });
    return this.transform(function(controller) {
      return function(data) {
        if (compare(data, seed)) return;
        controller.add(seed = data);
      };
    });
  };
  Observable.prototype.take = function(count) {
    return this.transform(function(controller) {
      return function(data) {
        if (count-- > 0) {
          controller.add(data);
        } else {
          controller.done();
        }
      };
    });
  };
  Observable.prototype.takeWhile = function(test) {
    return this.transform(function(controller) {
      return function(data) {
        if (test(data)) {
          controller.add(data);
        } else {
          controller.done();
        }
      };
    });
  };
  Observable.prototype.expand = function(expand) {
    return this.transform(function(controller) {
      return function(data) {
        data = expand(data);
        for (var i in data) {
          controller.add(data[i]);
        }
      };
    });
  };
  Observable.prototype.scan = function(combine, seed) {
    return this.transform(function(controller) {
      return function(data) {
        if (seed != null) {
          data = combine(seed, data);
        }
        controller.add(seed = data);
      };
    });
  };
  Observable.prototype.merge = function(streamTwo) {
    return Observable.merge(this, streamTwo);
  };
  Observable.control = function(isSync) {
    var observable = new Observable();
    observable.isSync = isSync;
    return new Controller(observable);
  };
  Observable.fromEvent = function(element, eventName) {
    var observable = new Observable(function(next) {
      element.addEventListener(eventName, next, false);
    });
    observable.isSync = true;
    return observable;
  };
  Observable.merge = function(streams) {
    streams = parse(arguments);
    var isSync = streams[0].isSync, controller = Observable.control(isSync), listener = function(data) {
      controller.add(data);
    };
    var i = 0;
    while (i < streams.length) {
      streams[i++].listen(listener);
    }
    return controller.stream;
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
  function delay(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    nextTick(function() {
      fn.apply(null, args);
    });
  }
})(this);