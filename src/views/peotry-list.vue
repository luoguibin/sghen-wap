<template>
  <div class="peotry-list" @click="onClickPoetry($event)">
    <sg-scroll ref="sgScroll" :isEnd="isEnd" @load="handleLoad" @refresh="handleRefresh">
      <peotry v-for="item in peotries" :key="item.id" :peotry="item" ref="peotries"></peotry>
    </sg-scroll>

    <image-viewer :visible.sync="viewerVisible" :index="imageIndex" :images="images"></image-viewer>
  </div>
</template>

<script>
import { apiURL, apiGetData } from '@/api'
import Peotry from '@/components/peotry'
import ImageViewer from '@/components/image-viewer'

export default {
  nae: 'PeotryList',

  components: {
    Peotry,
    ImageViewer
  },

  data () {
    return {
      isEnd: false,
      peotries: [],

      page: 1,
      limit: 20,

      viewerVisible: false,
      images: [],
      imageIndex: 0
    }
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
      }).then(data => {
        const list = data.data
        this.checkPeotries(list)
        if (isRefresh) {
          this.peotries = list
        } else {
          this.peotries.push(...list)
        }
        this.isEnd = this.peotries.length === data.totalCount
        this.$refs.sgScroll.success()
      }).catch(() => {
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
      const peotIds = []
      const timeFunc = function (o0, o1) {
        // 按时间排序评论列表
        const time0 = new Date(o0.createTime).getTime()
        const time1 = new Date(o1.createTime).getTime()
        return time0 < time1 ? -1 : 1
      }

      list.forEach(o => {
        if (!o.comments) {
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
              peotIds.push(o_.fromId)
            }

            if (o_.toId > 0) {
              if (peotInfoMap[o_.toId]) {
                o_.toPeot = peotInfoMap[o_.toId]
              } else {
                peotIds.push(o_.toId)
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
          delete o.comments
        }
      })

      if (!peotIds.length) {
        return
      }

      apiGetData(apiURL.userInfoList, { idStrs: peotIds.join() }).then(data => {
        data.data.forEach(o => {
          peotInfoMap[o.id] = o
        })
        list.forEach(o => {
          o.praiseComments.forEach(o_ => {
            if (!o_.fromPeot) {
              this.$set(o_, 'fromPeot', peotInfoMap[o_.fromId])
            }
          })
          o.realComments.forEach(o_ => {
            if (!o_.fromPeot) {
              this.$set(o_, 'fromPeot', peotInfoMap[o_.fromId])
            }
            if (o_.toId > 0 && !o_.toPeot) {
              this.$set(o_, 'toPeot', peotInfoMap[o_.toId])
            }
          })
        })
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
      switch (itemType) {
        case 'peot-avatar':
          console.log(itemType, index)
          break
        case 'peotry-image':
          this.images = this.$refs.peotries[index].peotryImages
          this.imageIndex = getItemIndex(target.parentElement.parentElement)
          this.viewerVisible = true
          break
        case 'comment-avatar':
          console.log(itemType, getItemIndex(target))
          break
        default:
          break
      }
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
}
</style>
