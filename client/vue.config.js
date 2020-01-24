module.exports = {
	devServer: {
		proxy: {
			'/': {
//				logLevel: 'debug',
				target: 'http://localhost:3000'
			}
		}
	}
}
