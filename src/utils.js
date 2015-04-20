function isFunction(fn) {
	return fn && typeof fn === 'function'
}

function parse(obj) {
	if  (obj.length === 1 && Array.isArray(obj[0])) {
		return obj[0]
	} else {
		var args = new Array(obj.length);
		for(var i = 0; i < args.length; ++i) {
			args[i] = obj[i]
		}
		return args
	}
}

function handle(listeners, data, handleDone) {
	var i = 0
	while (i < listeners.length) {
		var listener = listeners[i++],
			update = listener.update,
			done = listener.done

		if (handleDone) {
			if (isFunction(done)) {
				done()
			}
		} else {
			update(data)
		}
	}
}

function async(fn) {
	var args = Array.prototype.slice.call(arguments, 1)
	nextTick(function () {
		fn.apply(null, args)
	})
}
