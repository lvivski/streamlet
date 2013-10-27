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
    return new MapStream(this, convert);
  };
  function MapStream(source, convert) {
    Stream.call(this);
    source.listen(function(data) {
      data = convert(data);
      this.add(data);
    }.bind(this));
  }
  MapStream.prototype = Object.create(Stream.prototype);
  Stream.prototype.filter = function(test) {
    return new FilterStream(this, test);
  };
  function FilterStream(source, test) {
    Stream.call(this);
    source.listen(function(data) {
      if (test(data)) this.add(data);
    }.bind(this));
  }
  FilterStream.prototype = Object.create(Stream.prototype);
  Stream.prototype.expand = function(expand) {
    return new ExpandStream(this, expand);
  };
  function ExpandStream(source, expand) {
    Stream.call(this);
    source.listen(function(data) {
      data = expand(data);
      for (var i in data) {
        this.add(data[i]);
      }
    }.bind(this));
  }
  ExpandStream.prototype = Object.create(Stream.prototype);
  Stream.prototype.take = function(count) {
    return new TakeStream(this, count);
  };
  function TakeStream(source, count) {
    Stream.call(this);
    source.listen(function(data) {
      if (count-- > 0) {
        this.add(data);
      }
    }.bind(this));
  }
  TakeStream.prototype = Object.create(Stream.prototype);
  Stream.prototype.skip = function(count) {
    return new SkipStream(this, count);
  };
  function SkipStream(source, count) {
    Stream.call(this);
    source.listen(function(data) {
      if (count-- > 0) return;
      this.add(data);
    }.bind(this));
  }
  SkipStream.prototype = Object.create(Stream.prototype);
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