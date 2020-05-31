import axios from 'axios'
import Qs from 'qs'
import store from '@/store'
import router from '@/router'

axios.defaults.timeout = 100000

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
    const status = Number(res.status) || 0
    const data = res.data || {}
    if (status !== 200 || data.code !== 1000) {
      window._sgGlobal.$toast(data.msg || '操作失败')
      if (data.code === 1002) {
        store.dispatch('auth/logout')
        router.push({ name: 'login', query: { redirect: router.currentRoute.fullPath } })
      }
      return Promise.reject(res)
    }

    return data
  },
  error => {
    window._sgGlobal.$toast(error || '操作失败')
    return Promise.reject(new Error(error))
  }
)

export default axios
