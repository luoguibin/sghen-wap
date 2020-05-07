<template>
  <div class="peotry-detail">
     <sg-header>
      <span style="font-size: 1.6rem;">诗词详情</span>
      <div slot="right">
        <sg-dropdown
          :options="dropdownOptions"
          @change="handleDropdown"
          :pointerVisible="false"
        >
          <span class="iconfont icon-checkmore"></span>
        </sg-dropdown>
      </div>
    </sg-header>

    <div class="main">
      <div class="main-wrapper" @click="onClickPoetry">
        <peotry v-if="peotry" ref="peotry" :peotry="peotry" :isDetail="true">
          <div></div>
        </peotry>
      </div>
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
import { getItemIndex } from '@/utils/sgDom'
import Cache from '@/common/cache-center'

export default {
  name: 'PeotryDetail',

  components: {
    'peotry': () => import('@/components/peotry'),
    'image-viewer': () => import('@/components/image-viewer'),
    'comment-input': () => import('@/components/comment-input'),
    'praise-anime': () => import('@/components/praise-anime')
  },

  data () {
    return {
      peotryID: 0,
      peotry: null,

      dropdownOptions: [],

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
    isSelf () {
      return +this.userID === +this.uuid
    },

    /**
     * @returns {Boolean} 返回是否为当前用户创建的诗词
     */
    isSelfPeotry () {
      const peotry = this.peotry
      return peotry && peotry.user && this.userID === peotry.user.id
    },

    /**
     * @returns {Comment} 返回我的点赞对象
     */
    myPraiseComment () {
      const userID = this.userID
      if (!userID || !this.peotry) return
      return this.peotry.praiseComments.find(
        comment => comment.toId === -1 && comment.fromId === userID
      )
    },

    /**
     * @returns {Boolean} 返回当前登录用户是否点赞当前诗词
     */
    isPraise () {
      return this.myPraiseComment && this.myPraiseComment.content === 'praise'
    },

    ...mapState({
      userID: state => state.auth.userID
    })
  },

  created () {
    window.peotryDetail = this
    window.GlobalCache = Cache
    this.getPeotry()
  },

  beforeRouteUpdate (to, from, next) {
    const pageCache = Cache.PeotryPageCache
    pageCache.setData(this.peotryID, {
      peotry: JSON.stringify(this.peotry)
    })
    next()

    this.peotryID = to.params.id
    const pageCacheData = pageCache.getData(this.peotryID)
    if (pageCacheData) {
      this.peotry = JSON.parse(pageCacheData.peotry)
      this.resetDropdownOptions()
    } else {
      this.getPeotry()
    }
  },

  methods: {
    getPeotry () {
      const id = this.$route.params.id
      this.peotryID = id
      apiGetData(apiURL.peotryList, { id, needComment: true })
        .then(data => {
          const o = data.data
          this.checkPeotry(o)
          this.peotry = o
          this.resetDropdownOptions()
        })
    },

    checkPeotry (peotry) {
      const userCache = Cache.UserCache
      const peotIdMap = []
      const timeFunc = function (o0, o1) {
        // 按时间排序评论列表
        const time0 = new Date(o0.createTime).getTime()
        const time1 = new Date(o1.createTime).getTime()
        return time0 < time1 ? -1 : 1
      }

      const o = peotry
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

      const peotIds = Object.keys(peotIdMap)
      if (!peotIds.length) {
        return
      }
      this.getUsersInfo(peotIds).then(data => {
        const userCache = Cache.UserCache
        data.forEach(o => {
          userCache.setData(+o.id, o)
        })
        this.buildPeotryComments(peotry)
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

    openCommentInput (typeId, fromId, tip) {
      if (!this.userID) {
        this.$toast('请登陆后再操作')
        return
      }
      this.commentVisible = true
      this.commentID = typeId
      this.commentToID = +fromId
      this.commentTip = tip
    },
    onCheckPraisePeotry (e) {
      if (!this.userID) {
        this.$toast('请登陆后再操作')
        return
      }
      if (this.praiseRequesting) {
        return
      }
      this.praiseRequesting = true

      const isPraise = this.isPraise
      const comment = this.myPraiseComment
      if (isPraise) {
        apiPostData(apiURL.commentDelete, {
          id: comment.id,
          fromId: comment.fromId
        })
          .then(data => {
            const comments = this.peotry.praiseComments
            const index = comments.findIndex(o => o.id === comment.id)
            comments.splice(index, 1)
            this.resetDropdownOptions()
          })
          .finally(() => {
            this.praiseRequesting = false
          })
      } else {
        apiPostData(apiURL.commentCreate, {
          type: 1,
          typeId: this.peotry.id,
          content: 'praise',
          fromId: this.userID,
          toId: -1
        })
          .then(({ data }) => {
            data.fromPeot = Cache.UserCache.getData(this.userID)
            data.itemTag = 'opacity'
            this.peotry.praiseComments.push(data)
            this.resetDropdownOptions()

            this.$nextTick(() => {
              this.onPraiseAnime(e, data)
            })
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
    resetDropdownOptions () {
      this.$nextTick(() => {
        const options = [
          { label: this.isPraise ? '取消点赞' : '点赞', value: 'praise' },
          { label: '评论', value: 'comment' }
        ]
        if (this.isSelfPeotry) {
          options.push({ label: '编辑', value: 'edit' })
        }
        this.dropdownOptions = options
      })
    },

    handleDropdown (key, e) {
      const peotry = this.peotry
      switch (key) {
        case 'edit':
          this.$toast('正在码...')
          break
        case 'comment':
          this.openCommentInput(peotry.id, peotry.user.id, '请输入评论')
          break
        case 'praise':
          this.onCheckPraisePeotry(e)
          break
        default:
          break
      }
    },
    onClickPoetry (e) {
      const target = e.target
      const itemType = target.getAttribute('item-type')
      if (!itemType) {
        return
      }

      const peotry = this.peotry
      const instance = this.$refs.peotry
      switch (itemType) {
        case 'peotry-content':
          const time = this.previousTime || 0
          const currentTime = Date.now()
          if (currentTime - time < 300) {
            this.onCheckPraisePeotry(e)
          }
          this.previousTime = currentTime
          break
        case 'peotry-image':
          this.images = instance.peotryImages
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

    handleCommentOk (o) {
      o.fromPeot = Cache.UserCache.getData(+this.userID)
      o.toPeot = Cache.UserCache.getData(+this.commentToID)
      this.peotry.realComments.push(o)
    },

    onPraiseAnime (e, data) {
      const peotry = this.peotry
      const instance = this.$refs.peotry
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
    }
  }
}
</script>

<style lang="scss" scoped>
.peotry-detail {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  overflow: hidden;

  .sg-dropdown {
    display: inline-block;
    background-color: transparent;
  }

  .main {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
  }
  .main-wrapper {
    height: 100%;
    overflow-y: auto;
  }
}
</style>
