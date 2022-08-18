const webpack = require('webpack')

module.exports = {
	configureWebpack: {
		resolve: {
			fallback: {
				stream: require.resolve('stream-browserify')
			}
		},
		plugins: [
			new webpack.ProvidePlugin({
				Buffer: ['buffer', 'Buffer']
			})
		]
	},
	transpileDependencies: [
		'vuetify'
	],
	pwa: {
		name: 'Piped Material',
		themeColor: '#efcac3',
		msTileColor: '',
		appleMobileWebAppCapable: 'yes',
		appleMobileWebAppStatusBarStyle: 'black',
		iconPaths: {
			faviconSVG: null
		},

		workboxOptions: {
			cleanupOutdatedCaches: true,
			navigateFallback: 'index.html',
			skipWaiting: true,
			runtimeCaching: [
				{
					urlPattern: /\.(?:png|svg|ico)$/,
					handler: 'CacheFirst'
				}
			]
		}
	},

	productionSourceMap: false,
	lintOnSave: false
}
