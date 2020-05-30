<template>
  <div class="peotry-detail">
    <sg-header @back="onBack">
      <span style="font-size: 1.6rem;">诗词详情</span>
      <div slot="right"></div>
    </sg-header>

    <div class="main">
      <div ref="wrapper" class="main-wrapper" @click="onClickPoetry">
        <peotry v-if="peotry" ref="peotry" :peotry="peotry" :isDetail="true">
          <div></div>
        </peotry>
      </div>
    </div>

    <peotry-edit
      v-if="editVisible"
      :peotry="editPeotry"
      @close="editVisible = false"
      @success="handleSave"
    ></peotry-edit>

    <image-viewer :visible.sync="viewerVisible" :index="imageIndex" :images="images"></image-viewer>

    <comment-input
      :visible.sync="commentVisible"
      :id="commentID"
      :toId="commentToID"
      :placeholder="commentTip"
      @ok="handleCommentOk"
    ></comment-input>

    <div class="right-menus">
      <div class="menu-item" @click="handleDropdown('praise', $event)">
        <div :class="{'is-praise': isPraise}">
          <i class="iconfont icon-like"></i>
        </div>
        <span>{{peotry && peotry.praiseTotal}}</span>
      </div>
      <div class="menu-item" @click="handleDropdown('comment', $event)">
        <div>
          <i class="iconfont icon-message"></i>
        </div>
        <span>{{peotry && peotry.commentTotal}}</span>
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
import { getItemIndex } from '@/utils/sgDom'
import Cache from '@/common/cache-center'

export default {
  name: 'PeotryDetail',

  components: {
    peotry: () => import('@/components/peotry'),
    'peotry-edit': () => import('@/components/peotry-edit'),
    'image-viewer': () => import('@/components/image-viewer'),
    'comment-input': () => import('@/components/comment-input'),
    'praise-anime': () => import('@/components/praise-anime')
  },

  data () {
    return {
      peotryID: 0,
      peotry: null,
      editPeotry: null,
      editVisible: false,

      dropdownOptions: [],

      viewerVisible: false,
      images: [],
      imageIndex: 0,

      myPraiseComment: null,
      commentVisible: false,
      commentID: 0,
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
        scrollTop: this.$refs.wrapper.scrollTop
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
      apiGetData(apiURL.peotryList, { id: this.peotryID }).then(data => {
        const o = data.data
        o.praiseTotal = -1
        o.praiseComments = []
        o.commentTotal = -1
        o.realComments = []
        if (o.user) {
          o.user = Object.freeze(o.user)
        }
        this.peotry = o
        this.getPeotryPraise()
        this.getWordComments()
        this.getPraiseComments()
      })
    },

    getPeotryPraise () {
      if (!this.userID) {
        return
      }
      this.praiseRequesting = true
      apiGetData(apiURL.commentPraises, {
        id: this.peotryID,
        datas: [this.userID].toString()
      })
        .then(resp => {
          this.myPraiseComment = this.formatComments(resp.data || [])[0]
        })
        .finally(() => {
          this.praiseRequesting = false
        })
    },

    getWordComments (isReset) {
      if (isReset) {
        this.commentOffset = 0
      }
      apiGetData(apiURL.commentWords, {
        id: this.peotryID,
        limit: this.pageLimit,
        offset: this.commentOffset
      }).then(resp => {
        const data = resp.data
        if (!data || data.length < 2) {
          return
        }
        const total = +data[0][0].count || 0
        const comments = this.formatComments(data[1] || [])
        this.commentOffset += this.pageLimit
        if (isReset) {
          this.peotry.realComments = comments
        } else {
          this.peotry.realComments.push(...comments)
        }
        this.peotry.commentTotal = total
        this.checkComments(comments)
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
        const total = +data[0][0].count || 0
        const comments = this.formatComments(data[1] || [])
        this.praiseOffset += this.pageLimit
        this.peotry.praiseTotal = total
        if (isReset) {
          this.peotry.praiseComments = comments
        } else {
          this.peotry.praiseComments.push(...comments)
        }
        this.checkComments(comments)
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
    checkComments (comments) {
      if (!comments) {
        return
      }
      const userCache = Cache.UserCache
      const peotIdMap = {}
      // const timeFunc = function (o0, o1) {
      //   // 按时间排序评论列表
      //   const time0 = new Date(o0.createTime).getTime()
      //   const time1 = new Date(o1.createTime).getTime()
      //   return time0 < time1 ? -1 : 1
      // }

      comments.forEach(o => {
        // 判断评论的创建者
        if (userCache.getData(o.fromId)) {
          o.fromPeot = Object.freeze(userCache.getData(o.fromId))
        } else {
          peotIdMap[o.fromId] = true
        }

        if (o.toId > 0) {
          if (userCache.getData(o.toId)) {
            o.toPeot = Object.freeze(userCache.getData(o.toId))
          } else {
            peotIdMap[o.toId] = true
          }
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
        this.buildPeotryComments(comments)
      })
    },
    buildPeotryComments (comments) {
      const userCache = Cache.UserCache
      comments.forEach(o => {
        if (!o.fromPeot) {
          this.$set(o, 'fromPeot', Object.freeze(userCache.getData(o.fromId)))
        }
        if (o.toId > 0 && !o.toPeot) {
          this.$set(o, 'toPeot', Object.freeze(userCache.getData(o.toId)))
        }
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
            const { praiseTotal, praiseComments } = this.peotry
            if (praiseTotal === praiseComments.length) {
              const index = praiseComments.findIndex(o => o.id === comment.id)
              praiseComments.splice(index, 1)
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
        this.getWordComments(true)
      })
    },

    handleDropdown (key, e) {
      const peotry = this.peotry
      switch (key) {
        case 'edit':
          this.editPeotry = {
            id: peotry.id,
            set: peotry.set,
            title: peotry.title,
            content: peotry.content,
            end: peotry.end
          }
          this.editVisible = true
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
          this.openCommentInput(peotry.id, this.userID, '请输入评论')
          break
        case 'peot-avatar':
          this.$router.push({
            name: 'personal',
            query: { uuid: peotry.user.id, username: peotry.user.username }
          })
          break
        case 'comment-avatar':
          const poet = peotry.praiseComments[getItemIndex(target)].fromPeot
          this.$router.push({
            name: 'personal',
            query: { uuid: poet.id, username: poet.username }
          })
          break
        case 'comment-from':
          const fromIndex = getItemIndex(target.parentElement.parentElement)
          const fromComment = peotry.realComments[fromIndex]
          this.$router.push({
            name: 'personal',
            query: { uuid: fromComment.fromId }
          })
          break
        case 'comment-to':
          const toIndex = getItemIndex(target.parentElement.parentElement)
          const toComment = peotry.realComments[toIndex]
          this.$router.push({
            name: 'personal',
            query: { uuid: toComment.toId }
          })
          break
        case 'comment-content':
          const commentIndex = getItemIndex(target.parentElement)
          this.onClickComment(peotry, peotry.realComments[commentIndex])
          break
        case 'avatars-more':
          this.getPraiseComments()
          break
        case 'comments-more':
          this.getWordComments()
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
      this.openCommentInput(
        comment.typeId,
        comment.fromId,
        `回复 ${comment.fromPeot.username}`
      )
    },

    handleSave () {
      this.editVisible = false
      this.getPeotryDetail()
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
@import '@/ui/style/const.scss';

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
    padding: 1rem;
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
}
</style>
