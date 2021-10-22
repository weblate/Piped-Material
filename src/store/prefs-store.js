import { cloneDeep as _cloneDeep, get as _get, isString, set as _set } from 'lodash-es'

const PrefsStore = {
  namespaced: true,
  state: () => ({
    prefs: {}
  }),
  mutations: {
    setPrefs (state, {
      id,
      value
    }) {
      const clonedPrefs = _cloneDeep(state.prefs)
      _set(clonedPrefs, id, value)
      state.prefs = clonedPrefs
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
      return _get(state.prefs, id, default_)
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
      return getters.getPreference('instance', 'https://pipedapi.kavin.rocks')
    }
  }
}

export {
  PrefsStore
}
