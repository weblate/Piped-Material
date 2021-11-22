module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pwa: {
    name: 'Piped Material',
    themeColor: '#458588',
    msTileColor: '',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    workboxOptions: {
      navigateFallback: 'index.html',
      skipWaiting: true,
      importWorkboxFrom: 'local',
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|svg|ico)$/,
          handler: 'CacheFirst'
        }
      ]
    }
  },

  lintOnSave: false
}
