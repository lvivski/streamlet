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
  function StreamTransformer(source) {
    Stream.call(this);
    source.listen(this.add.bind(this));
  }
  Stream.prototype.map = function(convert) {
    return new MapStream(this, convert);
  };
  function MapStream(source, convert) {
    StreamTransformer.call(this, source);
    this.convert = convert;
  }
  MapStream.prototype = Object.create(Stream.prototype);
  MapStream.prototype.add = function(data) {
    data = this.convert(data);
    Stream.prototype.add.call(this, data);
  };
  Stream.prototype.filter = function(test) {
    return new FilterStream(this, test);
  };
  function FilterStream(source, test) {
    StreamTransformer.call(this, source);
    this.test = test;
  }
  FilterStream.prototype = Object.create(Stream.prototype);
  FilterStream.prototype.add = function(data) {
    if (this.test(data)) Stream.prototype.add.call(this, data);
  };
  Stream.prototype.expand = function(expand) {
    return new ExpandStream(this, expand);
  };
  function ExpandStream(source, expand) {
    StreamTransformer.call(this, source);
    this.expand = expand;
  }
  ExpandStream.prototype = Object.create(Stream.prototype);
  ExpandStream.prototype.add = function(data) {
    data = this.expand(data);
    for (var i in data) {
      Stream.prototype.add.call(this, data[i]);
    }
  };
  Stream.prototype.take = function(count) {
    return new TakeStream(this, count);
  };
  function TakeStream(source, count) {
    StreamTransformer.call(this, source);
    this.count = count;
  }
  TakeStream.prototype = Object.create(Stream.prototype);
  TakeStream.prototype.add = function(data) {
    if (this.count-- > 0) {
      Stream.prototype.add.call(this, data);
    }
  };
  Stream.prototype.skip = function(count) {
    return new SkipStream(this, count);
  };
  function SkipStream(source, count) {
    StreamTransformer.call(this, source);
    this.count = count;
  }
  SkipStream.prototype = Object.create(Stream.prototype);
  SkipStream.prototype.add = function(data) {
    if (this.count-- > 0) return;
    Stream.prototype.add.call(this, data);
  };
  function EventStream(element, event) {
    var stream = new Stream();
    element.addEventListener(event, stream.add.bind(stream), false);
    return stream;
  }
  if (typeof window !== "undefined") {
    window.on = Node.prototype.on = function(event) {
      return new EventStream(this, event);
    };
  }
})(this);