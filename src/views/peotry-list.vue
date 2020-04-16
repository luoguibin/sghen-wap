<template>
  <div class="peotry-list" @click.stop="onClickPoetry($event)">
    <sg-scroll ref="sgScroll" :isEnd="isEnd" @load="handleLoad" @refresh="handleRefresh">
      <peotry v-for="item in peotries" :key="item.id" :peotry="item" ref="peotries"></peotry>
    </sg-scroll>

    <image-viewer :visible.sync="viewerVisible" :index="imageIndex" :images="images"></image-viewer>
    <comment-input
      :visible.sync="commentVisible"
      :id="commentID"
      :toId="commentToID"
      :placeholder="commentTip"
      @ok="handleCommentOk"
    ></comment-input>
    <div v-show="praiseVisible" ref="praise" class="peotry-praise" :style="praiseStyle">赞</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiGetData, apiPostData } from '@/api'
import Peotry from '@/components/peotry'

export default {
  nae: 'PeotryList',

  components: {
    Peotry,
    'image-viewer': () => import('@/components/image-viewer'),
    'comment-input': () => import('@/components/comment-input')
  },

  data () {
    return {
      isEnd: false,
      peotries: [],

      page: 1,
      limit: 20,

      viewerVisible: false,
      images: [],
      imageIndex: 0,

      commentVisible: false,
      commentID: 0,
      commentToID: 0,
      commentTip: '请输入',

      praiseVisible: false,
      praiseStyle: {}
    }
  },

  computed: {
    ...mapState({
      userID: state => state.auth.userID
    })
  },

  created () {
    window.peotryList = this
    this.peotInfoMap = {}
  },

  methods: {
    handleLoad (isRefresh) {
      if (!isRefresh) {
        this.page += 1
      }
      apiGetData(apiURL.peotryList, {
        page: this.page,
        limit: this.limit,
        needComment: true
      })
        .then(data => {
          const list = data.data
          this.checkPeotries(list)
          if (isRefresh) {
            this.peotries = list
          } else {
            this.peotries.push(...list)
          }
          this.isEnd = this.peotries.length === data.totalCount
          this.$refs.sgScroll.success()
        })
        .catch(() => {
          this.$refs.sgScroll.fail()
        })
    },
    handleRefresh () {
      this.page = 1
      this.handleLoad(true)
    },

    /**
     * @param {Array} list
     */
    checkPeotries (list) {
      const peotInfoMap = this.peotInfoMap
      const peotIdMap = []
      const timeFunc = function (o0, o1) {
        // 按时间排序评论列表
        const time0 = new Date(o0.createTime).getTime()
        const time1 = new Date(o1.createTime).getTime()
        return time0 < time1 ? -1 : 1
      }

      list.forEach(o => {
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
              o_.fromPeot = peotInfoMap[o_.fromId]
            } else {
              peotIdMap[o_.fromId] = true
            }

            if (o_.toId > 0) {
              if (peotInfoMap[o_.toId]) {
                o_.toPeot = peotInfoMap[o_.toId]
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

      apiGetData(apiURL.userInfoList, { idStrs: peotIds.join() }).then(data => {
        data.data.forEach(o => {
          peotInfoMap[o.id] = o
        })
        list.forEach(o => {
          this.buildPeotryComments(o, peotInfoMap)
        })
      })
    },
    buildPeotryComments (peotry, peotInfoMap) {
      peotry.praiseComments.forEach(o => {
        if (!o.fromPeot) {
          this.$set(o, 'fromPeot', peotInfoMap[o.fromId])
        }
      })
      peotry.realComments.forEach(o => {
        if (!o.fromPeot) {
          this.$set(o, 'fromPeot', peotInfoMap[o.fromId])
        }
        if (o.toId > 0 && !o.toPeot) {
          this.$set(o, 'toPeot', peotInfoMap[o.toId])
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
        case 'peot-avatar':
          break
        case 'peotry-content':
          const time = this.previousTime || 0
          const currentTime = Date.now()
          if (currentTime - time < 300) {
            this.onPraisePeotry(peotry, peotryInstance, data => {
              this.praiseAnime(peotry, peotryInstance, e, data)
            })
          }
          this.previousTime = currentTime
          break
        case 'peotry-image':
          this.images = peotryInstance.peotryImages
          this.imageIndex = getItemIndex(target.parentElement.parentElement)
          this.viewerVisible = true
          break
        case 'comment-avatar':
          const poet = peotry.praiseComments[getItemIndex(target)].fromPeot
          console.log(poet)
          break
        case 'comment-from':
          break
        case 'comment-to':
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
      this.commentVisible = true
      this.commentID = comment.typeId
      this.commentToID = comment.fromId
      this.commentTip = `回复 ${comment.fromPeot.name}`
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
        }).then(data => {
          const comments = peotry.praiseComments
          const index = comments.findIndex(o => o.id === comment.id)
          comments.splice(index, 1)
        }).finally(() => {
          this.praiseRequesting = false
        })
      } else {
        apiPostData(apiURL.commentCreate, {
          type: 1,
          typeId: peotry.id,
          content: 'praise',
          fromId: this.userID,
          toId: -1
        }).then(data => {
          call && call(data.data)
        }).finally(() => {
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
    onClickImg (e) {
      let el = e.target
      if (el.tagName !== 'IMG') {
        return
      }

      let index = -1
      el = el.parentElement.parentElement
      while (el) {
        index++
        el = el.previousElementSibling
      }
      this.$emit('img', { index, images: this.peotryImages })
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

    praiseAnime (peotry, instance, e, data) {
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
      // console.log(rect)
      this.praiseVisible = true
      this.praiseStyle = {
        left: e.clientX - 20 + 'px',
        top: e.clientY - 20 + 'px'
      }
      setTimeout(() => {
        this.praiseStyle = {
          left: rect.left + 40 + 'px',
          top: rect.top + 'px'
        }
      }, 100)
      setTimeout(() => {
        this.praiseVisible = false
        data.fromPeot = this.peotInfoMap[this.userID]
        peotry.praiseComments.push(data)
      }, 800)
    }
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

  .peotry-praise {
    position: fixed;
    top: 0;
    left: 0;
    transition: all 800ms;
    font-size: 2rem;
    padding: 1rem;
    color: steelblue;
    background-color: white;
    border-radius: 50%;
    z-index: 99;
  }
}
</style>
