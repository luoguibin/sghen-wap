import { apiURL, apiGetData } from '@/api'

const storeMsg = {
  namespaced: true,
  state: {
    msgs: []
  },
  mutations: {
    setMsgs (state, data) {
      state.msgs = data || []
    },
    setMsgStatus (state, data) {

    }
  },
  actions: {
    getSysMsgs ({ commit }) {
      apiGetData(apiURL.sysMsg, {
        status: 0, page: 1, limit: 10
      }).then(data => {
        commit('setMsgs', data.data)
      })
    }
  }
}

export default storeMsg
