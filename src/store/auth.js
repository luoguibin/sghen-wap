import { apiURL, apiPostData } from '@/api'
import Cache from '@/common/cache-center'

export default {
  namespaced: true,
  state: {
    userID: '',
    userName: '',
    userAvatar: '',
    phone: '',
    token: ''
  },
  getters: {
    isLogin (state) {
      return !!state.token
    }
  },
  mutations: {
    setUserInfo (state, data = {}) {
      const temp = window.btoa(window.encodeURIComponent(JSON.stringify(data)))
      sessionStorage.setItem('sghen_user_info', temp)
      state.userID = data.id
      state.userAvatar = data.avatar
      state.userName = data.username || data.name
      state.phone = data.phone || data.id
      state.token = data.token

      if (data.token) {
        Cache.UserCache.setData(data.id, {
          id: data.id,
          avatar: data.avatar,
          username: state.userName
        })
      }
    }
  },
  actions: {
    createUser ({ dispatch }, data) {
      data.isCreateUser = true
      return dispatch('login', data)
    },
    login (context, data) {
      return new Promise(function (resolve, reject) {
        const func = function (_data, _resolve, _reject) {
          const postURL = data.isCreateUser ? apiURL.userCreate : apiURL.login
          apiPostData(postURL, _data).then(resp => {
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
    logout (context) {
      context.commit('setUserInfo')
    }
  }
}
