import Vue from 'vue'
import Vuex from 'vuex'
import Auth from './auth'
import SysMsg from './sys-msg'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    auth: Auth,
    sysMsg: SysMsg
  }
})
