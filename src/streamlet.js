var nextTick
if (typeof define === 'function' && define.amd) {
	define(['subsequent'], function (subsequent) {
		nextTick = subsequent
		return Stream
	})
} else if (typeof module === 'object' && module.exports) {
	module.exports = Stream
	nextTick = require('subsequent')
} else {
	global.Streamlet = Stream
	nextTick = global.subsequent
}
