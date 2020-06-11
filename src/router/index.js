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
    path: '/personal',
    name: 'personal',
    component: () => import(/* webpackChunkName: 'personal' */'@/views/personal')
  },
  {
    path: '/api-manage',
    name: 'api-manage',
    component: () => import(/* webpackChunkName: 'api-manage' */'@/views/api-manage')
  },
  {
    path: '/sg-components',
    name: 'sg-components',
    component: () => import(/* webpackChunkName: 'sg-components' */'@/views/sg-components')
  },
  {
    path: '/*',
    redirect: '/home'
  }
]

const router = new VueRouter({
  routes
})

// 优化路由返回上一级不存在的情况
router._go = router.go
router.go = function (num) {
  // console.log(`go, num=${num}, fromFullpath=${this._fromFullpath}`)
  if (num === -1 && history.length <= 1) {
    this.push('/')
  } else {
    this._go(num)
  }
}

export default router
