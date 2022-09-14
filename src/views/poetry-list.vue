<template>
  <div class="poetry-list">
    <sg-header @back="$router.go(-1)">
      {{title}}
      <span
        v-show="isSelf"
        slot="right"
        class="iconfont icon-increase"
        @click="onGoNewPoetry"
      ></span>
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
        <template v-for="item in poetries">
          <div v-if="item.timeLine" :key="item.id + '-time'" class="time-line sg-sticky-item" item-empty>{{item.timeLine}}</div>
          <poetry :key="item.id" :poetry="item" ref="poetries"></poetry>
        </template>
      </sg-scroll>
      <div v-show="isEmpty" class="empty">暂未有诗词</div>
    </div>

    <image-viewer :visible.sync="viewerVisible" :index="imageIndex" :images="images"></image-viewer>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiGetData } from '@/api'
import { getItemIndex, getItemTypeIndex, getItemTypeObj } from '@/utils/dom'
import Cache from '@/common/cache-center'

const CACHE_ROOT_ID = 'poetry_list_root'

export default {
  nae: 'PoetryList',

  components: {
    poetry: () => import('@/components/poetry'),
    'image-viewer': () => import('@/components/image-viewer')
  },

  data () {
    return {
      uuid: '',
      setId: '',
      setName: '',
      page: 1,
      limit: 20,
      isEnd: false,
      poetries: [],
      isDataReady: false,

      viewerVisible: false,
      images: [],
      imageIndex: 0
    }
  },

  computed: {
    title () {
      if (this.setName) {
        return this.setName
      }
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
      return !this.poetries.length && this.isDataReady
    },
    ...mapState({
      userID: state => state.auth.userID
    })
  },

  mounted () {
    window.poetryList = this
    this.checkRestorePageData()
  },

  beforeRouteUpdate (to, from, next) {
    this.savePageData()
    next()
    this.checkRestorePageData()
  },

  beforeRouteLeave (to, from, next) {
    if (to.name === 'poetry-detail' || to.name === 'personal') {
      this.savePageData()
    }
    next()
  },

  methods: {
    getSaveID () {
      return `${this.uuid}-${this.setId}`
    },
    savePageData () {
      Cache.PoetryPageCache.setData(this.getSaveID(), {
        poetries: this.poetries,
        page: this.page,
        isEnd: this.isEnd,
        scrollTop: this.$refs.sgScroll.getScrollTop()
      })
    },
    restorePageData () {
      const pageCacheData = Cache.PoetryPageCache.getData(this.getSaveID())
      if (!pageCacheData) {
        return false
      }

      this.poetries = pageCacheData.poetries
      this.page = pageCacheData.page
      this.isEnd = pageCacheData.isEnd
      this.isDataReady = true

      this.$refs.sgScroll.success()
      this.$nextTick(() => {
        this.$refs.sgScroll.setScrollTop(pageCacheData.scrollTop)
        this.checkPoetriesVisible()
      })
      return true
    },
    checkRestorePageData () {
      const query = this.$route.query
      // 强制转换为string作为id
      this.uuid = query.uuid ? '' + query.uuid : CACHE_ROOT_ID
      this.setId = query.setId ? '' + query.setId : ''
      this.setName = query.setName ? query.setName : ''
      this.scrollItemMap = {}

      // 若删除了诗词，列表应该刷新
      const optionData = Cache.OptionCache.getData(Cache.OPTION.DELETE)
      if (!optionData || optionData.type !== 'poetry') {
        if (this.restorePageData()) {
          return
        }
      }
      if (optionData) {
        Cache.OptionCache.delete(Cache.OPTION.DELETE)
      }
      this.isDataReady = false
      this.page = 1
      this.poetries = []
      this.$refs.sgScroll.refresh()
    },

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
      if (this.setId) {
        params.setId = this.setId
      }
      const keyword = this.$route.query.keyword
      if (keyword) {
        params.content = keyword
      }

      apiGetData(apiURL.poetryList, params)
        .then(data => {
          const { total, list } = data.data

          if (isRefresh) {
            this.poetries = list
          } else {
            this.poetries.push(...list)
          }
          // 判断添加时间线
          let currentYearMonth = 999911
          const nowYear = new Date().getFullYear()
          this.poetries.forEach(o => {
            const createDate = new Date(o.time)
            const tempYearMonth =
              createDate.getFullYear() * 100 + createDate.getMonth()
            if (tempYearMonth < currentYearMonth) {
              o.timeLine = `${
                createDate.getFullYear() === nowYear
                  ? '今'
                  : createDate.getFullYear()
              }年 ${createDate.getMonth() + 1}月`
            }
            currentYearMonth = tempYearMonth
          })
          this.isDataReady = true
          this.isEnd = this.poetries.length === total

          this.$refs.sgScroll.success()
          isRefresh && this.$refs.sgScroll.onScrollToTop()

          isRefresh && this.checkPoetriesVisible()
        })
        .catch(() => {
          this.$refs.sgScroll.fail()
        })
    },
    handleRefresh () {
      this.page = 1
      this.scrollItemMap = {}
      Cache.PoetryPageCache.delete(this.getSaveID())
      Cache.UserCache.clear()
      this.handleLoad(true)
    },
    checkPoetriesVisible () {
      this.timeHandler = setInterval(() => {
        if (this.$refs.poetries) {
          clearInterval(this.timeHandler)
          this.handleScroll(0, this.$el.clientHeight)
        }
      }, 100)
    },
    handleScroll (scrollTop, clientHeight) {
      const map = this.scrollItemMap
      this.$refs.poetries.forEach((o, index) => {
        const offsetTop = o.$el.offsetTop
        if (Math.abs(offsetTop - scrollTop) <= clientHeight) {
          const id = this.poetries[index].id
          if (!map[id]) {
            map[id] = true
            o.setScrollIntoView()
          }
        }
      })
    },
    onClickPoetry (e) {
      const { el, itemType } = getItemTypeObj(e.target) || {}
      if (!itemType) {
        return
      }

      const itemIndex = getItemIndex(el)
      const index = getItemTypeIndex(el, 'poetry')
      const poetry = this.poetries[index]
      const instance = this.$refs.poetries[index]
      switch (itemType) {
        case 'poetry-content':
          sessionStorage.setItem('poetry-detail', JSON.stringify(poetry))
          this.$router.push({
            name: 'poetry-detail',
            params: { id: poetry.id }
          })
          break
        case 'poetry-image':
          this.images = instance.poetryImages
          this.imageIndex = itemIndex
          this.viewerVisible = true
          break
        case 'poet-avatar':
          this.$router.push({
            name: 'personal',
            query: { uuid: poetry.user.id, username: poetry.user.username }
          })
          break
        default:
          break
      }
    },
    onGoNewPoetry () {
      this.$router.push({
        name: 'poetry-edit',
        params: { id: 'new' },
        query: { setId: this.setId, setName: this.setName }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.poetry-list {
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

  .poetry {
    margin-bottom: 3rem;
    &:first-child {
      margin-top: 2rem;
    }
  }

  .time-line {
    padding: 1rem;
    border-top: 1px solid white;
    font-size: 1.4rem;
    font-weight: bold;
    text-align: right;
    box-sizing: border-box;
    background-color: #f6f6f6;
  }
  .sg-sticking {
    z-index: 99;
  }

  .empty {
    padding: 50% 1rem 1rem;
    text-align: center;
    font-size: 1.2rem;
    color: rgb(161, 161, 161);
  }
}
</style>
