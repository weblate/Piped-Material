import Vue from 'vue'
import VueI18n from 'vue-i18n'
import TimeAgo from 'javascript-time-ago'

import store from '@/store'
import ENTranslations from '@/translations/en.json'

Vue.use(VueI18n)

const messages = {
	en: ENTranslations
}

export const LANGUAGE_OPTIONS = [
	{
		value: 'en',
		text: 'English'
	},
	{
		value: 'fr',
		text: 'French'
	},
	{
		value: 'de',
		text: 'German'
	},
	{
		value: 'el',
		text: 'Greek'
	},
	{
		value: 'es',
		text: 'Spanish'
	},
	{
		value: 'zh-Hans',
		text: 'Chinese (Simplified, only loads the font)'
	},
	{
		value: 'zh-Hant',
		text: 'Chinese (Traditional)'
	},
	{
		value: 'cs',
		text: 'Czech'
	},
	{
		value: 'ja',
		text: 'Japanese (only loads fonts)'
	},
	{
		value: 'ko',
		text: 'Korean (only loads fonts)'
	},
	{
		value: 'ru',
		text: 'Russian (only loads fonts)'
	},
	{
		value: 'lt',
		text: 'Lithuanian'
	},
	{
		value: 'ml',
		text: 'Malayalam'
	},
	{
		value: 'nb-NO',
		text: 'Norwegian Bokmål'
	},
	{
		value: 'tr',
		text: 'Turkish'
	},
	{
		value: 'bn-Beng',
		text: 'Bengali (বাংলা)'
	},
	{
		value: 'ar',
		text: 'Arabic'
	},
	{
		value: 'ckb',
		text: 'Sorani Kurdish'
	}
	// Incomplete, DO NOT USE
	/* { value: 'bn_latn', text: 'Bengali (Latin)' }, */
].sort((a, b) => {
	return a.text.localeCompare(b.text)
})

export const SUPPORTED_LANGUAGES = LANGUAGE_OPTIONS.map(l => l.value)

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
	ckb: 'ku'
}

export const COUNTRY_I18N_EXCEPTIONS = {
	'bn-Beng': 'bn',
	'bn-Latn': 'bn',
	ckb: 'ku',
	'nb-NO': 'nb',
	'zh-Hant': 'zh',
	'zh-Hans': 'zh'
}

// Similar switches for RTL can be found in the i18n store
async function syncStylesPerLanguage (locale) {
	switch (locale) {
		// All the latin languages
		case 'de':
		case 'en':
		case 'el':
		case 'es':
		case 'fr':
		case 'lt':
		case 'ml':
		case 'tr':
		case 'cs':
		case 'bn-Latn':
			// Don't need to import fonts because Latin fonts are always loaded
			document.body.classList.remove(...document.body.classList)
			document.body.classList.add('latin')
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
		case 'ru':
			await import('@fontsource/nunito-sans/cyrillic.css')
			document.body.classList.remove(...document.body.classList)
			document.body.classList.add('russian')
			break
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
		for (const possible of navigator.languages) {
			if (SUPPORTED_LANGUAGES.includes(possible)) {
				lang = possible
				break
			}
		}
		if (lang == null) {
			lang = 'en'
		}
	}
	return changeLocale(lang)
}

export const i18nInitialized = initializeLocalLocale()
