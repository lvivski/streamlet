function isFunction(fn) {
	return fn && typeof fn === 'function'
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