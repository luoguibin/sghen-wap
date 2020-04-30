<template>
  <div class="home">
    <sg-header :backVisible="false">
      <div slot="right">
        <sg-dropdown
          v-if="isLogin"
          :options="dropdownOptions"
          @change="handleDropdown"
          :pointerVisible="false"
        >
          <div class="user">
            <span>{{userName}}</span>
            <img :src="userAvatar | img-src" />
          </div>
        </sg-dropdown>
        <span v-else @click="onGoLogin">登陆~</span>
      </div>
    </sg-header>

    <!-- <div class="home-header"></div> -->

    <!-- 内容 -->
    <div class="home-body">
      <div class="scroll">
        <sg-swipper ref="sgSwipper" :items="swipperItems" :duration="swipperDuration" :auto="1">
          <div
            v-for="(item, index) in swipperPoetries"
            :slot="swipperItems[index].slot"
            :key="item.id"
            class="swipper-panel"
          >
            <img v-if="item.image0" :src="item.image0" />
            <h2 v-if="item.setName">《{{item.setName}}》</h2>
            <p v-for="(l, i) in item.lines" :key="i">{{l}}</p>
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

        <div class="info-panel">
          <sg-button type="primary" @click="$router.push({name: 'peotry-list'})">更多诗词~</sg-button>
        </div>

        <div class="module-panel">
          <span>模块占位中...</span>
        </div>

        <site-instruction></site-instruction>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState, mapGetters, mapActions } from 'vuex'
import { apiURL, apiGetData } from '@/api'

export default {
  name: 'Home',

  components: {
    SiteInstruction: () => import('@/components/site-instruction')
  },

  data () {
    return {
      year: new Date().getFullYear() - 1,
      yearPeots: [],
      yearPoetrySets: [],
      popularPeotrySets: [],

      swipperItems: [],
      swipperPoetries: [],
      swipperDuration: 5000,

      dropdownOptions: [{ label: '退出', value: 'logout' }]
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
      userName: state => state.auth.userName,
      userAvatar: state => state.auth.userAvatar
    })
  },

  created () {
    window.home = this
    this.getYearInfos()
    this.getWipperPeotries()
  },

  methods: {
    getYearInfos () {
      const params = {
        date0: `${this.year}-01-01 00:00:00`,
        date1: `${this.year + 1}-01-01 00:00:00`
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
    async getWipperPeotries () {
      const limit = 3
      if (!this.line3Total) {
        const resp = await apiGetData(apiURL.peotryCount10001)
        this.line3Total = +resp.data[0].total
        this.line3Page = 1
      } else {
        this.line3Page++
        if (this.line3Page > Math.ceil(this.line3Total / limit)) {
          this.line3Page = 1
        }
      }

      const resp = await apiGetData(apiURL.peotryList, {
        setId: 10001,
        page: this.line3Page,
        limit
      })
      const data = resp.data
      const imgSrcFunc = Vue.filter('img-src')
      const getSmallImage = v => {
        if (v.endsWith('.jpg')) {
          v = v.replace(/.jpg$/, '_100.jpg')
        } else if (v.endsWith('.png')) {
          v = v.replace(/.png$/, '_100.png')
        } else if (v.endsWith('.jpeg')) {
          v = v.replace(/.jpeg$/, '_100.jpeg')
        } else {
          v += '_100.jpg'
        }
        return v
      }
      this.swipperPoetries = data.map(o => {
        const temp = {
          id: o.id,
          setName: o.set && o.set.name,
          lines: o.content.split('\n')
        }
        if (o.image && o.image.count) {
          temp.image0 = getSmallImage(
            imgSrcFunc(JSON.parse(o.image.images)[0])
          )
        }
        return temp
      })
      this.swipperItems = data.map(o => ({ slot: 'slot-' + o.id }))
      this.$refs.sgSwipper.start()

      this.line3Timer = setTimeout(() => {
        this.getWipperPeotries()
      }, this.swipperDuration * this.swipperItems.length)
    },

    handleDropdown (key) {
      switch (key) {
        case 'logout':
          this.$confirm({
            title: '提示',
            content: '退出后需要重新登录验证',
            confirm: () => {
              this.logout()
              this.$router.push({ name: 'login' })
            }
          })
          break

        default:
          break
      }
    },

    onGoLogin () {
      this.$router.push({
        name: 'login',
        query: { redirect: this.$route.fullPath }
      })
    },
    ...mapActions({
      logout: 'auth/logout'
    })
  },

  beforeDestroy () {
    clearTimeout(this.line3Timer)
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
  .sg-header {
    color: $main-color;
    .sg-dropdown {
      display: inline-block;
      padding: 0;
      background-color: transparent;
    }
    .user {
      display: inline-block;
      span,
      img {
        vertical-align: middle;
      }
      img {
        width: 1.6rem;
        object-fit: scale-down;
      }
    }
    span {
      padding: 0 2px;
    }
  }

  .home-body {
    flex: 1;
    height: 100%;
    overflow: hidden;
    .scroll {
      height: 100%;
      overflow-y: auto;
    }
  }
  .swipper-panel {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    text-align: center;
    overflow: hidden;
    p {
      font-size: 1.4rem;
      line-height: 2.4rem;
    }
    img {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.3;
      object-fit: contain;
      pointer-events: none;
    }
  }
  .info-panel {
    padding: 1rem;
    overflow: hidden;
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
