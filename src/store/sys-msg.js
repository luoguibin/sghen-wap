import { apiURL, apiGetData } from '@/api'

let refreshTimer

const storeMsg = {
  namespaced: true,
  state: {
    msgs: []
  },
  getters: {
    unReadMsgs (state) {
      return state.msgs.filter(o => {
        return o.status === -1
      })
    },
    unReadCount (_, getters) {
      return getters.unReadMsgs.length
    },
    unReadCountText (_, getters) {
      if (getters.unReadCount < 1) {
        return ''
      } else if (getters.unReadCount > 99) {
        return '99+'
      } else {
        return '' + getters.unReadCount
      }
    }
  },
  mutations: {
    setMsgs (state, data) {
      state.msgs = data || []
    },
    setMsgStatus (state, data) {

    }
  },
  actions: {
    getSysMsgs ({ commit, dispatch }, data = { page: 1, limit: 100, offset: 0 }) {
      if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
      }
      return apiGetData(apiURL.sysMsg, {
        status: -1,
        ...data
      }).then(resp => {
        const { list = [] } = resp.data
        commit('setMsgs', list)
      }).finally(() => {
        if (refreshTimer) {
          return
        }
        refreshTimer = setTimeout(() => {
          refreshTimer = null
          dispatch('getSysMsgs')
        }, 60000)
      })
    }
  }
}

export default storeMsg
