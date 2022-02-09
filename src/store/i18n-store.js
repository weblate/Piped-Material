export const i18nStore = {
	namespaced: true,
	state: () => ({
		fullFormatter: null,
		dateFormatter: null,
		NF: null,
		timeAgo: null,
		rtl: false
	}),

	mutations: {
		updateState (state, { intlLocale, timeAgo }) {
			state.fullFormatter = new Intl.DateTimeFormat(window.localStorage.getItem('DTF_OVERRIDE') || intlLocale, {
				dateStyle: 'full',
				timeStyle: 'full'
			})
			state.dateFormatter = new Intl.DateTimeFormat(window.localStorage.getItem('DTF_OVERRIDE') || intlLocale, {
				dateStyle: 'long'
			})
			state.NF = new Intl.NumberFormat(window.localStorage.getItem('NF_OVERRIDE') || intlLocale)
			state.timeAgo = timeAgo

			switch (intlLocale) {
				case 'ar':
				case 'ckb':
					state.rtl = true
					break
				default:
					state.rtl = false
					break
			}
		}
	},

	getters: {
		fmtRelative: state => time => {
			return state.timeAgo.format(time)
		},

		fmtNumber: state => num => {
			return state.NF.format(num)
		},

		fmtDate: state => dt => {
			return state.dateFormatter.format(dt)
		},

		fmtDateTime: state => dt => {
			return state.fullFormatter.format(dt)
		}
	}
}
