// var Promise
if (typeof define === 'function' && define.amd) {
	define(['davy'], function (Davy) {
		// Promise = Davy
		return Observable
	})
} else if (typeof module === 'object' && module.exports) {
	module.exports = Observable
	// Promise = require('davy')
} else {
	root.Streamlet = Observable
	// Promise = root.Davy
}
