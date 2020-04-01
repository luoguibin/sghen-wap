import { apiURL, apiPostData } from '@/api'

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
    login (context, data) {
      return new Promise(function (resolve, reject) {
        const func = function (data_) {
          apiPostData(apiURL.login, data_).then(resp => {
            context.commit('setUserInfo', resp.data)
            resolve(resp)
          }).catch(err => {
            reject(err)
          })
        }
        if (data.pw) {
          // todo: crypto-js的core中加载了所有crypto包。。。
          require(['crypto-js/enc-base64.js', 'crypto-js/md5.js'], function (Base64, MD5) {
            data.pw = Base64.stringify(MD5(data.pw))
          }, function (err) {
            if (err) {
              reject(new Error('配置文件加载失败'))
              window._sgGlobal.$toast('配置文件加载失败', { direction: 'bottom' })
            } else {
              func(data)
            }
          })
        } else {
          func(data)
        }
      })
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
