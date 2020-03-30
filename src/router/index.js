import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: 'login' */'@/components/login')
  },
  {
    path: '/home',
    name: 'home',
    component: () => import(/* webpackChunkName: 'home' */'@/views/home')
  },
  {
    path: '/*',
    redirect: '/login'
  }
]

const router = new VueRouter({
  routes
})

export default router
