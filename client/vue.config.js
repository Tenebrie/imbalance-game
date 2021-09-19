const path = require('path')

module.exports = {
	outputDir: path.resolve(__dirname, 'dist'),
	configureWebpack: {
		resolve: {
			alias: {
				'@shared': path.resolve(__dirname, '../shared/src/'),
			},
		},
		output: {
			pathinfo: false,
		},
	},
	devServer: {
		publicPath: '/',
		progress: false,
		proxy: {
			'/api': {
				// logLevel: 'debug',
				target: 'http://gaia:3000',
			},
			'/assets': {
				// logLevel: 'debug',
				target: 'http://gaia:3000',
			},
			'/changelog': {
				// logLevel: 'debug',
				target: 'http://gaia:3000',
			},
			'/stylesheets': {
				// logLevel: 'debug',
				target: 'http://gaia:3000',
			},
		},
	},
}
