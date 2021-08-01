<template>
  <div class="home">
    <sg-header :backVisible="false" :centerStatus="''">
      <sghen-logo slot="left"></sghen-logo>
      <div slot="right">
        <sg-dropdown
          v-if="isLogin"
          :options="dropdownOptions"
          @change="handleDropdown"
          :pointerVisible="false"
        >
          <div
            :class="{ user: true, 'has-msg': unReadMsgCountText !== '' }"
            :unreadcount="unReadMsgCountText"
          >
            <span>{{ userName }}</span>
            <img :src="userAvatar | imgSrcFilter('avatar')" />
          </div>
          <span
            slot="myMsgs"
            slot-scope="{ option }"
            :class="{ 'has-msg': unReadMsgCountText !== '' }"
            :unreadcount="unReadMsgCountText"
            >{{ option.label }}</span
          >
        </sg-dropdown>
        <sg-button v-else type="text" @click="onGoLogin">登陆~</sg-button>
      </div>
    </sg-header>

    <!-- 内容 -->
    <div class="home-body">
      <div class="scroll" sg-scroll sg-edge>
        <!-- 热门诗词TOP10 -->
        <div style="height: 15rem; background-color: white">
          <sg-slider
            v-if="sliderItems.length"
            ref="sgSlider"
            :index="sliderIndex"
            :items="sliderItems"
            :itemType="'slider-poetry'"
            :duration="sliderDuration"
            :loopTotal="99"
            @change="onSliderChange"
            @click="onClickItemType"
          >
            <div
              v-for="(item, index) in sliderPoetries"
              :slot="sliderItems[index].slot"
              :key="item.id"
              class="item-panel"
            >
              <img
                class="item-bg"
                v-if="item.images && item.images.length"
                :src="item.images[0]"
              />
              <div class="praise-total">
                <i class="iconfont icon-like"></i>
                <span>{{ item.praiseTotal | numFilter(true) }}</span>
              </div>
              <h2>
                <span>{{ item.set.name }}</span>
                <span v-if="item.title" style="padding: 0 5px">*</span>
                <span v-if="item.title">{{ item.title }}</span>
              </h2>
              <div class="content-wrapper">
                <p>{{ item.content }}</p>
              </div>
            </div>
          </sg-slider>
        </div>

        <!-- 界面功能按钮 -->
        <div class="info-panel menus">
          <div class="menu-item">
            <sg-button
              type="primary"
              @click="$router.push({ name: 'poetry-images' })"
              >诗词图集~</sg-button
            >
          </div>
          <div class="menu-item">
            <sg-button
              type="primary"
              @click="$router.push({ name: 'poetry-list' })"
              >最新诗词~</sg-button
            >
          </div>
        </div>

        <!-- 上一年年度诗词概况 -->
        <div class="info-panel year-info" v-if="yearPoetrySets.length">
          <h2>{{ year }}年度诗词概况</h2>
          <p @click="onClickItemType">
            本年度共创建
            <span>{{ yearPoetryCount }}</span
            >首诗词，其中以选集
            <span item-type="year-set">《{{ yearPoetrySets[0].name }}》</span>
            {{ yearPoetrySets[0].count }}首稳居榜首；
            <template v-if="yearPoets.length">
              诗词创建数量最多的是
              <span item-type="year-poet">[{{ yearPoets[0].username }}]</span>
              ，共创建{{ yearPoets[0].count }}首。
            </template>
          </p>
        </div>

        <!-- 选集总排行榜 -->
        <div class="info-panel">
          <h2>选集总排行榜</h2>
          <div class="popular-sets" @click="onClickItemType">
            <div
              v-for="item in popularPoetrySets"
              :key="item.id"
              class="popular-set"
              item-type="popular-set"
            >
              {{ item.name }}({{ item.count }}首)
            </div>
          </div>
        </div>

        <!-- 诗词云库 -->
        <div class="info-panel" v-show="hotWordVisible">
          <h2
            title="词频率：全部诗词中出现次数最高的名词，取前20个名词的出现次数总和为基准，进行计算的结果（每天更新）"
          >
            诗词云库
          </h2>
          <poetry-hot-word @loaded="handleHotWordLoaded"></poetry-hot-word>
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
import { getItemIndex, getItemTypeObj } from '@/utils/dom'
import { arrayToMap } from '@/utils/data'
import { getSmallImage } from '@/common/image'
import Cache from '@/common/cache-center'

