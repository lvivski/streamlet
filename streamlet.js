(function(global) {
  "use strict";
  var nextTick;
  if (typeof define === "function" && define.amd) {
    define([ "subsequent" ], function(subsequent) {
      nextTick = subsequent;
      return Stream;
    });
  } else if (typeof module === "object" && module.exports) {
    module.exports = Stream;
    nextTick = require("subsequent");
  } else {
    global.Streamlet = Stream;
    nextTick = global.subsequent;
  }
  function Stream(fn) {
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
      } else if (fn) {
        this.isSync = true;
      }
    }
  }
  Stream.prototype.isDone = false;
  Stream.prototype.isSync = false;
  Stream.prototype.listen = function(onNext, onFail, onDone) {
    if (this.isDone) return;
    var listeners = this.__listeners__, listener = {
      next: onNext,
      fail: onFail,
      done: onDone
    };
    listeners.push(listener);
    return function() {
      var index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };
  Stream.prototype.transform = function(transformer) {
    var controller = new Controller(new Stream(this.isSync));
    this.listen(transformer(controller), function(reason) {
      controller.fail(reason);
    }, function() {
      controller.done();
    });
    return controller.stream;
  };
  Stream.prototype.map = function(convert) {
    return this.transform(function(controller) {
      return function(data) {
        data = convert(data);
        controller.add(data);
      };
    });
  };
  Stream.prototype.filter = function(test) {
    return this.transform(function(controller) {
      return function(data) {
        if (test(data)) controller.add(data);
      };
    });
  };
  Stream.prototype.skip = function(count) {
    return this.transform(function(controller) {
      return function(data) {
        if (count-- > 0) {
          controller.done();
        } else {
          controller.add(data);
        }
      };
    });
  };
  Stream.prototype.take = function(count) {
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
  Stream.prototype.expand = function(expand) {
    return this.transform(function(controller) {
      return function(data) {
        data = expand(data);
        for (var i in data) {
          controller.add(data[i]);
        }
      };
    });
  };
  Stream.prototype.merge = function(streamTwo) {
    return Stream.merge(this, streamTwo);
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
          } else {
            throw e;
          }
        }
      }
    }
  };
  Stream.create = function(isSync) {
    return new Controller(new Stream(isSync));
  };
  Stream.merge = function(streams) {
    streams = parse(streams);
    var controller = new Controller(new Stream()), listener = function(data) {
      controller.add(data);
    };
    var i = 0;
    while (i < streams.length) {
      streams[i++].listen(listener);
    }
    return controller.stream;
  };
  function EventStream(element, event) {
    var controller = Stream.create(true);
    element.addEventListener(event, function(e) {
      controller.add(e);
    }, false);
    return controller.stream;
  }
  if (typeof window === "object") {
    window.on = function(event) {
      return new EventStream(this, event);
    };
    if (typeof Node === "object") {
      Node.prototype.on = window.on;
    }
  }
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