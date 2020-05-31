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
        <sg-button v-else type="text" @click="onGoLogin">登陆~</sg-button>
      </div>
    </sg-header>

    <!-- 内容 -->
    <div class="home-body">
      <div class="scroll">
        <sg-swipper
          ref="sgSwipper"
          :items="swipperItems"
          :itemType="'swipper-peotry'"
          :duration="swipperDuration"
          :auto="1"
          @click="onClickItemType"
        >
          <div
            v-for="(item, index) in swipperPoetries"
            :slot="swipperItems[index].slot"
            :key="item.id"
            class="item-panel"
          >
            <img class="item-bg" v-if="item.image0" :src="item.image0" />
            <h2 v-if="item.setName">《{{item.setName}}》</h2>
            <p v-for="(l, i) in item.lines" :key="i">{{l}}</p>
          </div>
        </sg-swipper>

        <div class="info-panel year-info" v-if="yearPoetrySets.length">
          <h2>{{year}}年度诗词概况</h2>
          <p @click="onClickItemType">
            本年度共创建
            <span>{{yearPeotryCount}}</span>首诗词，其中以选集
            <span item-type="year-set">《{{yearPoetrySets[0].name}}》</span>
            {{yearPoetrySets[0].count}}首稳居榜首；
            <template v-if="yearPeots.length">
              诗词创建数量最多的是
              <span item-type="year-poet">[{{yearPeots[0].username}}]</span>
              ，共创建{{yearPeots[0].count}}首。
            </template>
          </p>
        </div>

        <div class="info-panel">
          <h2>选集总排行榜</h2>
          <div class="popular-sets" @click="onClickItemType">
            <div
              v-for="item in popularPeotrySets"
              :key="item.id"
              item-type="popular-set"
            >{{item.name}}({{item.count}}首)</div>
          </div>
        </div>

        <div class="info-panel">
          <sg-button type="primary" @click="$router.push({name: 'peotry-list'})">更多诗词~</sg-button>
        </div>

        <div class="module-panel" @click="onClickItemType">
          <rotate-box v-if="lastestImages.length" :items="rotateItems" :itemType="'latest-image'">
            <div
              v-for="(item, index) in lastestImages"
              :slot="rotateItems[index].slot"
              :key="item.id"
              class="item-panel album-item"
            >
              <!-- 相册中不超过2张图片，默认显示第一张图片 -->
              <div v-if="item.images.length < 3" class="album-image1">
                <img :src="item.images[0]" />
              </div>

              <!-- 相册中超过2张图片，默认显示最新的前3张图片 -->
              <div v-else class="album-images3">
                <img :src="item.images[0]" />
                <img :src="item.images[1]" />
                <img :src="item.images[2]" />
              </div>
            </div>
          </rotate-box>
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
import { getItemIndex, getItemTypeObj } from '@/utils/sgDom'

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

