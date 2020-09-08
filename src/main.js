import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import Xss from 'xss'
import './ui/index'
import './directives'
import './filters'
import './style/index.scss'

Vue.config.productionTip = false
Vue.prototype.$xss = Xss
Vue.prototype.$store = store // 为了让路由第一次拦截时能使用$store
Vue.prototype.$toastLogin = function (msg = '请#{ 登陆 }后再操作', params) {
  if (this.$store.getters['auth/isLogin']) {
    return
  }
  this.$toast(msg, { ...params,
    btnCall: index => {
      this.$router.push({ name: 'login', query: { redirect: router.currentRoute.fullPath } })
    } })
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
