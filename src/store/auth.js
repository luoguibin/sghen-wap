export default {
  namespaced: true,
  state: {
    phone: '',
    username: ''
  },
  mutations: {
    setUserInfo (state, data = {}) {
      state.phone = data.phone
      state.username = data.username
    }
  },
  actions: {
    login (context, data) {
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          context.commit('setUserInfo', { phone: data.phone, username: '用户' + data.phone })
          resolve()
        }, 2000)
      })
    },
    logout (context) {
      context.commit('setUserInfo')
    }
  }
}
