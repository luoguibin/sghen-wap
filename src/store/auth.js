import { apiURL, apiPostData } from '@/api'
import { MD5, enc } from 'crypto-js'

export default {
  namespaced: true,
  state: {
    phone: '',
    username: ''
  },
  mutations: {
    setUserInfo (state, data = {}) {
      sessionStorage.setItem('sg-userinfo', JSON.stringify(data))
      state.phone = data.phone || data.id
      state.username = data.username || data.name
    }
  },
  actions: {
    async login (context, data) {
      if (data.pw) {
        data.pw = enc.Base64.stringify(MD5(data.pw))
      }
      const resp = await apiPostData(apiURL.login, data)
      context.commit('setUserInfo', resp.data)
      return resp
    },
    async getSmsCode (context, phone) {
      const resp = await apiPostData(apiURL.smsCode, { phone })
      return resp
    },
    logout (context) {
      context.commit('setUserInfo')
    }
  }
}
