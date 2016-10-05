defineMethod(Observable, 'of', function of() {
	var args = Array.prototype.slice.call(arguments)
	return new Observable(function (observer) {
		for (var i = 0; i < args.length; ++i) {
			observer.next(args[i])
		}
		observer.complete()
	})
})

defineMethod(Observable, 'from', function from(obj) {
	if (obj == null)
		throw new TypeError(obj + ' is not an object')

	var method = obj['@@observable'];

	if (typeof method === 'function') {

		var observable = method.call(obj);

		if (Object(observable) !== observable)
			throw new TypeError(observable + ' is not an object')

		if (observable.constructor === Observable)
			return observable

		return new Observable(function (observer) {
			return observable.subscribe(observer)
		})
	}

	if (typeof obj === 'object' && typeof obj.next === 'function') {
		return new Observable(function(observer) {
			var n
			while (!(n = obj.next()).done) {
				observer.next(n.value)
			}
			observer.complete()
		});
	}

	if (Array.isArray(obj)) {
		return new Observable(function (observer) {
			for (var i = 0; i < obj.length; ++i) {
				observer.next(obj[i])
			}
			observer.complete()
		})
	}

	throw new TypeError(obj + ' is not observable')
})
