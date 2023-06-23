import DurationUnitFormat from 'intl-unofficial-duration-unit-format'

export const i18nStore = {
	namespaced: true,
	state: () => ({
		locale: null,
		parsed: null,

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
		updateState (state, { locale, parsed, timeAgo }) {
			state.locale = locale
			state.parsed = parsed

			state.fullDateFormatter = new Intl.DateTimeFormat(locale, {
				dateStyle: 'full',
				timeStyle: 'full'
			})
			state.dateFormatter = new Intl.DateTimeFormat(locale, {
				dateStyle: 'long'
			})
			state.fullNumberFormatter = new Intl.NumberFormat(locale, {
				notation: 'standard'
			})
			state.abbreviatedNumFormatter = new Intl.NumberFormat(locale, {
				notation: 'compact',
				compactDisplay: 'long'
			})
			state.languageFormatter = new Intl.DisplayNames([locale, 'en-US'], {
				type: 'language'
			})
			state.durationFormatter = new DurationUnitFormat(locale, {
				style: DurationUnitFormat.styles.NARROW,
				format: '{hours} {minutes} {seconds}'
			})
			state.collator = new Intl.Collator(locale)
			state.timeAgo = timeAgo

			switch (parsed.script) {
				case 'Arab':
				case 'Aran':
					state.rtl = true
					break
				default:
					state.rtl = false
					break
			}

			/* Doesn't work right now for unknown reasons
			 * switch (parsed.textInfo) {
				case 'rtl':
					state.rtl = true
					break
				case 'ltr':
				default:
					state.rtl = false
					break
			} */
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
