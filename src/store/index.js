import Vue from 'vue'
import Vuex from 'vuex'

import { PrefsStore, initializePrefEvents } from '@/store/prefs-store'
import { AuthenticationStore, initializeAuthEvents } from '@/store/authentication-store'

Vue.use(Vuex)

const store = new Vuex.Store({
	modules: {
		prefs: PrefsStore,
		auth: AuthenticationStore
	}
})

initializePrefEvents(store)
initializeAuthEvents(store)

export default store
