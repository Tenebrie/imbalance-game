export default {
	injectPolyfills(): void {
		Object.defineProperty(Array.prototype, 'flat', {
			value: function(depth = 1) {
				return this.reduce(function (flat, toFlatten) {
					return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten)
				}, [])
			}
		})

		Object.defineProperty(Array.prototype, 'sum', {
			value: function(depth = 1) {
				return this.reduce((total, value) => total + value, 0)
			}
		})
	}
}
