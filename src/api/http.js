import axios from 'axios'
import Qs from 'qs'
import store from '@/store'
import router from '@/router'
import { aesDecrypt } from '@/utils/crypto'

axios.defaults.timeout = 100000

// const resetObjectId = function (obj = {}) {
//   if (obj instanceof Array) {
//     obj.forEach(o => {
//       resetObjectId(o)
//     })
//   } else {
//     for (const key in obj) {
//       if (Object.hasOwnProperty.call(obj, key)) {
//         if (key === 'id') {
//           obj[key] = '' + obj[key]
//         } else if (obj[key] instanceof Array) {
//           resetObjectId(obj[key])
//         } else if (obj[key] instanceof Object) {
//           resetObjectId(obj[key])
//         }
//       }
//     }
//   }
// }

axios.interceptors.request.use(
  config => {
    const token = store.state.auth.token
    if (token) {
      config.headers['Authorization'] = token
    }
    if (config.data && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      config.data = Qs.stringify(config.data)
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  res => {
    // if (!localStorage.getItem('sghen_is-test')) {
    //   store.dispatch('auth/logout')
    //   router.push({ name: 'page-invalid', params: { invalidType: 'updating' } })
    //   return
    // }
    const status = Number(res.status) || 0
    const data = res.data || {}
    if (status !== 200 || data.code !== 1000) {
      window._sgGlobal.$toast(data.msg || '操作失败')
      if (data.code === 1002) {
        store.dispatch('auth/logout')
        router.push({ name: 'login', query: { redirect: router.currentRoute.fullPath } })
      } else if (data.code === 999) {
        store.dispatch('auth/logout')
        router.push({ name: 'page-invalid', params: { invalidType: 'updating' } })
        return
      }
      return Promise.reject(res)
    }

    // if (res.config.url.includes('/sapi/v1/')) {
    //   resetObjectId(data)
    // }

    if (data.apicrypt) {
      data.data = JSON.parse(aesDecrypt(data.data))
    }

    return data
  },
  error => {
    window._sgGlobal.$toast(error || '操作失败')
    return Promise.reject(new Error(error))
  }
)

export default axios
