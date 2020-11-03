<template>
  <div class="peotry-detail">
    <sg-header @back="onBack">
      诗词详情
      <div slot="right"></div>
    </sg-header>

    <div class="main">
      <div ref="wrapper" class="main-wrapper" @click="onClickPoetry" sg-scroll="vertical_stop">
        <peotry v-if="peotry" ref="peotry" :peotry="peotry" :isDetail="true"></peotry>
      </div>
    </div>

    <image-viewer v-if="peotry" :visible.sync="viewerVisible" :index="imageIndex" :images="images"></image-viewer>

    <comment-input
      v-if="peotry"
      :visible.sync="commentVisible"
      :id="commentID"
      :typeUserId="commentTypeUserID"
      :toId="commentToID"
      :placeholder="commentTip"
      @ok="handleCommentOk"
    ></comment-input>

    <transition name="slide">
      <div v-if="peotry"  v-show="menusVisible" class="right-menus">
        <div class="menu-item" @click="handleDropdown('praise', $event)">
          <div :class="{'is-praise': isPraise}">
            <i class="iconfont icon-like"></i>
          </div>
          <span>{{peotry.praiseTotal | numFilter}}</span>
        </div>
        <div class="menu-item" @click="handleDropdown('comment', $event)">
          <div>
            <i class="iconfont icon-message"></i>
          </div>
          <span>{{peotry.commentTotal | numFilter}}</span>
        </div>
        <div v-if="isSelfPeotry" class="menu-item" @click="handleDropdown('edit', $event)">
          <div>
            <i class="iconfont icon-edit"></i>
          </div>
        </div>
        <div v-if="isSelfPeotry" class="menu-item" @click="handleDropdown('delete', $event)">
          <div>
            <i class="iconfont icon-delete"></i>
          </div>
        </div>
      </div>
    </transition>

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
import { mapState, mapGetters } from 'vuex'
import { apiURL, apiGetData, apiPostData } from '@/api'
import { getItemIndex, getItemTypeIndex, getItemTypeObj } from '@/utils/dom'
import { arrayToMap } from '@/utils/data'
import Cache from '@/common/cache-center'
import { PEOTRY } from '@/const'

