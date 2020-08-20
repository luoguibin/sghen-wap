import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Xss from "xss"
import './ui/index'
import './directives'
import './filters'
import './style/index.scss'

Vue.config.productionTip = false
Vue.prototype.$xss = Xss
Vue.prototype.$toastLogin = function(msg = '请#{ 登陆 }后再操作', params) {
  if (this.$store.getters['auth/isLogin']) {
    return
  }
  this.$toast(msg, {...params, btnCall: index => {
    this.$router.push({ name: 'login', query: { redirect: router.currentRoute.fullPath } })
  }})
}

new Vue({
  router,
  store,
  created () {
    this.$store.dispatch('auth/checkStorage')
  },
  render: h => h(App)
}).$mount('#app')
