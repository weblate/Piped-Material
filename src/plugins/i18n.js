import Vue from 'vue'
import VueI18n from 'vue-i18n'

import ENTranslations from '@/translations/en.json'

Vue.use(VueI18n)

const messages = {
  en: ENTranslations
}

export const i18n = new VueI18n({
  locale: 'en', // set default locale
  fallbackLocale: 'en',
  messages
})

async function syncStylesPerLanguage (locale) {
  switch (locale) {
    // All the latin languages
    case 'de':
    case 'en':
    case 'el':
    case 'fr':
    case 'lt':
    case 'ml':
    case 'tr':
    case 'bn_latn':
      // Don't need to import fonts because Latin fonts are always loaded
      document.body.classList.remove(...document.body.classList)
      document.body.classList.add('latin')
      break
    // Bengali script
    case 'bn_beng':
      await import('@fontsource/hind-siliguri/bengali.css')
      document.body.classList.remove(...document.body.classList)
      document.body.classList.add('bengali')
      break
    // Other languages
    // NOTE: if you are a native speaker & want to see a different font, just email me or join the channel
    case 'zh_Hant':
      await import('@fontsource/noto-sans-tc/chinese-traditional.css')
      document.body.classList.remove(...document.body.classList)
      document.body.classList.add('traditional-chinese')
      break
    case 'zh_Hans':
      await import('@fontsource/noto-sans-sc/chinese-simplified.css')
      document.body.classList.remove(...document.body.classList)
      document.body.classList.add('simplified-chinese')
      break
    case 'jp':
      await import('@fontsource/noto-sans-jp/japanese.css')
      document.body.classList.remove(...document.body.classList)
      document.body.classList.add('japanese')
      break
    case 'kr':
      await import('@fontsource/noto-sans-kr/korean.css')
      document.body.classList.remove(...document.body.classList)
      document.body.classList.add('korean')
      break
    case 'cyrl':
      await import('@fontsource/nunito-sans/cyrillic.css')
      document.body.classList.remove(...document.body.classList)
      document.body.classList.add('cyrillic')
      break
  }
}

export async function loadLocale (locale) {
  if (i18n.availableLocales.includes(locale)) {
    return
  }
  // load locale messages with dynamic import
  const messages = await import(/* webpackChunkName: "locale-[request]" */ `@/translations/${locale}.json`)

  // set locale and locale message
  i18n.setLocaleMessage(locale, messages.default)

  return Vue.nextTick()
}

export async function changeLocale (lang) {
  await loadLocale(lang)
  await syncStylesPerLanguage(lang)
  i18n.locale = lang
  window.localStorage.setItem('LOCALE', lang)
}

function initializeLocalLocale () {
  let lang = window.localStorage.getItem('LOCALE')
  if (lang == null) {
    // Default language
    lang = 'en'
  }
  changeLocale(lang).catch(e => console.error(e))
}

initializeLocalLocale()
