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
    getSysMsgs ({ commit, dispatch }) {
      if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
      }
      apiGetData(apiURL.sysMsg, {
        status: 0, page: 1, limit: 10
      }).then(data => {
        commit('setMsgs', data.data)
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
