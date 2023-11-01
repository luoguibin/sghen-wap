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
    path: '/poetry-images',
    name: 'poetry-images',
    component: () => import(/* webpackChunkName: 'poetry-images' */'@/views/poetry-images')
  },
  {
    path: '/poetry-list',
    name: 'poetry-list',
    component: () => import(/* webpackChunkName: 'poetry-list' */'@/views/poetry-list')
  },
  {
    path: '/poetry-detail/:id',
    name: 'poetry-detail',
    component: () => import(/* webpackChunkName: 'poetry-detail' */'@/views/poetry-detail')
  },
  {
    path: '/peotry-detail/:id',
    redirect: {
      name: 'poetry-detail'
    }
  },
  {
    path: '/poetry-edit/:id',
    name: 'poetry-edit',
    component: () => import(/* webpackChunkName: 'poetry-edit' */'@/views/poetry-edit')
  },
  {
    path: '/personal',
    name: 'personal',
    component: () => import(/* webpackChunkName: 'personal' */'@/views/personal'),
    meta: {
      auth: false // 查看个人诗词概况不需要鉴权
    }
  },
  {
    path: '/my-msgs',
    name: 'my-msgs',
    component: () => import(/* webpackChunkName: 'my-msgs' */'@/views/my-msgs'),
    meta: {
      auth: false
    }
  },
  {
    path: '/my-resume',
    name: 'myResume',
    component: () => import(/* webpackChunkName: 'my-resume' */'@/views/my-resume'),
    meta: {
      auth: false
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
    path: '/poetry-census',
    name: 'poetry-census',
    component: () => import(/* webpackChunkName: 'poetry-census' */'@/views/poetry-census'),
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
    path: '/page-invalid/:invalidType',
    name: 'page-invalid',
    component: () => import(/* webpackChunkName: 'page-invalid' */'@/views/page-invalid')
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