const HOME_ID = 'home'

export default {
  name: 'Home',

  components: {
    SiteInstruction: () => import('@/components/site-instruction'),
    SghenLogo: () => import('@/components/sghen-logo'),
    PoetryHotWord: () => import('./poetry-hot-word')
  },

  data () {
    return {
      year: new Date().getFullYear() - 1,
      yearPoets: [],
      yearPoetrySets: [],
      popularPoetrySets: [],

      sliderItems: [],
      sliderIndex: 0,
      sliderPoetries: [],
      sliderDuration: 5000,

      dropdownOptions: [
        { label: '我的诗词', value: 'my-list' },
        { label: '我的消息', value: 'my-msgs', slot: 'myMsgs' },
        { label: '个人中心', value: 'personal' },
        { label: '退出', value: 'logout' }
      ],

      hotWordVisible: false
    }
  },

  computed: {
    yearPoetryCount () {
      return this.yearPoetrySets.reduce((v, o) => v + +o.count, 0)
    },
    ...mapGetters({
      isLogin: 'auth/isLogin',
      unReadMsgCountText: 'sysMsg/unReadCountText'
    }),
    ...mapState({
      userID: (state) => state.auth.userID,
      userName: (state) => state.auth.userName,
      userAvatar: (state) => state.auth.userAvatar
    })
  },

  created () {
    window.home = this
    this.checkRestorePageData()
  },

  methods: {
    savePageData () {
      const data = {
        sliderPoetries: this.sliderPoetries,
        sliderItems: this.sliderItems,
        sliderIndex: this.sliderIndex,
        yearPoetrySets: this.yearPoetrySets,
        yearPoets: this.yearPoets,
        popularPoetrySets: this.popularPoetrySets
      }
      Cache.PoetryPageCache.setData(HOME_ID, data)
    },
    resotrePageData () {
      const pageData = Cache.PoetryPageCache.getData(HOME_ID)
      if (pageData) {
        this.sliderPoetries = pageData.sliderPoetries
        this.sliderItems = pageData.sliderItems
        this.sliderIndex = pageData.sliderIndex
        this.yearPoetrySets = pageData.yearPoetrySets
        this.yearPoets = pageData.yearPoets
        this.popularPoetrySets = pageData.popularPoetrySets
        return true
      } else {
        return false
      }
    },
    checkRestorePageData () {
      if (!this.resotrePageData()) {
        this.getYearInfos()
        this.getPopularPoetries()
      }
    },
    getYearInfos () {
      const params = {
        date0: `${this.year}-01-01 00:00:00`,
        date1: `${this.year + 1}-01-01 00:00:00`
      }
      apiGetData(apiURL.poetrySetListYear, params).then((resp) => {
        this.yearPoetrySets = resp.data
      })
      apiGetData(apiURL.poetryUserListYear, params).then((resp) => {
        this.yearPoets = resp.data
      })
      apiGetData(apiURL.poetrySetPopular).then((resp) => {
        this.popularPoetrySets = resp.data
      })
    },
    getPopularPoetries () {
      apiGetData(apiURL.poetryPopular).then((resp) => {
        const { census: comments, list = [], sets, users, images } = resp.data
        const commentMap = arrayToMap(comments)
        const setMap = arrayToMap(sets)
        const userMap = arrayToMap(users)
        const imageMap = arrayToMap(images)
        const imgSrcFunc = Vue.filter('imgSrcFilter')
        list.forEach((o) => {
          o.praiseTotal = +commentMap[o.id].total
          o.set = setMap[o.setId]
          o.user = userMap[o.userId]

          if (imageMap[o.id]) {
            o.images = JSON.parse(imageMap[o.id].images).map((v) =>
              getSmallImage(imgSrcFunc(v))
            )
          } else {
            o.images = []
          }

          let lines = o.content.split('\n')
          const isOver = lines.length > 3
          if (isOver) {
            lines = lines.splice(0, 3)
            lines.push('...')
          }

          o.content = isOver ? lines.join('\n') : o.content
        })
        const orderList = list.sort(function (o0, o1) {
          return o0.praiseTotal > o1.praiseTotal ? -1 : 1
        })
        this.sliderPoetries = orderList
        this.sliderItems = orderList.map((o) => ({ slot: o.id }))
        this.sliderIndex = 0
      })
    },

    handleHotWordLoaded (count) {
      this.hotWordVisible = !!count
    },

    handleDropdown (key) {
      switch (key) {
        case 'my-list':
          this.$router.push({
            name: 'poetry-list',
            query: { uuid: this.userID, username: this.userName }
          })
          break
        case 'my-msgs':
          this.$router.push({ name: 'my-msgs' })
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

    /**
     * 轮播器当前页改变
     */
    onSliderChange (index) {
      if (index >= 0) {
        this.sliderIndex = index
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
        case 'slider-poetry':
          this.$router.push({
            name: 'poetry-detail',
            params: { id: this.sliderPoetries[itemIndex].id }
          })
          break
        case 'popular-set':
          {
            const set = this.popularPoetrySets[itemIndex]
            const query = { setId: set.id, setName: set.name }
            if (set.userId && set.userId !== '0') {
              query.uuid = set.userId
            }
            this.$router.push({ name: 'poetry-list', query })
          }
          break
        case 'year-set':
          {
            const set = this.yearPoetrySets[0]
            this.$router.push({
              name: 'poetry-list',
              query: { setId: set.id, setName: set.name }
            })
          }
          break
        case 'year-poet':
          this.$router.push({
            name: 'personal',
            query: { uuid: this.yearPoets[0].id }
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
    this.savePageData()
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
    box-shadow: 0 0 5px mix($color-theme, white, 30%);
    z-index: 1;
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
    .praise-total {
      position: absolute;
      bottom: 1rem;
      right: 0.5rem;
      color: $color-theme;
      font-size: $size-text;
      .icon-like {
        font-size: $size-text * 1.5;
      }
      i,
      span {
        display: inline-block;
        height: $size-text * 1.5;
        vertical-align: top;
      }
      span {
        line-height: $size-text * 1.8;
      }
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
    margin: 0 -0.6rem;
    line-height: $height-text * 1.2 * 1.5;
    .popular-set {
      display: inline-block;
      padding: 0 1rem;
      margin: 0 0.6rem;
      color: $color-theme;
      font-size: $size-text;
      line-height: $height-text * 1.2;
      border-radius: 1rem;
      background-color: mix($color-theme, white, 25%);
      box-shadow: 0 5px 5px mix($color-theme, white, 50%);
      &:active {
        background-color: mix($color-theme, white, 50%);
        box-shadow: 0 0 5px mix($color-theme, white, 50%);
        transform: translate(0, 2px);
      }
    }
  }

  .menus {
    .menu-item {
      display: inline-block;
      width: 48%;
      // height: 10rem;
      box-sizing: border-box;
      &:nth-child(2n) {
        margin-left: 4%;
      }
    }
  }

  .module-panel {
    padding: 0 1rem;
    box-sizing: border-box;
  }

  .content-wrapper {
    padding: 0 3rem;
    text-align: center;
    max-height: 9.6rem;
    overflow: hidden;
    p {
      display: inline-block;
      text-align: left;
      font-size: 1.4rem;
      line-height: 2.4rem;
      white-space: pre-line;
    }
  }
}

.has-msg {
  &::before {
    content: "•";
    position: relative;
    display: inline-block;
    transform: translate(-10%, -10%);
    font-size: 1.5rem;
    color: $color-theme;
  }
  &.user::before {
    animation: frames-opacity 6000ms 0ms infinite reverse;
  }
}

</style>

<style>
.home .sg-header .left {
  height: 100%;
  padding: 0.3rem 0;
  box-sizing: border-box;
}
@keyframes frames-opacity {
  0%, 80% {
    opacity: 1;
  }
  90% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
