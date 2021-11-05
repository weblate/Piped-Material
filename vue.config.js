module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pwa: {
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
