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
				target: 'http://gaia:3000',
			},
			'/assets': {
				target: 'http://gaia:3000',
			},
			'/changelog': {
				target: 'http://gaia:3000',
			},
			'/stylesheets': {
				target: 'http://gaia:3000',
			},
		},
	},
}
