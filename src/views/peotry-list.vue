<template>
  <div class="peotry-list">
    <sg-header>
      <span style="font-size: 1.6rem;">{{title}}</span>
      <span v-show="isSelf" slot="right" class="iconfont icon-increase" @click="onGoNewPeotry"></span>
    </sg-header>

    <div class="main" @click="onClickPoetry">
      <sg-scroll
        v-show="!isEmpty"
        ref="sgScroll"
        :isEnd="isEnd"
        @load="handleLoad"
        @refresh="handleRefresh"
        @scroll="handleScroll"
      >
        <peotry v-for="item in peotries" :key="item.id" :peotry="item" ref="peotries">
          <div v-if="item.timeLine" slot="header" class="time-line">{{item.timeLine}}</div>
        </peotry>
      </sg-scroll>
      <div v-show="isEmpty" class="empty">暂未有诗词</div>
    </div>

    <image-viewer :visible.sync="viewerVisible" :index="imageIndex" :images="images"></image-viewer>

    <peotry-edit v-if="editVisible" @close="editVisible = false"></peotry-edit>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiGetData } from '@/api'
import { getItemIndex, getItemTypeIndex } from '@/utils/sgDom'
import Cache from '@/common/cache-center'

const CACHE_ROOT_ID = 'peotry-list-root'

export default {
  nae: 'PeotryList',

  components: {
    'peotry': () => import('@/components/peotry'),
    'image-viewer': () => import('@/components/image-viewer'),
    'peotry-edit': () => import('@/components/peotry-edit')
  },

  data () {
    return {
      uuid: '',
      page: 1,
      limit: 20,
      isEnd: false,
      peotries: [],
      peotriesLoadCount: 0,

      viewerVisible: false,
      images: [],
      imageIndex: 0,

      editVisible: false
    }
  },

  computed: {
    title () {
      const text = '诗词列表'
      let username = this.$route.query.username
      if (this.uuid !== CACHE_ROOT_ID) {
        if (this.isSelf) {
          username = '我'
        }
        return `${username || 'TA'}的${text}`
      }
      return text
    },
    isSelf () {
      return +this.userID === +this.uuid
    },
    isEmpty () {
      return !this.peotries.length && this.peotriesLoadCount
    },
    ...mapState({
      userID: state => state.auth.userID
    })
  },

  created () {
    window.peotryList = this
    window.GlobalCache = Cache
    this.uuid = this.$route.query.uuid || CACHE_ROOT_ID
    this.scrollItemMap = {}
  },

  beforeRouteUpdate (to, from, next) {
    const sgScroll = this.$refs.sgScroll
    const pageCache = Cache.PeotryPageCache
    pageCache.setData(this.uuid, {
      peotries: this.peotries,
      page: this.page,
      isEnd: this.isEnd,
      scrollTop: sgScroll.getScrollTop()
    })
    next()

    this.uuid = to.query.uuid || CACHE_ROOT_ID
    this.peotriesLoadCount = 0
    this.page = 1
    this.scrollItemMap = {}

    const pageCacheData = pageCache.getData(this.uuid)
    if (pageCacheData) {
      this.peotries = pageCacheData.peotries
      this.page = pageCacheData.page
      this.isEnd = pageCacheData.isEnd
      this.peotriesLoadCount++

      sgScroll.success()
      this.$nextTick(() => {
        sgScroll.setScrollTop(pageCacheData.scrollTop)
      })
    } else {
      this.peotries = []
      sgScroll.refresh()
    }
  },

  methods: {
    handleLoad (isRefresh) {
      if (!isRefresh) {
        this.page += 1
      }
      const params = {
        page: this.page,
        limit: this.limit
        // needComment: true
      }
      if (this.uuid !== CACHE_ROOT_ID) {
        params.userId = this.uuid
      }

      apiGetData(apiURL.peotryList, params)
        .then(data => {
          const list = data.data

          // 判断添加时间线
          let currentYearMonth = 999911
          list.forEach(o => {
            const createDate = new Date(o.time)
            const tempYearMonth =
              createDate.getFullYear() * 100 + createDate.getMonth()
            if (tempYearMonth < currentYearMonth) {
              o.timeLine = `${createDate.getFullYear()}年 ${createDate.getMonth() +
                1}月`
            }
            currentYearMonth = tempYearMonth
          })

          if (isRefresh) {
            this.peotries = list
          } else {
            this.peotries.push(...list)
          }
          this.peotriesLoadCount++
          this.isEnd = this.peotries.length === data.totalCount

          this.$refs.sgScroll.success()
          isRefresh && this.$refs.sgScroll.onScrollToTop()

          if (isRefresh) {
            this.timeHandler = setInterval(() => {
              if (this.$refs.peotries) {
                clearInterval(this.timeHandler)
                this.handleScroll(0, this.$el.clientHeight)
              }
            }, 100)
          }
        })
        .catch(() => {
          this.$refs.sgScroll.fail()
        })
    },
    handleRefresh () {
      this.page = 1
      Cache.PeotryPageCache.delete(this.uuid)
      Cache.UserCache.clear()
      this.handleLoad(true)
    },
    handleScroll (scrollTop, clientHeight) {
      const map = this.scrollItemMap
      this.$refs.peotries.forEach((o, index) => {
        const offsetTop = o.$el.offsetTop
        if (Math.abs(offsetTop - scrollTop) <= clientHeight) {
          const id = this.peotries[index].id
          if (!map[id]) {
            map[id] = true
            o.setScrollIntoView()
          }
        }
      })
    },
    onClickPoetry (e) {
      const target = e.target
      const itemType = target.getAttribute('item-type')
      if (!itemType) {
        return
      }
      const index = getItemTypeIndex(target, 'peotry')
      const peotry = this.peotries[index]
      const instance = this.$refs.peotries[index]
      switch (itemType) {
        case 'peotry-content':
          this.$router.push({
            name: 'peotry-detail',
            params: { id: peotry.id }
          })
          break
        case 'peotry-image':
          this.images = instance.peotryImages
          this.imageIndex = getItemIndex(target.parentElement.parentElement)
          this.viewerVisible = true
          break
        case 'peot-avatar':
          this.$router.push({
            name: 'peotry-list',
            query: { uuid: peotry.user.id, username: peotry.user.username }
          })
          break
        default:
          break
      }
    },
    onGoNewPeotry () {
      this.editVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.peotry-list {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;

  .main {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
  }

  .peotry {
    margin-bottom: 3rem;
    &:first-child {
      margin-top: 2rem;
    }
  }

  .time-line {
    padding: 1rem;
    margin-top: 2rem;
    border-top: 1px solid white;
    font-size: 1.4rem;
    font-weight: bold;
    text-align: right;
  }

  .empty {
    padding: 50% 1rem 1rem;
    text-align: center;
    font-size: 1.2rem;
    color: rgb(161, 161, 161);
  }
}
</style>
