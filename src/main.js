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

new Vue({
  router,
  store,
  created () {
    this.$store.dispatch('auth/checkStorage')
  },
  render: h => h(App)
}).$mount('#app')
