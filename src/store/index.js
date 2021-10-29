import Vue from 'vue'
import Vuex from 'vuex'

import { PrefsStore } from '@/store/prefs-store'
import { AuthenticationStore } from '@/store/authentication-store'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    prefs: PrefsStore,
    auth: AuthenticationStore
  }
})

export default store
