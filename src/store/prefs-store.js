import { isString, set as _set } from 'lodash-es'

const PrefsStore = {
	namespaced: true,
	state: () => ({
		// Default values
		prefs: {
			darkMode: false,
			playerAutoplay: true,
			autoplay: false,
			listen: false,
			disableLBRY: true,
			proxyLBRY: true,
			sponsorblock: true,
			skipToLastPoint: true,
			clickbaitThumbnailAvoidance: false,

			selectedSkip: []
		}
	}),
	mutations: {
		setPrefs (state, {
			id,
			value
		}) {
			_set(state.prefs, id, value)
			window.localStorage.setItem('PREFERENCES', JSON.stringify(state.prefs))
		},

		replacePrefs (state, nextPrefs) {
			state.prefs = nextPrefs
		}
	},
	actions: {
		loadState ({ commit }) {
			try {
				const jv = window.localStorage.getItem('PREFERENCES')
				if (isString(jv) && jv.length !== 0) {
					const p = JSON.parse(jv)
					commit('replacePrefs', p)
				}
			} catch (e) {
				console.log('Error:', e)
			}
		}
	},

	getters: {
		getPreference: state => (id, default_) => {
			const pref = state.prefs[id]
			return pref != null ? pref : default_
		},

		getPreferenceBoolean: (_, getters) => (...args) => {
			const v = getters.getPreference(...args)

			switch (v) {
				case 'true':
				case true:
				case '1':
				case 'on':
				case 'yes':
					return true
				default:
					return false
			}
		},

		getPreferenceNumber: (_, getters) => (id, default_) => {
			const v = getters.getPreference(id, default_)

			const n = Number(v)
			if (!Number.isFinite(n)) {
				return default_
			} else {
				return n
			}
		},

		apiUrl (state, getters) {
			return getters.getPreference('instance', process.env.VUE_APP_PIPED_URL || 'https://pipedapi.kavin.rocks')
		}
	}
}

function initializePrefEvents (store) {
	window.addEventListener('storage', (storageEv) => {
		if (storageEv.key === 'PREFERENCES') {
			store.commit('prefs/replacePrefs', JSON.parse(storageEv.newValue))
		}
	})
}

export {
	PrefsStore,
	initializePrefEvents
}
