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
