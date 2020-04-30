<template>
  <div class="peotry-list" @click.stop="onClickPoetry($event)">
    <sg-header>
      <span style="font-size: 1.6rem;">{{title}}</span>
      <span v-show="isSelf" slot="right" class="iconfont icon-increase" @click="onGoNewPeotry"></span>
    </sg-header>

    <div class="main">
      <sg-scroll
        v-show="!isEmpty"
        ref="sgScroll"
        :isEnd="isEnd"
        @load="handleLoad"
        @refresh="handleRefresh"
      >
        <peotry v-for="item in peotries" :key="item.id" :peotry="item" ref="peotries">
          <div v-if="item.timeLine" slot="header" class="time-line">{{item.timeLine}}</div>
        </peotry>
      </sg-scroll>
      <div v-show="isEmpty" class="empty">暂未有诗词</div>
    </div>

    <image-viewer :visible.sync="viewerVisible" :index="imageIndex" :images="images"></image-viewer>

    <comment-input
      :visible.sync="commentVisible"
      :id="commentID"
      :toId="commentToID"
      :placeholder="commentTip"
      @ok="handleCommentOk"
    ></comment-input>

    <praise-anime
      v-if="praiseVisible"
      :id="praiseId"
      :from="praiseFromStyle"
      :to="praiseToStyle"
      @end="handleAnimeEnd"
    ></praise-anime>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiGetData, apiPostData } from '@/api'
import Cache from '@/common/cache-center'
import Peotry from '@/components/peotry'

const CACHE_ROOT_ID = 'root'

