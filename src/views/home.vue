<template>
  <div class="home">
    <div class="home-header">
      <template v-if="isLogin">
        <span>{{userName}}</span>
        <span>|</span>
        <span @click="onConfirm">退出</span>
      </template>
      <span v-else @click="onGoLogin">登陆</span>
    </div>

    <!-- 内容 -->
    <div class="home-body">
      <sg-swipper :items="[{slot: 'slot-0'}]" :auto="false">
        <div slot="slot-0" class="swipper-panel">
          <h2>《书三行》</h2>
          <h3>最近就变懒了吗？</h3>
          <h3>不就是写三行吗？</h3>
          <h3>这不就写完了吗？</h3>
          <sg-button @click="$router.push({name: 'peotry-list'})">更多</sg-button>
        </div>
      </sg-swipper>

      <div class="info-panel year-info" v-if="yearPoetrySets.length">
        <h2>{{year}}年度诗词概况</h2>
        <p>
          本年度共创建
          <span>{{yearPeotryCount}}</span>首诗词，其中以选集
          <span>【{{yearPoetrySets[0].name}}】</span>
          {{yearPoetrySets[0].count}}首稳居榜首；
          <template v-if="yearPeots.length">
            诗词创建数量最多的是
            <span>[{{yearPeots[0].username}}]</span> ，共创建
            <span>{{yearPeots[0].count}}</span>首。
          </template>
        </p>
      </div>

      <div class="info-panel">
        <h2>选集总排行榜</h2>
        <div class="popular-sets">
          <div v-for="item in popularPeotrySets" :key="item.id">{{item.name}}({{item.count}}首)</div>
        </div>
      </div>

      <div class="module-panel">
        <span>模块占位中...</span>
      </div>

      <site-instruction></site-instruction>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { apiURL, apiGetData } from '@/api'

export default {
  name: 'Home',

  components: {
    SiteInstruction: () => import('@/components/site-instruction')
  },

  data () {
    return {
      year: new Date().getFullYear(),
      yearPeots: [],
      yearPoetrySets: [],
      popularPeotrySets: []
    }
  },

  computed: {
    yearPeotryCount () {
      return this.yearPoetrySets.reduce((v, o) => v + +o.count, 0)
    },
    ...mapGetters({
      isLogin: 'auth/isLogin'
    }),
    ...mapState({
      userName: state => state.auth.userName
    })
  },

  created () {
    window.home = this
    this.getYearInfos()
  },

  methods: {
    getYearInfos () {
      const params = {
        date0: `${this.year}-01-01 00:00:00`,
        date1: `${this.year}-12-30 59:59:59`
      }
      apiGetData(apiURL.peotrySetListYear, params).then(resp => {
        this.yearPoetrySets = resp.data
      })
      apiGetData(apiURL.peotryUserListYear, params).then(resp => {
        this.yearPeots = resp.data
      })
      apiGetData(apiURL.poetrySetPopular).then(resp => {
        this.popularPeotrySets = resp.data
      })
    },

    onGoLogin () {
      this.$router.push({
        name: 'login',
        query: { redirect: this.$route.fullPath }
      })
    },
    onConfirm () {
      this.$confirm({
        title: '提示',
        content: '退出后需要重新登录验证',
        confirm: () => {
          this.logout()
          this.$router.push({ name: 'login' })
        }
      })
    },
    ...mapActions({
      logout: 'auth/logout'
    })
  }
}
</script>

<style lang="scss" scoped>
@import "@/ui/style/colors";
.home {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  .home-header {
    padding: 1rem 0.5rem;
    text-align: right;
    font-size: 1.6rem;
    border-bottom: 1px solid #eee;
    span {
      padding: 0 2px;
    }
  }

  .home-body {
    flex: 1;
    height: 100%;
    overflow: hidden auto;
  }
  .swipper-panel {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    text-align: center;
    overflow: hidden;
    .sg-button {
      position: absolute;
      right: 10px;
      bottom: 10px;
      display: inline-block;
      width: initial;
    }
  }
  .info-panel {
    padding: 1rem;
    h2 {
      color: $title-color;
    }
  }

  .year-info {
    p {
      text-indent: 2em;
      font-size: 1.2rem;
      color: $content-color;
    }
    span {
      color: $main-color;
      white-space: nowrap;
    }
  }

  .popular-sets {
    margin: -1.2rem -1.2rem 0 0;
    > div {
      display: inline-block;
      margin: 1.2rem 1.2rem 0 0;
      padding: 3px 8px;
      color: #fff;
      font-size: 1.2rem;
      border-radius: 6px;
      background-color: $main-color;
    }
  }

  .module-panel {
    height: 18rem;
    line-height: 18rem;
    background: #eee;
    text-align: center;
    color: #999;
    span {
      font-size: 1.6rem;
      animation: frames-opacity 1200ms alternate infinite;
    }
  }
}
</style>

<style>
@keyframes frames-opacity {
  0% {
    opacity: 1;
  }
  30% {
    opacity: 1;
  }
  65% {
    opacity: 0.5;
  }
  100% {
    opacity: 0;
  }
}
</style>
