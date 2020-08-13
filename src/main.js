import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './ui/index'
import './directives'
import './filters'
import './style/index.scss'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  created () {
    this.$store.dispatch('auth/checkStorage')
  },
  render: h => h(App)
}).$mount('#app')
