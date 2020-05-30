import { apiURL, apiPostData } from '@/api'

export default {
  namespaced: true,
  state: {
    userID: '',
    userName: '',
    userAvatar: '',
    mood: '',
    phone: '',
    token: ''
  },
  getters: {
    selfPublicInfo (state) {
      return {
        id: state.userID,
        username: state.userName,
        avatar: state.userAvatar,
        mood: state.mood
      }
    },
    isLogin (state) {
      return !!state.token
    }
  },
  mutations: {
    setUserInfo (state, data = {}) {
      const temp = window.btoa(window.encodeURIComponent(JSON.stringify(data)))
      localStorage.setItem('sghen_user_info', temp)
      state.userID = data.id
      state.userAvatar = data.avatar
      state.userName = data.username || data.name
      state.phone = data.phone
      state.mood = data.mood
      state.token = data.token
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
    update (context, { name, avatar, mood }) {
      return apiPostData(apiURL.userUpdate, { name, avatar, mood }).then(resp => {
        const temp = localStorage.getItem('sghen_user_info')
        if (temp) {
          const userinfo = JSON.parse(window.decodeURIComponent(window.atob(temp)))
          userinfo.username = name
          userinfo.avatar = avatar
          userinfo.mood = mood
          context.commit('setUserInfo', userinfo)
        }
      })
    },
    logout (context) {
      context.commit('setUserInfo')
    }
  }
}
