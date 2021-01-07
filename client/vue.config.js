const path = require('path')

module.exports = {
	configureWebpack: {
		resolve: {
			alias: {
				'@shared': path.resolve(__dirname, '../shared/src/'),
			},
		},
	},
	chainWebpack: (config) => {
		// remove vue-cli-service's progress output
		config.plugins.delete('progress')
	},
	devServer: {
		publicPath: '/',
		proxy: {
			'/api': {
				// logLevel: 'debug',
				target: 'http://server:3000',
			},
			'/assets': {
				// logLevel: 'debug',
				target: 'http://server:3000',
			},
			'/changelog': {
				// logLevel: 'debug',
				target: 'http://server:3000',
			},
			'/stylesheets': {
				// logLevel: 'debug',
				target: 'http://server:3000',
			},
		},
	},
}
