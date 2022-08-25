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
				primary: '#455A64',
				secondary: '#5D4037',
				accent: '#651FFF',
				error: '#651FFF',
				warning: '#FFC400',
				info: '#8D6E63',
				success: '#00E676',

				bgOne: '#FAFAFA',
				bgTwo: '#ECEFF1'
			},
			dark: {
				primary: '#78909C',
				secondary: '#8D6E63',
				accent: '#FF1744',
				error: '#651FFF',
				warning: '#FFC400',
				info: '#8D6E63',
				success: '#00E676',

				bgOne: '#212121',
				bgTwo: '#424242'
			}
		}
	}
})
