import Vue from 'vue'
import App from './App.vue'

import '@mdi/font/css/materialdesignicons.min.css'
import '@/styles/main.scss'

import { i18n, i18nInitialized } from '@/plugins/i18n'
import vuetify from '@/plugins/vuetify'
import store from '@/store'
import router from '@/router'

import './registerServiceWorker'

Vue.config.productionTip = false

i18nInitialized.then(() => {
	new Vue({
		vuetify,
		i18n,
		store,
		router,
		render: h => h(App)
	}).$mount('#app')
})
