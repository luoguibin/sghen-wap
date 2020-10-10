import Vue from 'vue'
import VueRouter from 'vue-router'
// import storeAuth from '../store/auth'
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
    path: '/peotry-images',
    name: 'peotry-images',
    component: () => import(/* webpackChunkName: 'peotry-images' */'@/views/peotry-images')
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
    path: '/peotry-edit/:id',
    name: 'peotry-edit',
    component: () => import(/* webpackChunkName: 'peotry-edit' */'@/views/peotry-edit')
  },
  {
    path: '/personal',
    name: 'personal',
    component: () => import(/* webpackChunkName: 'personal' */'@/views/personal'),
    meta: {
      auth: true
    }
  },
  {
    path: '/my-resume',
    name: 'myResume',
    component: () => import(/* webpackChunkName: 'my-resume' */'@/views/my-resume'),
    meta: {
      auth: true
    }
  },
  {
    path: '/api-manage',
    name: 'api-manage',
    component: () => import(/* webpackChunkName: 'api-manage' */'@/views/api-manage'),
    meta: {
      auth: true
    }
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

router.beforeEach((to, from, next) => {
  const app = router.app
  // 第一次调用路由拦截时app.$store未自动挂载，需要在main.js中手动提前挂载
  if (to.meta.auth && !app.$store.getters['auth/isLogin']) {
    app.$toastLogin()
    if (!from.name) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
      next(false)
    }
    return
  }
  next()
})

router.onError(function (e) {
  const { name } = e || {}
  switch (name) {
    case 'ChunkLoadError':
      window._sgGlobal.$toast('资源文件加载失败，请重试')
      break
    default:
      break
  }
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
