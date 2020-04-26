<template>
  <div class="peotry-list" @click.stop="onClickPoetry($event)">
    <sg-scroll v-if="!isEmpty" ref="sgScroll" :isEnd="isEnd" @load="handleLoad" @refresh="handleRefresh">
      <peotry v-for="item in peotries" :key="item.id" :peotry="item" ref="peotries"></peotry>
    </sg-scroll>
    <div v-else class="empty">暂未有诗词</div>

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
import { mapState, mapActions } from 'vuex'
import { apiURL, apiGetData, apiPostData } from '@/api'
import Peotry from '@/components/peotry'

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
    isEmpty () {
      return !this.peotries.length && this.peotriesLoadCount
    },
    ...mapState({
      userID: state => state.auth.userID,
      userInfoMap: state => state.data.userInfoMap
    })
  },

  watch: {
    $route (o) {
      this.uuid = o.query.uuid || ''
      this.peotriesLoadCount = 0
      this.handleRefresh()
    }
  },

  created () {
    window.peotryList = this
    this.uuid = this.$route.query.uuid || ''
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
      if (this.uuid) {
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
        })
        .catch(() => {
          this.$refs.sgScroll.fail()
        })
    },
    handleRefresh () {
      this.page = 1
      this.clearUsersInfo()
      this.handleLoad(true)
    },

    /**
     * @param {Array} list
     */
    checkPeotries (list) {
      const peotInfoMap = this.userInfoMap
      const peotIdMap = []
      const timeFunc = function (o0, o1) {
        // 按时间排序评论列表
        const time0 = new Date(o0.createTime).getTime()
        const time1 = new Date(o1.createTime).getTime()
        return time0 < time1 ? -1 : 1
      }

      list.forEach(o => {
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
            if (peotInfoMap[o_.fromId]) {
              o_.fromPeot = Object.freeze(peotInfoMap[o_.fromId])
            } else {
              peotIdMap[o_.fromId] = true
            }

            if (o_.toId > 0) {
              if (peotInfoMap[o_.toId]) {
                o_.toPeot = Object.freeze(peotInfoMap[o_.toId])
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
        list.forEach(o => {
          this.buildPeotryComments(o)
        })
      })
    },
    buildPeotryComments (peotry) {
      const peotInfoMap = this.userInfoMap
      peotry.praiseComments.forEach(o => {
        if (!o.fromPeot) {
          this.$set(o, 'fromPeot', Object.freeze(peotInfoMap[o.fromId]))
        }
      })
      peotry.realComments.forEach(o => {
        if (!o.fromPeot) {
          this.$set(o, 'fromPeot', Object.freeze(peotInfoMap[o.fromId]))
        }
        if (o.toId > 0 && !o.toPeot) {
          this.$set(o, 'toPeot', Object.freeze(peotInfoMap[o.toId]))
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
              data.fromPeot = this.peotInfoMap[this.userID]
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
          this.$router.push({ name: 'peotry-list', query: { uuid: peotry.user.id } })
          break
        case 'comment-avatar':
          const poet = peotry.praiseComments[getItemIndex(target)].fromPeot
          this.$router.push({ name: 'peotry-list', query: { uuid: poet.id } })
          break
        case 'comment-from':
          const fromIndex = getItemIndex(target.parentElement.parentElement)
          const fromComment = peotry.realComments[fromIndex]
          this.$router.push({ name: 'peotry-list', query: { uuid: fromComment.fromId } })
          break
        case 'comment-to':
          const toIndex = getItemIndex(target.parentElement.parentElement)
          const toComment = peotry.realComments[toIndex]
          this.$router.push({ name: 'peotry-list', query: { uuid: toComment.toId } })
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
      this.commentToID = fromId
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
      const peotry = this.peotries.find(o => o.id === this.commentID)
      if (peotry) {
        o.fromPeot = this.peotInfoMap[this.userID]
        o.toPeot = this.peotInfoMap[this.commentToID]
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

    ...mapActions({
      clearUsersInfo: 'data/clearUsersInfo',
      getUsersInfo: 'data/getUsersInfo'
    })
  }
}
</script>

<style lang="scss" scoped>
.peotry-list {
  position: relative;
  height: 100%;
  overflow: hidden;

  .peotry {
    margin-bottom: 3rem;
    &:first-child {
      margin-top: 2rem;
    }
  }

  .empty {
    padding: 50% 1rem 1rem;
    text-align: center;
    font-size: 1.2rem;
    color: rgb(161, 161, 161);
  }
}
</style>
