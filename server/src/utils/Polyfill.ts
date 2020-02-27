export default {
	injectPolyfills(): void {
		Object.defineProperty(Array.prototype, 'flat', {
			value: function(depth = 1) {

			}
		})

		Object.defineProperty(Array.prototype, 'sum', {
			value: function(depth = 1) {
				return this.reduce((total, value) => total + value, 0)
			}
		})
	}
}
