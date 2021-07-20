import Vue from 'vue'
import Vuex from 'vuex'

import { get as _get, keys as _keys, set as _set } from 'lodash-es'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    isAuthenticated: false,
    prefs: {}
  },
  mutations: {
    setAuthenticated (state, authStatus) {
      state.isAuthenticated = authStatus
    },
    setPrefs (state, {
      id,
      value
    }) {
      _set(state.prefs, id, value)
    }
  },
  actions: {
    loadState ({ commit }) {
      try {
        const p = JSON.parse(window.localStorage.getItem('PREFERENCES'))
        commit('setPrefs', p)
      } catch (e) {
        console.log('Error:', e)
      }
    },

    fetchJson ({ getters }, {
      path,
      params = {},
      options = {}
    }) {
      const url = new URL(getters.apiUrl)

      url.pathname = path
      if (params) {
        for (const param of _keys(params)) {
          url.searchParams.set(param, params[param])
        }
      }
      const at = getters.getAuthToken
      if (at) {
        url.searchParams.set('authToken', at)
      }

      return fetch(url.href, options).then(response => {
        return response.json()
      })
    }
  },

  getters: {
    getPreferenceString: state => (id, default_) => {
      return _get(state.prefs, id, default_)
    },

    getPreferenceBoolean: (_, getters) => (...args) => {
      const v = getters.getPreferenceString(...args)

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

    getPreferenceNumber: (_, getters) => (...args) => {
      const v = getters.getPreferenceString(...args)

      return Number(v)
    },

    getEffectiveTheme (state, getters) {
      let theme = getters.getPreferenceString('theme', 'light')
      if (theme === 'auto') {
        theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return theme
    },

    backgroundColor (state, getters) {
      return getters.getEffectiveTheme === 'light' ? '#fff' : '#0b0e0f'
    },
    secondaryBackgroundColor (state, getters) {
      return getters.getEffectiveTheme === 'light' ? '#e5e5e5' : '#242727'
    },
    foregroundColor (state, getters) {
      return getters.getEffectiveTheme === 'light' ? '#15191a' : '#0b0e0f'
    },
    secondaryForegroundColor (state, getters) {
      return getters.getEffectiveTheme === 'light' ? '#666' : '#393d3d'
    },

    getAuthToken (state, getters) {
      return getters.getPreferenceString(['authToken', getters])
    },

    apiUrl () {
      return this.getPreferenceString('instance', 'https://pipedapi.kavin.rocks')
    },

    authenticated (state, getters) {
      return getters.getAuthToken !== undefined
    }
  },
  modules: {
  }
})

store.watch(state => state.prefs, (nextPrefs) => {
  window.localStorage.setItem('PREFERENCES', JSON.stringify(nextPrefs))
})

export default store
