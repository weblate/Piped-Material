import axios from 'axios'
import { isPlainObject } from 'lodash-es'

const AuthenticationStore = {
  namespaced: true,

  state: () => ({
    isAuthenticated: true,
    authToken: null
  }),

  actions: {
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
