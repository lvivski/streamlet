function isFunction(fn) {
	return typeof fn === 'function'
}

function isObject(obj) {
	return obj && typeof obj === 'object'
}

function ensureFunction(fn) {
	if(fn && !isFunction(fn)) {
		throw new TypeError(fn + ' is not a function')
	}
	return fn
}

function defineProperty(obj, propName, getter) {
	Object.defineProperty(obj, propName, {
		get: getter,
		enumerable: false,
		configurable: true
	})
}

function defineMethod(obj, methodName, fn) {
	Object.defineProperty(obj, methodName, {
		value: fn,
		writable: true,
		enumerable: false,
		configurable: true
	})
}