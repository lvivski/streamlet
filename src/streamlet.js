var nextTick
if (typeof define === 'function' && define.amd) {
	define(['subsequent'], function (subsequent) {
		nextTick = subsequent
		return Observable
	})
} else if (typeof module === 'object' && module.exports) {
	module.exports = Observable
	nextTick = require('subsequent')
} else {
	root.Streamlet = Observable
	nextTick = root.subsequent
}
