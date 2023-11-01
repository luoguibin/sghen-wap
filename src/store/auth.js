import { apiURL, apiPostData } from '@/api'
import { baseMd5 } from '@/utils/crypto'

const storeAuth = {
  namespaced: true,
  state: {
    userID: '',
    userName: '',
    userAvatar: '',
    mood: '',
    phone: '',
    token: '',
    level: 0,
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
      state.level = data.level
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
            const info = resp.data
            info.expireDuration = resp.expireDuration || 24 * 60 * 60
            info.timeLogin = Date.now() / 1000
            context.commit('setUserInfo', info)
            _resolve(resp)
          }).catch(err => {
            _reject(err)
          })
        }
        if (data.pw) {
          data.pw = baseMd5(data.pw)
          if (!data.isCreateUser) {
            data.random = '' + Date.now()
            data.pw = baseMd5(data.pw + data.random)
          }
          func(data, resolve, reject)
        } else {
          func(data, resolve, reject)
        }
      })
    },
    update (context, { name, avatar, mood }) {
      return apiPostData(apiURL.userUpdate, { name, avatar, mood }).then(resp => {
        const temp = localStorage.getItem('sghen_user_info')
        if (temp) {
          const userInfo = JSON.parse(window.decodeURIComponent(window.atob(temp)))
          userInfo.username = name
          userInfo.avatar = avatar
          userInfo.mood = mood
          context.commit('setUserInfo', userInfo)
        }
      })
    },
    logout (context) {
      context.commit('setUserInfo')
    }
  }
};

// 自执行方法，上一行需要添加分号，不然运行时报错：{(intermediate value)(intermediate value)(intermediate value)(intermediate value)(intermediate value)} is not a function
(function () {
  const temp = localStorage.getItem('sghen_user_info')
  if (!temp) {
    return
  }

  const userInfo = JSON.parse(window.decodeURIComponent(window.atob(temp)))
  const expireDuration = userInfo.expireDuration || 0
  const timeLogin = userInfo.timeLogin || 0
  const duration = Date.now() / 1000 - timeLogin
  if (duration > expireDuration * 0.95) {
    // 取个0.95阈值，超过则认为已过有效期
    return
  }
  storeAuth.mutations.setUserInfo(storeAuth.state, userInfo)
})()

export default storeAuth
