import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './ui/index'
import './directives'
import './filters'
import './style/index.scss'

Vue.config.productionTip = false

const temp = sessionStorage.getItem('sghen_user_info')
if (temp) {
  const userinfo = JSON.parse(window.decodeURIComponent(window.atob(temp)))
  store.commit('auth/setUserInfo', userinfo)
}

// document.body.addEventListener('touchmove', function (e) {
//   e.preventDefault()
// }, { passive: false })

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