export default {
  name: 'PeotryDetail',

  components: {
    peotry: () => import('@/components/peotry'),
    'image-viewer': () => import('@/components/image-viewer'),
    'comment-input': () => import('@/components/comment-input'),
    'praise-anime': () => import('@/components/praise-anime')
  },

  data () {
    return {
      peotryID: 0,
      peotry: null,

      menusVisible: true,

      viewerVisible: false,
      images: [],
      imageIndex: 0,

      myPraiseComment: null,
      commentVisible: false,
      commentID: 0,
      commentTypeUserID: 0,
      commentToID: 0,
      commentTip: '请输入',

      praiseVisible: false,
      praiseId: 0,
      praiseFromStyle: {},
      praiseToStyle: {},
      praiseMap: {},

      praiseOffset: 0,
      commentOffset: 0,
      pageLimit: 20
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
     * @returns {Boolean} 返回当前登录用户是否点赞当前诗词
     */
    isPraise () {
      return !!this.myPraiseComment
    },

    ...mapState({
      userID: state => state.auth.userID
    }),
    ...mapGetters({
      selfPublicInfo: 'auth/selfPublicInfo'
    })
  },

  created () {
    window.peotryDetail = this
    this.checkRestorePageData()
  },

  beforeRouteUpdate (to, from, next) {
    this.savePageData()
    next()
    this.checkRestorePageData()
  },

  beforeRouteLeave (to, from, next) {
    this.savePageData()
    next()
  },

  methods: {
    onBack () {
      this.$router.go(-1)
    },

    savePageData () {
      Cache.PeotryPageCache.setData(this.peotryID, {
        peotry: this.peotry,
        praiseOffset: this.praiseOffset,
        commentOffset: this.commentOffset,
        scrollTop: this.$refs.wrapper.scrollTop,
        myPraiseComment: this.myPraiseComment
      })
    },
    restorePageData () {
      const pageCacheData = Cache.PeotryPageCache.getData(this.peotryID)
      if (!pageCacheData) {
        return false
      }

      this.peotry = pageCacheData.peotry
      this.praiseOffset = pageCacheData.praiseOffset
      this.commentOffset = pageCacheData.commentOffset
      this.myPraiseComment = pageCacheData.myPraiseComment

      this.$nextTick(() => {
        this.$refs.wrapper.scrollTop = pageCacheData.scrollTop
      })
      return true
    },
    checkRestorePageData () {
      this.peotryID = this.$route.params.id
      if (!this.restorePageData()) {
        this.getPeotryDetail()
      }
    },

    getPeotryDetail () {
      const setSimplePeotry = o => {
        o.praiseTotal = -1
        o.praiseComments = []
        o.commentTotal = -1
        o.realComments = []
        if (o.user) {
          o.user = Object.freeze(o.user)
        }
        this.peotry = o
        this.checkPraisePeotry()
        this.getContentComments()
        this.getPraiseComments()
      }

      const temp = sessionStorage.getItem('peotry-detail')
      if (temp) {
        const o = JSON.parse(temp)
        if (this.peotryID === o.id) {
          setSimplePeotry(o)
          return
        }
        sessionStorage.removeItem('peotry-detail')
      }

      apiGetData(apiURL.peotryList, { id: this.peotryID }).then(data => {
        setSimplePeotry(data.data)
      })
    },

    checkPraisePeotry () {
      if (!this.userID) {
        return
      }
      this.praiseRequesting = true
      apiGetData(apiURL.commentPraiseCheck, {
        id: this.peotryID,
        userId: this.userID
      })
        .then(resp => {
          const { list = [], users } = resp.data
          if (!list.length) {
            this.myPraiseComment = undefined
            return
          }
          list[0].fromPeot = users[0] || {}
          list[0].toPeot = {}
          this.myPraiseComment = this.formatComments(list)[0]
        })
        .finally(() => {
          this.praiseRequesting = false
        })
    },

    getContentComments (isReset) {
      if (isReset) {
        this.commentOffset = 0
      }
      apiGetData(apiURL.commentContent, {
        id: this.peotryID,
        limit: this.pageLimit,
        offset: this.commentOffset
      }).then(resp => {
        const { list = [], fromUsers = [], toUsers = [], count } = resp.data
        const userMap = { ...arrayToMap(fromUsers), ...arrayToMap(toUsers) }
        const comments = this.formatComments(list)
        comments.forEach(o => {
          const fromInfo = userMap[o.fromId]
          o.fromPeot = {
            id: fromInfo.id,
            username: fromInfo.user_name,
            avatar: fromInfo.avatar
          }
          const toInfo = userMap[o.toId]
          o.toPeot = {
            id: toInfo.id,
            username: toInfo.user_name,
            avatar: toInfo.avatar
          }
        })

        const peotry = this.peotry
        if (isReset) {
          peotry.realComments = comments
        } else {
          peotry.realComments.push(...comments)
        }
        peotry.commentTotal = count

        this.commentOffset += this.pageLimit
      })
    },
    getPraiseComments (isReset) {
      if (isReset) {
        this.praiseOffset = 0
      }
      apiGetData(apiURL.commentPraise, {
        id: this.peotryID,
        limit: this.pageLimit,
        offset: this.praiseOffset
      }).then(resp => {
        const data = resp.data
        if (!data || data.length < 2) {
          return
        }
        const { list = [], users = [], count } = resp.data
        const userMap = arrayToMap(users)
        const comments = this.formatComments(list)
        comments.forEach(o => {
          const info = userMap[o.fromId]
          o.fromPeot = {
            id: info.id,
            username: info.user_name,
            avatar: info.avatar
          }
          o.toPeot = {}
        })

        const peotry = this.peotry
        if (isReset) {
          peotry.praiseComments = comments
        } else {
          peotry.praiseComments.push(...comments)
        }
        peotry.praiseTotal = count

        this.praiseOffset += this.pageLimit
      })
    },
    formatComments (comments = []) {
      return comments.map(o => {
        return {
          id: o.id,
          fromId: o.from_id,
          toId: o.to_id,
          content: o.content,
          createTime: o.create_time,
          type: o.type,
          typeId: o.type_id
        }
      })
    },

    openCommentInput (typeId, fromId, tip) {
      if (!this.userID) {
        this.$toastLogin()
        return
      }
      this.commentVisible = true
      this.commentID = typeId
      this.commentTypeUserID = this.peotry.user.id
      this.commentToID = +fromId
      this.commentTip = tip
    },
    onCheckPraisePeotry (e) {
      if (!this.userID) {
        this.$toastLogin()
        return
      }
      // null判断表示没请求到是否点赞该诗词数据
      if (this.praiseRequesting || this.myPraiseComment === null) {
        return
      }

      this.praiseRequesting = true
      const comment = this.myPraiseComment
      if (this.isPraise) {
        apiPostData(apiURL.commentDelete, {
          id: comment.id,
          fromId: comment.fromId
        })
          .then(data => {
            const { praiseComments } = this.peotry
            const index = praiseComments.findIndex(o => o.id === comment.id)
            if (index >= 0) {
              praiseComments.splice(index, 1)
              this.praiseOffset -= 1
            }
            this.peotry.praiseTotal -= 1
            this.myPraiseComment = undefined
          })
          .finally(() => {
            this.praiseRequesting = false
          })
      } else {
        apiPostData(apiURL.commentCreate, {
          type: 1,
          typeId: this.peotry.id,
          typeUserId: this.peotry.user.id,
          content: 'praise',
          fromId: this.userID,
          toId: -1
        })
          .then(({ data }) => {
            const comment = data
            const { praiseTotal, praiseComments } = this.peotry
            if (praiseTotal === praiseComments.length) {
              comment.fromPeot = JSON.parse(
                JSON.stringify(this.selfPublicInfo)
              )
              comment.itemTag = 'opacity'
              praiseComments.push(comment)
            }
            this.myPraiseComment = comment
            this.peotry.praiseTotal += 1

            this.$nextTick(() => {
              this.onPraiseAnime(e, comment)
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
        this.getContentComments(true)
      })
    },

    handleDropdown (key, e) {
      const peotry = this.peotry
      switch (key) {
        case 'edit':
          const editPeotry = {
            id: peotry.id,
            set: peotry.set,
            title: peotry.title,
            content: peotry.content,
            end: peotry.end
          }
          sessionStorage.setItem(PEOTRY.EDIT_DATA, JSON.stringify(editPeotry))
          this.$router.push({
            name: 'peotry-edit',
            params: { id: editPeotry.id }
          })
          break
        case 'comment':
          this.openCommentInput(peotry.id, this.userID, '请输入评论')
          break
        case 'praise':
          this.onCheckPraisePeotry(e)
          break
        case 'delete':
          this.$confirm({
            title: '删除提示',
            content: '诗词删除后将无法找回，请确认!',
            confirm: () => {
              apiPostData(apiURL.peotryDelete, {
                userId: this.userID,
                id: this.peotry.id
              }).then(resp => {
                this.$toast('删除成功')
                Cache.PeotryPageCache.delete(this.peotryID)
                Cache.OptionCache.setData(Cache.OPTION.DELETE, {
                  id: this.peotryID,
                  type: 'peotry'
                })
                this.onBack()
              })
            }
          })
          break
        default:
          break
      }
    },
    onClickPoetry (e) {
      const { el, itemType } = getItemTypeObj(e.target) || {}
      if (!itemType) {
        this.menusVisible = !this.menusVisible
        return
      }

      const peotry = this.peotry
      const itemIndex = getItemIndex(el)
      const commentIndex = getItemTypeIndex(el, 'comment')

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
          this.images = this.$refs.peotry.peotryImages
          this.imageIndex = itemIndex
          this.viewerVisible = true
          break
        case 'peot':
          this.openCommentInput(peotry.id, this.userID, '请输入评论')
          break
        case 'peot-avatar':
          this.$router.push({
            name: 'personal',
            query: { uuid: peotry.user.id, username: peotry.user.username }
          })
          break
        case 'comment-avatar':
          const poet = peotry.praiseComments[itemIndex].fromPeot
          this.$router.push({
            name: 'personal',
            query: { uuid: poet.id, username: poet.username }
          })
          break
        case 'comment-from':
          const fromComment = peotry.realComments[commentIndex]
          this.$router.push({
            name: 'personal',
            query: { uuid: fromComment.fromId }
          })
          break
        case 'comment-to':
          const toComment = peotry.realComments[commentIndex]
          this.$router.push({
            name: 'personal',
            query: { uuid: toComment.toId }
          })
          break
        case 'comment-content':
          this.onClickComment(peotry, peotry.realComments[commentIndex])
          break
        case 'avatars-more':
          this.getPraiseComments()
          break
        case 'comments-more':
          this.getContentComments()
          break
        default:
          this.menusVisible = !this.menusVisible
          break
      }
    },
    onClickComment (peotry, comment) {
      if (!this.userID) {
        this.$toastLogin()
        return
      }
      if ('' + this.userID === '' + comment.fromId) {
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
      Cache.UserCache.setData(comment.fromId, comment.fromPeot)
      this.openCommentInput(
        comment.typeId,
        comment.fromId,
        `回复 ${comment.fromPeot.username}`
      )
    },
    handleCommentOk (o) {
      const { commentTotal, realComments } = this.peotry
      if (commentTotal === realComments.length) {
        o.fromPeot = JSON.parse(JSON.stringify(this.selfPublicInfo))
        o.toPeot = Cache.UserCache.getData(+this.commentToID)
        realComments.push(o)
      }
      this.peotry.commentTotal += 1
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
@import "@/ui/style/const.scss";

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
    padding: 1rem 0;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .right-menus {
    position: fixed;
    right: 0;
    top: 11rem;
    padding: 1rem;
    background-color: rgba($color-theme, 0.5);
    opacity: 1;
    border-radius: 1rem 0 0 1rem/1rem 0 0 1rem;
    .menu-item {
      text-align: center;
      color: white;
    }
    .menu-item + .menu-item {
      margin-top: 1.5rem;
    }
    .iconfont {
      font-size: 2rem;
    }
    .is-praise .icon-like {
      color: $color-theme;
    }
  }
  .slide-enter,
  .slide-leave-to {
    right: -5rem;
    opacity: 0;
  }
  .slide-enter-active,
  .slide-leave-active {
    transition: opacity 0.3s ease, right 0.3s ease;
  }
}
</style>