export default {
  nae: 'PeotryList',

  components: {
    Peotry,
    'image-viewer': () => import('@/components/image-viewer'),
    'comment-input': () => import('@/components/comment-input'),
    'praise-anime': () => import('@/components/praise-anime')
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

      commentVisible: false,
      commentID: 0,
      commentToID: 0,
      commentTip: '请输入',

      praiseVisible: false,
      praiseId: 0,
      praiseFromStyle: {},
      praiseToStyle: {},
      praiseMap: {}
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
        limit: this.limit,
        needComment: true
      }
      if (this.uuid !== CACHE_ROOT_ID) {
        params.userId = this.uuid
      }

      apiGetData(apiURL.peotryList, params)
        .then(data => {
          const list = data.data
          this.checkPeotries(list)
          if (isRefresh) {
            this.peotries = list
          } else {
            this.peotries.push(...list)
          }
          this.peotriesLoadCount++
          this.isEnd = this.peotries.length === data.totalCount

          this.$refs.sgScroll.success()
          isRefresh && this.$refs.sgScroll.onScrollToTop()
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

    /**
     * @param {Array} list
     */
    checkPeotries (list) {
      const userCache = Cache.UserCache
      const peotIdMap = []
      const timeFunc = function (o0, o1) {
        // 按时间排序评论列表
        const time0 = new Date(o0.createTime).getTime()
        const time1 = new Date(o1.createTime).getTime()
        return time0 < time1 ? -1 : 1
      }
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

        if (o.user) {
          o.user = Object.freeze(o.user)
        }
        if (!o.comments) {
          o.comments = []
          o.praiseComments = []
          o.realComments = []
        } else {
          const praiseComments = []
          const realComments = []
          o.comments.forEach(o_ => {
            // 判断评论的创建者
            if (userCache.getData(o_.fromId)) {
              o_.fromPeot = Object.freeze(userCache.getData(o_.fromId))
            } else {
              peotIdMap[o_.fromId] = true
            }

            if (o_.toId > 0) {
              if (userCache.getData(o_.toId)) {
                o_.toPeot = Object.freeze(userCache.getData(o_.toId))
              } else {
                peotIdMap[o_.toId] = true
              }
              realComments.push(o_)
            } else {
              if (o_.toId === -1 && o_.content === 'praise') {
                praiseComments.push(o_)
              }
            }
          })
          o.praiseComments = praiseComments.sort(timeFunc)
          o.realComments = realComments.sort(timeFunc)
        }
      })

      const peotIds = Object.keys(peotIdMap)
      if (!peotIds.length) {
        return
      }
      this.getUsersInfo(peotIds).then(data => {
        const userCache = Cache.UserCache
        data.forEach(o => {
          userCache.setData(+o.id, o)
        })
        list.forEach(o => {
          this.buildPeotryComments(o)
        })
      })
    },
    getUsersInfo (ids) {
      const reqs = []
      const max = 100
      const len = Math.ceil(ids.length / max)
      for (let i = 0; i < len; i++) {
        reqs.push(
          apiGetData(apiURL.userInfoList, {
            datas: ids.slice(i * max, i * max + max).toString()
          })
        )
      }
      return Promise.all(reqs).then(results => {
        let data = []
        results.forEach(o => {
          data = data.concat(o.data)
        })
        return data
      })
    },
    buildPeotryComments (peotry) {
      const userCache = Cache.UserCache
      peotry.praiseComments.forEach(o => {
        if (!o.fromPeot) {
          this.$set(o, 'fromPeot', Object.freeze(userCache.getData(o.fromId)))
        }
      })
      peotry.realComments.forEach(o => {
        if (!o.fromPeot) {
          this.$set(o, 'fromPeot', Object.freeze(userCache.getData(o.fromId)))
        }
        if (o.toId > 0 && !o.toPeot) {
          this.$set(o, 'toPeot', Object.freeze(userCache.getData(o.toId)))
        }
      })
    },

    onClickPoetry (e) {
      const target = e.target
      const itemType = target.getAttribute('item-type')
      if (!itemType) {
        return
      }

      const getItemIndex = function (el) {
        let index = -1
        while (el) {
          index++
          el = el.previousElementSibling
        }
        return index
      }
      const getPeotryIndex = function (el) {
        let tempEl = el
        while (tempEl) {
          if (tempEl.getAttribute('item-type') === 'peotry') {
            break
          } else {
            tempEl = tempEl.parentElement
          }
        }
        return getItemIndex(tempEl)
      }
      const index = getPeotryIndex(target)
      const peotry = this.peotries[index]
      const peotryInstance = this.$refs.peotries[index]
      switch (itemType) {
        case 'peotry-content':
          const time = this.previousTime || 0
          const currentTime = Date.now()
          if (currentTime - time < 300) {
            this.onPraisePeotry(peotry, peotryInstance, data => {
              data.fromPeot = Cache.UserCache.getData(this.userID)
              data.itemTag = 'opacity'
              peotry.praiseComments.push(data)

              this.$nextTick(() => {
                this.onPraiseAnime(peotry, peotryInstance, e, data)
              })
            })
          }
          this.previousTime = currentTime
          break
        case 'peotry-image':
          this.images = peotryInstance.peotryImages
          this.imageIndex = getItemIndex(target.parentElement.parentElement)
          this.viewerVisible = true
          break
        case 'peot':
          this.openCommentInput(peotry.id, peotry.user.id, '请输入评论')
          break
        case 'peot-avatar':
          this.$router.push({
            name: 'peotry-list',
            query: { uuid: peotry.user.id, username: peotry.user.username }
          })
          break
        case 'comment-avatar':
          const poet = peotry.praiseComments[getItemIndex(target)].fromPeot
          this.$router.push({
            name: 'peotry-list',
            query: { uuid: poet.id, username: poet.username }
          })
          break
        case 'comment-from':
          const fromIndex = getItemIndex(target.parentElement.parentElement)
          const fromComment = peotry.realComments[fromIndex]
          this.$router.push({
            name: 'peotry-list',
            query: { uuid: fromComment.fromId }
          })
          break
        case 'comment-to':
          const toIndex = getItemIndex(target.parentElement.parentElement)
          const toComment = peotry.realComments[toIndex]
          this.$router.push({
            name: 'peotry-list',
            query: { uuid: toComment.toId }
          })
          break
        case 'comment-content':
          const commentIndex = getItemIndex(target.parentElement)
          this.onClickComment(peotry, peotry.realComments[commentIndex])
          break
        default:
          break
      }
    },
    onClickComment (peotry, comment) {
      if (!this.userID) {
        this.$toast('请登陆后再操作')
        return
      }

      if (this.userID === comment.fromId) {
        // 当前评论是当前用户创建
        this.$confirm({
          title: '提示',
          content: '是否删除该评论?',
          confirm: () => {
            this.deleteComment(peotry, comment)
          }
        })
        return
      }
      this.openCommentInput(
        comment.typeId,
        comment.fromId,
        `回复 ${comment.fromPeot.username}`
      )
    },
    openCommentInput (typeId, fromId, tip) {
      this.commentVisible = true
      this.commentID = typeId
      this.commentToID = +fromId
      this.commentTip = tip
    },
    onPraisePeotry (peotry, instance, call) {
      if (!this.userID) {
        this.$toast('请登陆后再操作')
        return
      }
      if (this.praiseRequesting) {
        return
      }
      this.praiseRequesting = true
      const isPraise = instance.isPraise
      const comment = instance.myPraiseComment
      if (isPraise) {
        apiPostData(apiURL.commentDelete, {
          id: comment.id,
          fromId: comment.fromId
        })
          .then(data => {
            const comments = peotry.praiseComments
            const index = comments.findIndex(o => o.id === comment.id)
            comments.splice(index, 1)
          })
          .finally(() => {
            this.praiseRequesting = false
          })
      } else {
        apiPostData(apiURL.commentCreate, {
          type: 1,
          typeId: peotry.id,
          content: 'praise',
          fromId: this.userID,
          toId: -1
        })
          .then(data => {
            call && call(data.data)
          })
          .finally(() => {
            this.praiseRequesting = false
          })
      }
    },
    deleteComment (peotry, comment) {
      apiPostData(apiURL.commentDelete, {
        id: comment.id,
        fromId: comment.fromId
      }).then(data => {
        const comments = peotry.realComments
        const index = comments.findIndex(o => o.id === comment.id)
        comments.splice(index, 1)
      })
    },

    handleCommentOk (o) {
      const userCache = Cache.UserCache
      const peotry = this.peotries.find(o => o.id === this.commentID)
      if (peotry) {
        o.fromPeot = userCache.getData(+this.userID)
        o.toPeot = userCache.getData(+this.commentToID)
        peotry.realComments.push(o)
      } else {
        console.log('comment peotry is not exist', o)
      }
    },

    onPraiseAnime (peotry, instance, e, data) {
      const commentsEl = instance.$refs.comments
      if (!commentsEl) {
        return
      }
      const avatarsEl = commentsEl.$refs.avatars
      let tempEl = commentsEl.$el
      if (avatarsEl.children.length) {
        tempEl = avatarsEl.children[avatarsEl.children.length - 1]
      }
      const rect = tempEl.getBoundingClientRect()
      // console.log(tempEl, rect, this.$refs.anime)
      this.praiseFromStyle = {
        left: e.clientX + 'px',
        top: e.clientY + 'px'
      }
      this.praiseToStyle = {
        left: rect.left + rect.width / 2 + 'px',
        top: rect.top + rect.height / 2 + 'px'
      }
      this.praiseId = peotry.id
      this.praiseVisible = true
      this.praiseMap[peotry.id] = {
        peotry,
        data
      }
    },
    handleAnimeEnd (id) {
      const obj = this.praiseMap[id]
      if (!obj) {
        return
      }
      this.praiseVisible = false
      obj.data.itemTag = ''
      delete this.praiseMap[id]
    },

    onGoNewPeotry () {
      this.$toast('正在码...')
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
