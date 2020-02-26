module.exports = {
	devServer: {
		publicPath: '/',
		proxy: {
			'/api': {
				// logLevel: 'debug',
				target: 'http://localhost:3000'
			},
			'/changelog': {
				// logLevel: 'debug',
				target: 'http://localhost:3000'
			},
			'/stylesheets': {
				// logLevel: 'debug',
				target: 'http://localhost:3000'
			}
		}
	}
}
