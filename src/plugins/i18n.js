import Vue from 'vue'
import VueI18n from 'vue-i18n'
import TimeAgo from 'javascript-time-ago'
import * as LocaleMatcher from '@formatjs/intl-localematcher'

import store from '@/store'
import ENTranslations from '@/translations/en.json'

Vue.use(VueI18n)

const messages = {
	en: ENTranslations
}

export const SUPPORTED_LANGUAGES = [
	'az',
	'en',
	'fr',
	'de',
	'el',
	'es',
	'id',
	'zh-Hans',
	'zh-Hant',
	'cs',
	'ja',
	'ko',
	'ru',
	'lt',
	'ml',
	'nb-NO',
	'tr',
	'pt-BR',
	'bn-Beng',
	'ar',
	'ckb',
	'hr',
	'nl',
	'sr',
	'bs'
]

export const i18n = new VueI18n({
	locale: 'en', // set default locale
	fallbackLocale: 'en',
	messages
})

export const TIME_AGO_EXCEPTIONS = {
	'bn-Beng': 'bn',
	'bn-Latn': 'bn',
	'nb-NO': 'nb',
	'zh-Hans': 'zh',
	ckb: 'ku',
	'pt-BR': 'pt'
}

export const COUNTRY_I18N_EXCEPTIONS = {
	'bn-Beng': 'bn',
	'bn-Latn': 'bn',
	ckb: 'ku',
	'nb-NO': 'nb',
	'zh-Hant': 'zh',
	'zh-Hans': 'zh',
	'pt-BR': 'pt'
}

// Similar switches for RTL can be found in the i18n store
async function syncStylesPerLanguage (locale) {
	switch (locale) {
		// All the Inter-based languages
		case 'az':
		case 'cs':
		case 'de':
		case 'en':
		case 'el':
		case 'es':
		case 'id':
		case 'fr':
		case 'lt':
		case 'ml':
		case 'tr':
		case 'pt-BR':
		case 'ru':
		case 'hr':
		case 'nb-NO':
		case 'bn-Latn':
		case 'nl':
		case 'sr':
		case 'bs':
			// Don't need to import fonts because Inter supports Latin and Cyrillic and is always loaded
			document.body.classList.remove(...document.body.classList)
			document.body.classList.add('default-font')
			break
		// Bengali script
		case 'bn-Beng':
			await import('@fontsource/baloo-da-2/bengali.css')
			document.body.classList.remove(...document.body.classList)
			document.body.classList.add('bengali')
			break
		// Other languages
		// NOTE: if you are a native speaker & want to see a different font, just email me or join the channel
		case 'ar':
		case 'ckb':
			await import('@fontsource/noto-naskh-arabic/arabic.css')
			document.body.classList.remove(...document.body.classList)
			document.body.classList.add('arabic-script')
			break
		case 'zh-Hant':
			await import('@fontsource/noto-sans-tc/chinese-traditional.css')
			document.body.classList.remove(...document.body.classList)
			document.body.classList.add('traditional-chinese')
			break
		case 'zh-Hans':
			await import('@fontsource/noto-sans-sc/chinese-simplified.css')
			document.body.classList.remove(...document.body.classList)
			document.body.classList.add('simplified-chinese')
			break
		case 'ja':
			await import('@fontsource/noto-sans-jp/japanese.css')
			document.body.classList.remove(...document.body.classList)
			document.body.classList.add('japanese')
			break
		case 'ko':
			await import('@fontsource/noto-sans-kr/korean.css')
			document.body.classList.remove(...document.body.classList)
			document.body.classList.add('korean')
			break
		default:
			throw new Error('Invalid language')
	}
}

export async function loadLocale (locale) {
	if (i18n.availableLocales.includes(locale)) {
		return
	}
	// load locale messages with dynamic import
	const messages = await import(/* webpackChunkName: "translations-[request]" */ `@/translations/${locale}.json`)

	// set locale and locale message
	i18n.setLocaleMessage(locale, messages.default)

	return Vue.nextTick()
}

async function loadFormatting (locale) {
	const tal = TIME_AGO_EXCEPTIONS[locale] || locale
	const data = await import(/* webpackChunkName: "timeago-[request]" */ `javascript-time-ago/locale/${tal}.json`)
	TimeAgo.addLocale(data)
	const timeAgo = new TimeAgo(tal, {
		polyfill: false
	})

	store.commit('i18n/updateState', {
		intlLocale: locale,
		timeAgo
	})
}

export async function changeLocale (lang) {
	await Promise.all([
		loadLocale(lang),
		syncStylesPerLanguage(lang),
		loadFormatting(lang)
	])
	i18n.locale = lang
	window.localStorage.setItem('LOCALE', lang)
}

function initializeLocalLocale () {
	let lang = window.localStorage.getItem('LOCALE')
	if (lang == null) {
		lang = LocaleMatcher.match(navigator.languages, SUPPORTED_LANGUAGES, 'en')
	}
	return changeLocale(lang)
}

export const i18nInitialized = initializeLocalLocale()
