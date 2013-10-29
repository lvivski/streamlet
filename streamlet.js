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
    global.Stream = Stream;
    nextTick = global.nextTick;
  }
  function Stream() {
    this.listeners = [];
  }
  function handle(listener, data) {
    nextTick(function() {
      listener(data);
    });
  }
  Stream.prototype.add = function(data) {
    for (var i = 0; i < this.listeners.length; ++i) {
      handle(this.listeners[i], data);
    }
  };
  Stream.prototype.listen = function(listener) {
    this.listeners.push(listener);
  };
  Stream.prototype.map = function(convert) {
    var stream = new Stream();
    this.listen(function(data) {
      data = convert(data);
      stream.add(data);
    });
    return stream;
  };
  Stream.prototype.filter = function(test) {
    var stream = new Stream();
    this.listen(function(data) {
      if (test(data)) stream.add(data);
    });
    return stream;
  };
  Stream.prototype.skip = function(count) {
    var stream = new Stream();
    this.listen(function(data) {
      if (count-- > 0) return;
      this.add(data);
    });
    return stream;
  };
  Stream.prototype.take = function(count) {
    var stream = new Stream();
    this.listen(function(data) {
      if (count-- > 0) {
        stream.add(data);
      }
    });
    return stream;
  };
  Stream.prototype.expand = function(expand) {
    var stream = new Stream();
    this.listen(function(data) {
      data = expand(data);
      for (var i in data) {
        stream.add(data[i]);
      }
    });
    return stream;
  };
  function EventStream(element, event, constrains) {
    var stream = new Stream();
    element.addEventListener(event, function(e) {
      if (Event.PREVENT & constrains) e.preventDefault();
      if (Event.STOP & constrains) e.stopPropagation();
      stream.add(e);
    }, false);
    return stream;
  }
  if (typeof window !== "undefined") {
    Event.PREVENT = 1;
    Event.STOP = 2;
    window.on = Node.prototype.on = function(event, constrains) {
      return new EventStream(this, event, constrains);
    };
  }
})(this);