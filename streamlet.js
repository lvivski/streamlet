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
  function Stream() {
    this.__listeners__ = [];
    this.isDone = false;
  }
  Stream.prototype.add = function(data) {
    if (this.isDone) return;
    async(handle, this.__listeners__, data);
  };
  Stream.prototype.done = function() {
    if (this.isDone) return;
    this.isDone = true;
    async(handle, this.__listeners__, null, true);
    this.__listeners__ = undefined;
  };
  Stream.prototype.listen = function(onUpdate, onDone) {
    if (this.isDone) return;
    var listeners = this.__listeners__, listener = {
      update: onUpdate,
      done: onDone
    };
    listeners.push(listener);
    return function() {
      var index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  };
  Stream.prototype.transform = function(transformer) {
    var stream = new this.constructor();
    this.listen(transformer(stream));
    return stream;
  };
  Stream.prototype.map = function(convert) {
    return this.transform(function(stream) {
      return function(data) {
        data = convert(data);
        stream.add(data);
      };
    });
  };
  Stream.prototype.filter = function(test) {
    return this.transform(function(stream) {
      return function(data) {
        if (test(data)) stream.add(data);
      };
    });
  };
  Stream.prototype.skip = function(count) {
    return this.transform(function(stream) {
      return function(data) {
        if (count-- > 0) {
          stream.done();
        } else {
          stream.add(data);
        }
      };
    });
  };
  Stream.prototype.take = function(count) {
    return this.transform(function(stream) {
      return function(data) {
        if (count-- > 0) {
          stream.add(data);
        } else {
          stream.done();
        }
      };
    });
  };
  Stream.prototype.expand = function(expand) {
    return this.transform(function(stream) {
      return function(data) {
        data = expand(data);
        for (var i in data) {
          stream.add(data[i]);
        }
      };
    });
  };
  Stream.prototype.merge = function(streamTwo) {
    return Stream.merge(this, streamTwo);
  };
  Stream.merge = function(streams) {
    streams = parse(streams);
    var stream = new Stream(), listener = function(data) {
      stream.add(data);
    };
    if (!streams.length) return stream;
    var i = 0;
    while (i < streams.length) {
      streams[i++].listen(listener);
    }
    return stream;
  };
  function SyncStream() {
    Stream.call(this);
  }
  SyncStream.prototype = Object.create(Stream.prototype);
  SyncStream.prototype.constructor = SyncStream;
  SyncStream.prototype.add = function(data) {
    if (this.isDone) return;
    handle(this.__listeners__, data);
  };
  SyncStream.prototype.done = function() {
    if (this.isDone) return;
    this.isDone = true;
    handle(this.__listeners__, null, true);
    this.__listeners__ = undefined;
  };
  function EventStream(element, event) {
    var stream = new SyncStream();
    element.addEventListener(event, function(e) {
      stream.add(e);
    }, false);
    return stream;
  }
  if (typeof window !== "undefined") {
    window.on = Node.prototype.on = function(event) {
      return new EventStream(this, event);
    };
  }
  function isFunction(fn) {
    return fn && typeof fn === "function";
  }
  function parse(obj) {
    if (obj.length === 1 && Array.isArray(obj[0])) {
      return obj[0];
    } else {
      var args = new Array(obj.length);
      for (var i = 0; i < args.length; ++i) {
        args[i] = obj[i];
      }
      return args;
    }
  }
  function handle(listeners, data, handleDone) {
    var i = 0;
    while (i < listeners.length) {
      var listener = listeners[i++], update = listener.update, done = listener.done;
      if (handleDone) {
        if (isFunction(done)) {
          done();
        }
      } else {
        update(data);
      }
    }
  }
  function async(fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    nextTick(function() {
      fn.apply(null, args);
    });
  }
})(this);