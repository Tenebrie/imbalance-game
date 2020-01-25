module.exports = {
	devServer: {
		publicPath: '/',
		proxy: {
			'/api': {
				logLevel: 'debug',
				target: 'http://localhost:3000'
			}
		}
	}
}