export default {
  name: 'Home',

  components: {
    RotateBox: () => import('@/components/rotate-box'),
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

      lastestImages: [],
      rotateItems: [],

      dropdownOptions: [
        { label: '我的诗词', value: 'my-list' },
        { label: '个人中心', value: 'personal' },
        { label: '退出', value: 'logout' }
      ]
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
      userID: state => state.auth.userID,
      userName: state => state.auth.userName,
      userAvatar: state => state.auth.userAvatar
    })
  },

  created () {
    window.home = this
    this.getYearInfos()
    this.getWipperPeotries()
    this.getRotateImages()
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
      this.swipperItems = data.map(o => ({ id: o.id, slot: 'slot-' + o.id }))
      this.$refs.sgSwipper.start()

      this.line3Timer = setTimeout(() => {
        this.getWipperPeotries()
      }, this.swipperDuration * this.swipperItems.length)
    },
    getRotateImages () {
      apiGetData(apiURL.peotryImages, { limit: 4 }).then(({ data }) => {
        const imgSrcFunc = Vue.filter('img-src')
        this.lastestImages = data
          .filter(o => o.count)
          .map(o => {
            const temp = {
              id: o.id,
              count: o.count
            }
            const images = JSON.parse(o.images).map(v => {
              return getSmallImage(imgSrcFunc(v))
            })
            temp.images = [...images, ...images]
            return temp
          })
        this.rotateItems = data.map(o => ({ id: o.id, slot: 'slot-' + o.id }))
      })
    },

    handleDropdown (key) {
      switch (key) {
        case 'my-list':
          this.$router.push({
            name: 'peotry-list',
            query: { uuid: this.userID, username: this.userName }
          })
          break
        case 'logout':
          this.$confirm({
            title: '提示',
            content: '退出后需要重新登录验证',
            confirm: () => {
              this.logout()
              // this.$router.push({ name: 'login' })
            }
          })
          break
        case 'personal':
          this.$router.push({
            name: 'personal',
            query: { uuid: this.userID }
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
    onClickItemType (e) {
      const { el, itemType } = getItemTypeObj(e.target) || {}
      if (!itemType) {
        return
      }

      const itemIndex = getItemIndex(el)
      switch (itemType) {
        case 'swipper-peotry':
          this.$router.push({
            name: 'peotry-detail',
            params: { id: this.swipperPoetries[itemIndex].id }
          })
          break
        case 'popular-set':
          {
            const set = this.popularPeotrySets[itemIndex]
            const query = { setId: set.id, setName: set.name }
            if (set.userId && set.userId !== '0') {
              query.uuid = set.userId
            }
            this.$router.push({ name: 'peotry-list', query })
          }
          break
        case 'year-set':
          {
            const set = this.yearPoetrySets[0]
            this.$router.push({
              name: 'peotry-list',
              query: { setId: set.id, setName: set.name }
            })
          }
          break
        case 'year-poet':
          this.$router.push({
            name: 'personal',
            query: { uuid: this.yearPeots[0].id }
          })
          break
        case 'latest-image':
          this.$router.push({
            name: 'peotry-detail',
            params: { id: this.lastestImages[itemIndex].id }
          })
          break
        default:
          break
      }
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
@import "@/ui/style/const.scss";

.home {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  .sg-header {
    .sg-dropdown {
      display: inline-block;
      padding: 0;
      background-color: transparent;
    }
    .user {
      display: inline-block;
      color: $color-theme;
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
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
  .item-panel {
    position: relative;
    height: 100%;
    box-sizing: border-box;
    text-align: center;
    overflow: hidden;
    p {
      font-size: 1.4rem;
      line-height: 2.4rem;
    }
    h2 {
      margin: 1rem 0;
    }
    .item-bg {
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
      color: $color-title;
    }
  }

  .year-info {
    p {
      // text-indent: 2em;
      font-size: $size-text;
      line-height: $height-text;
      color: $color-text;
    }
    span {
      color: $color-theme;
      font-weight: bold;
      white-space: nowrap;
    }
  }

  .popular-sets {
    margin: -1.2rem -1.2rem 0 0;
    overflow: hidden;
    > div {
      display: inline-block;
      margin: 1.2rem 1.2rem 0 0;
      padding: 0 1rem;
      color: $color-theme;
      font-size: $size-text;
      line-height: $height-text * 1.2;
      border-radius: 1rem;
      background-color: mix($color-theme, white, 25%);
    }
  }

  .module-panel {
    padding: 0 1rem;
    box-sizing: border-box;
  }

  .album-item {
    background-color: rgba(255, 255, 255, 0.8);
    img {
      display: inline-block;
      box-sizing: border-box;
      height: 100%;
      object-fit: cover;
    }
    .album-image1 {
      height: 100%;
      img {
        width: 100%;
      }
    }
    .album-images3 {
      height: 100%;
      img {
        float: left;
        &:nth-child(1) {
          width: 70%;
          padding-right: 4px;
        }
        &:nth-child(2) {
          width: 30%;
          height: 50%;
          padding-bottom: 2px;
        }
        &:nth-child(3) {
          width: 30%;
          height: 50%;
          padding-top: 2px;
        }
      }
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
