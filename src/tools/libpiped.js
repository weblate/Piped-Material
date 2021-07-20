import DOMPurify from 'dompurify'
import { keys as _keys } from 'lodash-es'

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

class LibPiped {
  timeFormat (duration) {
    const pad = function (num, size) {
      return ('000' + num).slice(size * -1)
    }

    const time = parseFloat(duration).toFixed(3)
    const hours = Math.floor(time / 60 / 60)
    const minutes = Math.floor(time / 60) % 60
    const seconds = Math.floor(time - minutes * 60)

    let str = ''

    if (hours > 0) str += hours + ':'

    str += pad(minutes, 2) + ':' + pad(seconds, 2)

    return str
  }

  numberFormat (num) {
    const digits = 2
    const si = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'K' },
      { value: 1e6, symbol: 'M' },
      { value: 1e9, symbol: 'B' }
    ]
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
    let i
    for (i = si.length - 1; i > 0; i--) {
      if (num >= si[i].value) {
        break
      }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol
  }

  addCommas (num) {
    num = parseInt(num)
    return num.toLocaleString('en-US')
  }

  fetchJson (path, params, options) {
    const url = new URL(this.apiUrl())

    url.pathname = path
    if (params) {
      for (const param of _keys(params)) {
        url.searchParams.set(param, params[param])
      }
    }
    const at = this.getAuthToken()
    if (at) {
      url.searchParams.set('authToken', at)
    }

    return fetch(url.href, options).then(response => {
      return response.json()
    })
  }

  purifyHTML (original) {
    return DOMPurify.sanitize(original)
  }

  setPreference (key, value) {
    if (localStorage) localStorage.setItem(key, value)
  }

  getPreferenceBoolean ($route, key, defaultVal) {
    let value
    if (
      (value = $route.query[key]) !== undefined ||
      (localStorage && (value = localStorage.getItem(key)) !== null)
    ) {
      switch (String(value)) {
        case 'true':
        case '1':
        case 'on':
        case 'yes':
          return true
        default:
          return false
      }
    } else return defaultVal
  }

  getPreferenceString (key, defaultVal) {
    let value
    if (
      (localStorage && (value = localStorage.getItem(key)) !== null)
    ) {
      return value
    } else return defaultVal
  }

  getPreferenceNumber (key, defaultVal) {
    let value
    if (
      (localStorage && (value = localStorage.getItem(key)) !== null)
    ) {
      return Number(value)
    } else return defaultVal
  }

  apiUrl () {
    return this.getPreferenceString('instance', 'https://pipedapi.kavin.rocks')
  }

  getEffectiveTheme () {
    let theme = this.getPreferenceString('theme', 'dark')
    if (theme === 'auto') {
      theme =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
    }
    return theme
  }

  getAuthToken () {
    return this.getPreferenceString('authToken' + this.hashCode(this.apiUrl()))
  }

  hashCode (s) {
    return s.split('').reduce(function (a, b) {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)
  }

  timeAgo (time) {
    return timeAgo.format(time)
  }
}

const lp = new LibPiped()
export { lp as LibPiped }
