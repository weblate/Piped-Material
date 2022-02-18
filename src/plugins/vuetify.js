import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'

Vue.use(Vuetify)

export default new Vuetify({
	icons: {
		iconfont: 'mdiSvg'
	},
	theme: {
		// There's apparently a race condition that causes components being rendered shortly before dark mode initialization unable to change to dark mode
		dark: (() => {
			try {
				const preferences = JSON.parse(window.localStorage.getItem('PREFERENCES'))
				return preferences.darkMode
			} catch (e) {
				return false
			}
		})(),
		themes: {
			light: {
				primary: '#458588',
				secondary: '#689d6a',
				accent: '#af3a03',
				error: '#cc241d',
				warning: '#d79921',
				info: '#458588',
				success: '#98971a',

				bgOne: '#fbf1c7',
				bgTwo: '#ebdbb2'
			},
			dark: {
				primary: '#458588',
				secondary: '#689d6a',
				accent: '#af3a03',
				error: '#cc241d',
				warning: '#d79921',
				info: '#458588',
				success: '#98971a',

				bgOne: '#282828',
				bgTwo: '#3c3836'
			}
		}
	}
})
