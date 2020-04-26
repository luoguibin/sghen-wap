import Vue from 'vue'
import Vuex from 'vuex'
import Auth from './auth'
import Data from './data'

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
    data: Data
  }
})
