import axios from 'axios'
import { isPlainObject as _isPlainObject, set as _set } from 'lodash-es'

export class AuthenticationError extends Error {
	constructor (message) {
		super()
		this.message = message
	}
}

const AuthenticationStore = {
	namespaced: true,

	state: () => ({
		authStateByInstance: {
			// isAuthenticated: Boolean
			// authToken: String?
		}
	}),

	mutations: {
		replaceAuth (state, data) {
			state.authStateByInstance = data
		},

		setAuthToken (state, { apiURL, token }) {
			_set(state.authStateByInstance, [apiURL], {
				isAuthenticated: true,
				authToken: token
			})
			window.localStorage.setItem('AUTH', JSON.stringify(state.authStateByInstance))
		},

		deleteAuthToken (state, { apiURL }) {
			_set(state.authStateByInstance, [apiURL], {
				isAuthenticated: false
			})
			window.localStorage.setItem('AUTH', JSON.stringify(state.authStateByInstance))
		}
	},

	getters: {
		isCurrentlyAuthenticated (state, getters, rootState, rootGetters) {
			const s = state.authStateByInstance[rootGetters['prefs/apiUrl']]
			return s ? (s.isAuthenticated === true) : false
		},

		authToken (state, getters, rootState, rootGetters) {
			const authState = state.authStateByInstance[rootGetters['prefs/apiUrl']] || {}
			return authState.authToken
		}
	},

	actions: {
		initializeAuth ({ commit }) {
			const data = window.localStorage.getItem('AUTH')
			if (data != null) {
				commit('replaceAuth', JSON.parse(data))
			}
		},

		async loginOrRegister ({ commit, rootGetters }, { path, username, password }) {
			const apiURL = rootGetters['prefs/apiUrl']
			const { data: resp } = await axios({
				method: 'POST',
				baseURL: apiURL,
				url: '/' + path,
				data: {
					username,
					password
				}
			})

			if ('error' in resp) {
				throw new AuthenticationError(resp.error)
			}

			commit('setAuthToken', {
				apiURL,
				token: resp.token
			})
		},

		async makeRequest ({
			commit,
			state,
			rootGetters
		}, {
			path,
			method,
			data,
			params,
			tokenInParams = false
		}) {
			const APIURL = rootGetters['prefs/apiUrl']
			const AuthState = state.authStateByInstance[APIURL] || {}

			if (AuthState.isAuthenticated && tokenInParams) {
				if (_isPlainObject(params)) {
					params.authToken = AuthState.authToken
				} else {
					params = {
						authToken: AuthState.authToken
					}
				}
			}

			const { data: resp } = await axios({
				baseURL: APIURL,
				method,
				url: path,
				params,
				data,
				headers: AuthState.isAuthenticated
					? {
							Authorization: AuthState.authToken
						}
					: undefined
			})

			return resp
		}
	}
}

function initializeAuthEvents (store) {
	window.addEventListener('storage', (storageEv) => {
		if (storageEv.key === 'AUTH') {
			store.commit('auth/replaceAuth', JSON.parse(storageEv.newValue))
		}
	})
}

export {
	AuthenticationStore,
	initializeAuthEvents
}
