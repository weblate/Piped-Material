import DurationUnitFormat from 'intl-unofficial-duration-unit-format'

export const i18nStore = {
	namespaced: true,
	state: () => ({
		fullDateFormatter: null,
		dateFormatter: null,
		fullNumberFormatter: null,
		abbreviatedNumFormatter: null,
		durationFormatter: null,
		timeAgo: null,
		languageFormatter: null,
		collator: null,
		rtl: false
	}),

	mutations: {
		updateState (state, { intlLocale, timeAgo }) {
			const DTFLocale = window.localStorage.getItem('DTF_OVERRIDE') ?? intlLocale
			const NFLocale = window.localStorage.getItem('NF_OVERRIDE') ?? intlLocale

			state.fullDateFormatter = new Intl.DateTimeFormat(DTFLocale, {
				dateStyle: 'full',
				timeStyle: 'full'
			})
			state.dateFormatter = new Intl.DateTimeFormat(DTFLocale, {
				dateStyle: 'long'
			})
			state.fullNumberFormatter = new Intl.NumberFormat(NFLocale, {
				notation: 'standard'
			})
			state.abbreviatedNumFormatter = new Intl.NumberFormat(NFLocale, {
				notation: 'compact',
				compactDisplay: 'long'
			})
			state.languageFormatter = new Intl.DisplayNames([intlLocale, 'en-US'], {
				type: 'language'
			})
			state.durationFormatter = new DurationUnitFormat(intlLocale, {
				style: DurationUnitFormat.styles.NARROW,
				format: '{hours} {minutes} {seconds}'
			})
			state.collator = new Intl.Collator(intlLocale)
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

		fmtFullNumber: state => num => {
			return state.fullNumberFormatter.format(num)
		},
		fmtAbbreviatedNum: state => num => {
			return state.abbreviatedNumFormatter.format(num)
		},

		fmtDuration: state => dur => {
			return state.durationFormatter.format(dur)
		},

		fmtDate: state => dt => {
			return state.dateFormatter.format(dt)
		},

		fmtDateTime: state => dt => {
			return state.fullDateFormatter.format(dt)
		},

		fmtLanguage: state => code => {
			return state.languageFormatter.of(code)
		},

		compare: state => {
			return state.collator.compare
		}
	}
}
