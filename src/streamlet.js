if (typeof define === 'function' && define.amd) {
	define(Stream)
} else if (typeof module === 'object' && module.exports) {
	module.exports = Stream
	var nextTick = require('subsequent')
} else {
	global.Stream = Stream
	var nextTick = global.nextTick
}