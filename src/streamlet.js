var next
if (typeof define === 'function' && define.amd) {
	define(['subsequent'], function (subsequent) {
		next = subsequent
		return Stream
	})
} else if (typeof module === 'object' && module.exports) {
	module.exports = Stream
	next = require('subsequent')
} else {
	global.Streamlet = Stream
	next = global.subsequent
}
