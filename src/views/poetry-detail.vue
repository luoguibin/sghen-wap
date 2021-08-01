<template>
  <div class="poetry-detail">
    <sg-header @back="onBack">
      诗词详情
      <div slot="right"></div>
    </sg-header>

    <div class="main">
      <div ref="wrapper" class="main-wrapper" @click="onClickPoetry" sg-scroll="vertical_stop">
        <poetry v-if="poetry" ref="poetry" :poetry="poetry" :isDetail="true"></poetry>
      </div>
    </div>

    <image-viewer v-if="poetry" :visible.sync="viewerVisible" :index="imageIndex" :images="images"></image-viewer>

    <comment-input
      v-if="poetry"
      :visible.sync="commentVisible"
      :id="commentID"
      :typeUserId="commentTypeUserID"
      :toId="commentToID"
      :placeholder="commentTip"
      @ok="handleCommentOk"
    ></comment-input>

    <transition name="slide">
      <div v-if="poetry"  v-show="menusVisible" class="right-menus">
        <div class="menu-item" @click="handleDropdown('praise', $event)">
          <div :class="{'is-praise': isPraise}">
            <i class="iconfont icon-like"></i>
          </div>
          <span>{{poetry.praiseTotal | numFilter(true)}}</span>
        </div>
        <div class="menu-item" @click="handleDropdown('comment', $event)">
          <div>
            <i class="iconfont icon-message"></i>
          </div>
          <span>{{poetry.commentTotal | numFilter(true)}}</span>
        </div>
        <div v-if="isSelfPoetry" class="menu-item" @click="handleDropdown('edit', $event)">
          <div>
            <i class="iconfont icon-edit"></i>
          </div>
        </div>
        <div v-if="isSelfPoetry" class="menu-item" @click="handleDropdown('delete', $event)">
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
import Cache from '@/common/cache-center'
import { PEOTRY } from '@/const'

