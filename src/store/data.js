import { apiURL, apiGetData } from '@/api'

export default {
  namespaced: true,

  state: {
    userInfoMap: {}
  },

  mutations: {
    addUserInfo (state, { id, info }) {
      if (id) {
        state.userInfoMap[id] = Object.freeze(info)
      }
    },
    addUsersInfo (state, infos) {
      if (infos && infos instanceof Array) {
        infos.forEach(o => {
          if (o.id) {
            state.userInfoMap[o.id] = Object.freeze(o)
          }
        })
      }
    }
  },

  actions: {
    getUsersInfo (context, ids) {
      const reqs = []
      const max = 100
      const len = Math.ceil(ids.length / max)
      for (let i = 0; i < len; i++) {
        reqs.push(apiGetData(apiURL.userInfoList, {
          datas: ids.slice(i * max, i * max + max).toString()
        })
        )
      }
      return Promise.all(reqs).then(results => {
        let data = []
        results.forEach(o => {
          data = data.concat(o.data)
        })
        context.commit('addUsersInfo', data)
        return data
      })
    },
    clearUsersInfo ({ commit, state }, data = {}) {
      state.userInfoMap = {}
      commit('addUserInfo', data)
    }
  }
}
