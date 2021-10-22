import Vue from 'vue'
import Vuex from 'vuex'
import { isPlainObject } from 'lodash-es'

import { PrefsStore } from '@/store/prefs-store'
import { AuthenticationStore } from '@/store/authentication-store'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    prefs: PrefsStore,
    auth: AuthenticationStore
  }
})

store.watch(state => state.prefs.prefs, (nextPrefs) => {
  if (isPlainObject(nextPrefs)) {
    window.localStorage.setItem('PREFERENCES', JSON.stringify(nextPrefs))
  }
})

export default store