export default {
  name: 'PoetryDetail',

  components: {
    poetry: () => import('@/components/poetry'),
    'image-viewer': () => import('@/components/image-viewer'),
    'comment-input': () => import('@/components/comment-input'),
    'praise-anime': () => import('@/components/praise-anime')
  },

  data () {
    return {
      poetryID: 0,
      poetry: null,

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
    isSelfPoetry () {
      const poetry = this.poetry
      return poetry && poetry.user && this.userID === (poetry.poetId || poetry.user.id)
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
    window.poetryDetail = this
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
      Cache.PoetryPageCache.setData(this.poetryID, {
        poetry: this.poetry,
        praiseOffset: this.praiseOffset,
        commentOffset: this.commentOffset,
        scrollTop: this.$refs.wrapper.scrollTop,
        myPraiseComment: this.myPraiseComment
      })
    },
    restorePageData () {
      const pageCacheData = Cache.PoetryPageCache.getData(this.poetryID)
      if (!pageCacheData) {
        return false
      }

      this.poetry = pageCacheData.poetry
      this.praiseOffset = pageCacheData.praiseOffset
      this.commentOffset = pageCacheData.commentOffset
      this.myPraiseComment = pageCacheData.myPraiseComment
      if (!this.myPraiseComment) {
        this.checkPraisePoetry()
      }

      this.$nextTick(() => {
        this.$refs.wrapper.scrollTop = pageCacheData.scrollTop
      })
      return true
    },
    checkRestorePageData () {
      this.poetryID = this.$route.params.id
      if (!this.restorePageData()) {
        this.getPoetryDetail()
      }
    },

    getPoetryDetail () {
      const setSimplePoetry = o => {
        o.praiseTotal = -1
        o.praiseComments = []
        o.isPraiseLoading = false
        o.commentTotal = -1
        o.realComments = []
        o.isCommentLoading = false
        if (o.user) {
          o.user = Object.freeze(o.user)
        }
        this.poetry = o
        this.checkPraisePoetry()
        this.getContentComments()
        this.getPraiseComments()
      }

      const temp = sessionStorage.getItem('poetry-detail')
      if (temp) {
        const o = JSON.parse(temp)
        if (this.poetryID === o.id) {
          setSimplePoetry(o)
          return
        }
        sessionStorage.removeItem('poetry-detail')
      }

      apiGetData(apiURL.poetryList, { id: this.poetryID }).then(data => {
        setSimplePoetry(data.data)
      })
    },

    checkPraisePoetry () {
      if (!this.userID) {
        return
      }
      this.praiseRequesting = true
      apiGetData(apiURL.praiseCheck, {
        poetryId: this.poetryID
      })
        .then(resp => {
          const { data: list = [] } = resp
          const praiseItem = list[0]
          if (!praiseItem) {
            this.myPraiseComment = undefined
            return
          }
          praiseItem.fromPoet = JSON.parse(
            JSON.stringify(this.selfPublicInfo)
          )
          praiseItem.toPoet = {}
          this.myPraiseComment = praiseItem
        })
        .finally(() => {
          this.praiseRequesting = false
        })
    },

    getContentComments (isReset) {
      if (isReset) {
        this.commentOffset = 0
      }
      this.poetry.isCommentLoading = true
      apiGetData(apiURL.commentList, {
        id: this.poetryID,
        limit: this.pageLimit,
        offset: this.commentOffset
      }).then(resp => {
        const { count = 0, list = [] } = resp.data

        // TODO:
        const userIdMap = {}
        list.forEach(o => {
          o.toPoet = null
          o.fromPoet = null
          userIdMap[o.toId] = true
          userIdMap[o.fromId] = true
        })
        const userIds = Object.keys(userIdMap)
        userIds.length && apiGetData(apiURL.userInfoList2, { ids: userIds.join(',') }).then(resp => {
          const users = resp.data || []
          const userMap = {}
          users.forEach(o => {
            userMap[o.id] = o
          })

          list.forEach(o => {
            o.toPoet = userMap[o.toId]
            o.fromPoet = userMap[o.fromId]
          })
        })

        const poetry = this.poetry
        if (isReset) {
          poetry.realComments = list
        } else {
          poetry.realComments.push(...list)
        }
        poetry.commentTotal = count

        this.commentOffset += this.pageLimit
      }).finally(() => {
        this.poetry.isCommentLoading = false
      })
    },
    getPraiseComments (isReset) {
      if (isReset) {
        this.praiseOffset = 0
      }
      this.poetry.isPraiseLoading = true
      apiGetData(apiURL.praiseList, {
        id: this.poetryID,
        limit: this.pageLimit,
        offset: this.praiseOffset
      }).then(resp => {
        const { count = [], list = [] } = resp.data

        // TODO:
        const userIdMap = {}
        list.forEach(o => {
          o.toPoet = {}
          o.fromPoet = null
          userIdMap[o.fromId] = true
        })
        const userIds = Object.keys(userIdMap)
        userIds.length && apiGetData(apiURL.userInfoList2, { ids: userIds.join(',') }).then(resp => {
          const users = resp.data || []
          const userMap = {}
          users.forEach(o => {
            userMap[o.id] = o
          })

          list.forEach(o => {
            o.fromPoet = userMap[o.fromId]
          })
        })

        const poetry = this.poetry
        if (isReset) {
          poetry.praiseComments = list
        } else {
          poetry.praiseComments.push(...list)
        }
        poetry.praiseTotal = count

        this.praiseOffset += this.pageLimit
      }).finally(() => {
        this.poetry.isPraiseLoading = false
      })
    },

    openCommentInput (poetryId, fromId, tip) {
      if (!this.userID) {
        this.$toastLogin()
        return
      }
      this.commentVisible = true
      this.commentID = poetryId
      this.commentTypeUserID = this.poetry.poetId || this.poetry.user.id
      this.commentToID = +fromId
      this.commentTip = tip
    },
    onCheckPraisePoetry (e) {
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
        apiPostData(apiURL.praiseDelete, {
          id: comment.id
        })
          .then(data => {
            const { praiseComments } = this.poetry
            const index = praiseComments.findIndex(o => o.id === comment.id)
            if (index >= 0) {
              praiseComments.splice(index, 1)
              this.praiseOffset -= 1
            }
            this.poetry.praiseTotal -= 1
            this.myPraiseComment = undefined
          })
          .finally(() => {
            this.praiseRequesting = false
          })
      } else {
        const params = {
          poetryId: this.poetry.id,
          poetId: this.poetry.poetId || this.poetry.user.id
        }
        apiPostData(apiURL.praiseCreate, params)
          .then(({ data }) => {
            // TODO:
            const comment = {
              id: data.insertId,
              ...params,
              fromId: this.selfPublicInfo.id,
              createTime: ''
            }
            const { praiseTotal, praiseComments } = this.poetry
            if (praiseTotal === praiseComments.length) {
              comment.fromPoet = JSON.parse(
                JSON.stringify(this.selfPublicInfo)
              )
              comment.itemTag = 'opacity'
              praiseComments.push(comment)
            }
            this.myPraiseComment = comment
            this.poetry.praiseTotal += 1

            this.$nextTick(() => {
              this.onPraiseAnime(e, comment)
            })
          })
          .finally(() => {
            this.praiseRequesting = false
          })
      }
    },
    deleteComment (poetry, comment) {
      console.log(comment)
      apiPostData(apiURL.commentDelete, {
        id: comment.id
        // fromId: comment.fromId
      }).then(data => {
        this.getContentComments(true)
      })
    },

    handleDropdown (key, e) {
      const poetry = this.poetry
      switch (key) {
        case 'edit':
          const editPoetry = {
            id: poetry.id,
            set: poetry.set,
            title: poetry.title,
            content: poetry.content,
            end: poetry.end
          }
          sessionStorage.setItem(PEOTRY.EDIT_DATA, JSON.stringify(editPoetry))
          this.$router.push({
            name: 'poetry-edit',
            params: { id: editPoetry.id }
          })
          break
        case 'comment':
          this.openCommentInput(poetry.id, this.userID, '请输入评论')
          break
        case 'praise':
          this.onCheckPraisePoetry(e)
          break
        case 'delete':
          this.$confirm({
            title: '删除提示',
            content: '诗词删除后将无法找回，请确认!',
            confirm: () => {
              apiPostData(apiURL.poetryDelete, {
                userId: this.userID,
                id: this.poetry.id
              }).then(resp => {
                this.$toast('删除成功')
                Cache.PoetryPageCache.delete(this.poetryID)
                Cache.OptionCache.setData(Cache.OPTION.DELETE, {
                  id: this.poetryID,
                  type: 'poetry'
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

      const poetry = this.poetry
      const itemIndex = getItemIndex(el)
      const commentIndex = getItemTypeIndex(el, 'comment')

      switch (itemType) {
        case 'poetry-content':
          const time = this.previousTime || 0
          const currentTime = Date.now()
          if (currentTime - time < 300) {
            this.onCheckPraisePoetry(e)
          }
          this.previousTime = currentTime
          break
        case 'poetry-image':
          this.images = this.$refs.poetry.poetryImages
          this.imageIndex = itemIndex
          this.viewerVisible = true
          break
        case 'poet':
          this.openCommentInput(poetry.id, this.userID, '请输入评论')
          break
        case 'poet-avatar':
          this.$router.push({
            name: 'personal',
            query: { uuid: poetry.poetId || poetry.user.id, username: poetry.user.username }
          })
          break
        case 'comment-avatar':
          const poet = poetry.praiseComments[itemIndex].fromPoet
          this.$router.push({
            name: 'personal',
            query: { uuid: poet.id, username: poet.username }
          })
          break
        case 'comment-from':
          const fromComment = poetry.realComments[commentIndex]
          this.$router.push({
            name: 'personal',
            query: { uuid: fromComment.fromId }
          })
          break
        case 'comment-to':
          const toComment = poetry.realComments[commentIndex]
          this.$router.push({
            name: 'personal',
            query: { uuid: toComment.toId }
          })
          break
        case 'comment-content':
          this.onClickComment(poetry, poetry.realComments[commentIndex])
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
    onClickComment (poetry, comment) {
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
            this.deleteComment(poetry, comment)
          }
        })
        return
      }
      Cache.UserCache.setData(comment.fromId, comment.fromPoet)
      this.openCommentInput(
        comment.poetryId,
        comment.fromId,
        `回复 ${comment.fromPoet.username}`
      )
    },
    handleCommentOk (o) {
      this.getContentComments(true)
      // TODO:
      // const { commentTotal, realComments } = this.poetry
      // if (commentTotal === realComments.length) {
      //   o.fromPoet = JSON.parse(JSON.stringify(this.selfPublicInfo))
      //   o.toPoet = Cache.UserCache.getData(+this.commentToID)
      //   realComments.push(o)
      // }
      // this.poetry.commentTotal += 1
    },

    onPraiseAnime (e, data) {
      const poetry = this.poetry
      const instance = this.$refs.poetry
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
      this.praiseId = poetry.id
      this.praiseVisible = true
      this.praiseMap[poetry.id] = {
        poetry,
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

.poetry-detail {
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
