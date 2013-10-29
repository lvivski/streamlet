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
	if (count-- > 0) return;
	stream.add(data);
      };
    });
  };
  Stream.prototype.take = function(count) {
    return this.transform(function(stream) {
      return function(data) {
	if (count-- > 0) {
	  stream.add(data);
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
  function SyncStream() {
    Stream.call(this);
  }
  SyncStream.prototype = Object.create(Stream.prototype);
  SyncStream.prototype.constructor = SyncStream;
  SyncStream.prototype.add = function(data) {
    for (var i = 0; i < this.listeners.length; ++i) {
      this.listeners[i].call(null, data);
    }
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
})(this);