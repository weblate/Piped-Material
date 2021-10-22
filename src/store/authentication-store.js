import axios from 'axios'
import { isPlainObject } from 'lodash-es'

const AuthenticationStore = {
  namespaced: true,

  state: () => ({
    isAuthenticated: false,
    authToken: null
  }),

  mutations: {
    replaceAuth (state, data) {
      state.isAuthenticated = data.isAuthenticated ?? state.isAuthenticated
      state.authToken = data.authToken ?? state.authToken
    }
  },

  actions: {
    initializeAuth ({ commit }) {
      const data = window.localStorage.getItem('AUTH')
      if (data != null) {
        commit('replaceAuth', data)
      }
    },

    async makeRequest ({
      commit,
      state,
      rootGetters
    }, {
      path,
      method,
      data,
      params
    }) {
      if (state.isAuthenticated) {
        if (isPlainObject(params)) {
          params.authToken = state.authToken
        } else {
          params = {
            authToken: state.authToken
          }
        }
      }

      const { data: resp } = await axios({
        baseURL: rootGetters['prefs/apiUrl'],
        method,
        url: path,
        params,
        headers: state.isAuthenticated
          ? {
              Authorization: state.authToken
            }
          : undefined
      })

      return resp
    }
  }
}

export {
  AuthenticationStore
}
