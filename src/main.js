import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './ui/index'
import './directives/index'
import './style/index.scss'

Vue.config.productionTip = false

const temp = sessionStorage.getItem('sg-userinfo')
if (temp) {
  store.commit('auth/setUserInfo', JSON.parse(temp))
}

// document.body.addEventListener('touchmove', function (e) {
//   e.preventDefault()
// }, { passive: false })

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
