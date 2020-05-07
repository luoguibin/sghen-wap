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
    path: '/peotry-list',
    name: 'peotry-list',
    component: () => import(/* webpackChunkName: 'peotry-list' */'@/views/peotry-list')
  },
  {
    path: '/peotry-detail/:id',
    name: 'peotry-detail',
    component: () => import(/* webpackChunkName: 'peotry-detail' */'@/views/peotry-detail')
  },
  {
    path: '/*',
    redirect: '/home'
  }
]

const router = new VueRouter({
  routes
})

export default router
