import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'

import { isString } from 'lodash-es'
import { COLOR_SCHEME_STATES } from '@/store/prefs-store'

Vue.use(Vuetify)

export default new Vuetify({
	icons: {
		iconfont: 'mdiSvg'
	},
	theme: {
		// There's apparently a race condition that causes components being rendered shortly before dark mode initialization unable to change to dark mode
		dark: (() => {
			const autoValue = window.matchMedia('(prefers-color-scheme: dark)').matches

			// Partly duplicated in App.vue
			try {
				const LSValue = window.localStorage.getItem('COLOR_SCHEME')
				if (isString(LSValue) && LSValue.length !== 0) {
					const state = JSON.parse(LSValue)
					switch (state) {
						case COLOR_SCHEME_STATES.SYSTEM:
							return autoValue
						case COLOR_SCHEME_STATES.DARK:
							return true
						case COLOR_SCHEME_STATES.LIGHT:
							return false
					}
				} else {
					return autoValue
				}
			} catch (e) {
				// Auto by default
				return autoValue
			}
		})(),
		themes: {
			light: {
				primary: '#2e5d62',
				secondary: '#eb7399',
				accent: '#c3efca',
				error: '#ec4734',
				warning: '#e8efc3',
				info: '#c3e8ef',
				success: '#efc3d2',

				bgOne: '#FAFAFA',
				bgTwo: '#ECEFF1'
			},
			dark: {
				primary: '#5c6bc0',
				secondary: '#5c9dc0',
				accent: '#7f5cc0',
				error: '#c05c6b',
				warning: '#e8dd7b',
				info: '#3949ab',
				success: '#b15cc0',

				bgOne: '#212121',
				bgTwo: '#424242'
			}
		}
	}
})
