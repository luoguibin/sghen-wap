import { apiURL, apiPostData } from '@/api'

export default {
  namespaced: true,
  state: {
    userID: '',
    userName: '',
    userAvatar: '',
    phone: '',
    token: ''
  },
  mutations: {
    setUserInfo (state, data = {}) {
      sessionStorage.setItem('sg-userinfo', JSON.stringify(data))
      state.userID = data.id
      state.userAvatar = data.avatar
      state.userName = data.username || data.name
      state.phone = data.phone || data.id
      state.token = data.token
    }
  },
  actions: {
    login (context, data) {
      return new Promise(function (resolve, reject) {
        const func = function (_data, _resolve, _reject) {
          apiPostData(apiURL.login, _data).then(resp => {
            context.commit('setUserInfo', resp.data)
            _resolve(resp)
          }).catch(err => {
            _reject(err)
          })
        }
        if (data.pw) {
          // todo: crypto-js的core中加载了所有crypto包。。。
          require(['crypto-js/enc-base64.js', 'crypto-js/md5.js'], function (Base64, MD5) {
            data.pw = Base64.stringify(MD5(data.pw))
            func(data, resolve, reject)
          }, function (err) {
            if (err) {
              reject(new Error('配置文件加载失败'))
              window._sgGlobal.$toast('配置文件加载失败')
            }
          })
        } else {
          func(data, resolve, reject)
        }
      })
    },
    async getSmsCode (context, { phone, captchaId, captchaValue }) {
      const resp = await apiPostData(apiURL.smsCode, { phone, captchaId, captchaValue })
      return resp
    },
    logout (context) {
      context.commit('setUserInfo')
    }
  }
}
