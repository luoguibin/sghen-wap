<template>
  <div class="poetry" item-type="poetry">
    <slot name="header"></slot>
    <div :class="{'wrapper': true, 'avatar-visible': showAvatar}">
      <!-- 诗词选集及标题 -->
      <div class="set--title">
        <span v-if="poetry.set" class="set">{{poetry.set.name}}</span>
        <span v-if="poetry.set && poetry.title" class="dot">*</span>
        <span class="title" v-if="poetry.title">{{poetry.title}}</span>

        <!-- 诗人头像 -->
        <img
          v-if="showAvatar"
          class="avatar"
          item-type="poet-avatar"
          :src="(poetry.user && poetry.user.avatar) | imgSrcFilter('avatar')"
        />
      </div>

      <!-- 诗词作者及创建时间 -->
      <div class="poet--time">
        <span item-type="poet">{{poetry.user ? poetry.user.username : ""}}</span>
        <span><i class="iconfont icon-history"></i>{{poetry.time | timeFilter}}</span>
      </div>

      <!-- 诗词内容 -->
      <div ref="contentEnd" :class="{'content--end': true, 'max-height': !isExpand }">
        <div item-type="poetry-content" class="content" v-html="safeContent"></div>
        <div class="end" v-if="poetry.end">{{poetry.end}}</div>
      </div>

      <!-- 诗词扩展按钮 -->
      <div v-if="hasExpand" class="expand-tip">
        <p v-show="!isExpand">...</p>
        <p @click.stop="onClickExpand">{{isExpand ? '收起' : '显示全文'}}</p>
      </div>

      <!-- 诗词图片 -->
      <div v-if="currentThumbnails.length" ref="images" class="images">
        <div
          v-for="(value, index) in currentThumbnails"
          :key="index"
          class="image-wrapper"
          item-type="poetry-image"
        >
          <div class="image-wrapper__inner">
            <img :src="value" />
          </div>
        </div>
      </div>

      <!-- 诗词评论 -->
      <comments
        ref="comments"
        :praises="poetry.praiseComments"
        :praiseTotal="poetry.praiseTotal"
        :comments="poetry.realComments"
        :commentTotal="poetry.commentTotal"
        :isDetail="isDetail"
        :isPraiseLoading="poetry.isPraiseLoading"
        :isCommentLoading="poetry.isCommentLoading"
      ></comments>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { defaultImgSrc } from '@/common/const'
import Comments from './comments'

export default {
  name: 'Poetry',

  components: {
    Comments
  },

  props: {
    poetry: {
      type: Object,
      required: true
    },

    /**
     * 是否为诗词详情，包括完整显示诗词、图片、评论、点赞
     */
    isDetail: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示作者头像
     */
    showAvatar: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      defaultImgSrc,
      isIntoView: false,

      clickTime: 0,
      hasExpand: false,
      isExpand: false,

      showUser: false,
      showUserInfo: {}
    }
  },
  filters: {},
  computed: {
    safeContent () {
      return this.$xss(this.poetry ? this.poetry.content : '')
    },
    /**
     * @returns {Array} 返回诗词的直接可用图片列表
     */
    poetryImages () {
      const imageObj = this.poetry.image
      if (imageObj && imageObj.count) {
        const srcFilter = Vue.filter('imgSrcFilter')
        return JSON.parse(imageObj.images).map(v => {
          return srcFilter(v)
        })
      } else {
        return []
      }
    },
    thumbnails () {
      return this.poetryImages.map(v => {
        if (v.endsWith('.jpg')) {
          v = v.replace(/.jpg$/, '_100.jpg')
        } else if (v.endsWith('.png')) {
          v = v.replace(/.png$/, '_100.png')
        } else if (v.endsWith('.jpeg')) {
          v = v.replace(/.jpeg$/, '_100.jpeg')
        } else {
          v += '_100.jpg'
        }

        return v
      })
    },
    currentThumbnails () {
      return this.thumbnails.map(v => {
        return this.isIntoView ? v : this.defaultImgSrc
      })
    },

    ...mapState({
      userID: state => state.auth.userID,
      userName: state => state.auth.userName,
      userAvatar: state => state.auth.userAvatar
    })
  },
  mounted () {
    if (this.isDetail) {
      this.isIntoView = true
    }
    this.checkCanExpand()
  },
  methods: {
    setScrollIntoView () {
      this.isIntoView = true
      const comments = this.$refs.comments
      comments && comments.setScrollIntoView()
    },
    checkCanExpand () {
      const el = this.$refs.contentEnd
      if (el) {
        this.hasExpand = el.scrollHeight > el.clientHeight
      }
      if (this.isDetail) {
        this.isExpand = true
      }
    },
    onClickExpand () {
      this.isExpand = !this.isExpand
    }
  }
}
</script>

<style scoped lang="scss">
.poetry {
  position: relative;

  .wrapper {
    padding-right: 1rem;
    box-sizing: border-box;
  }

  .avatar {
    width: 2.6rem;
    height: 2.6rem;
    object-fit: contain;
    position: absolute;
    left: -3.3rem;
    top: 0;
    cursor: pointer;
    object-fit: contain;

    &:hover {
      background-color: rgba(250, 250, 250, 0.8);
      border-radius: 3px;
    }
  }

  .set--title {
    position: relative;
    padding-bottom: 1.2rem;

    .set {
      font-size: 18px;
    }
    .dot {
      font-size: 16px;
      padding: 0 5px;
    }
    .title {
      font-size: 16px;
    }
  }

  .poet--time {
    padding-bottom: 1.2rem;
    font-size: 14px;
    color: #888888;
    span + span {
      margin-left: 8px;
    }
    .icon-history {
      font-size: 16px;
      vertical-align: text-top;
    }
  }

  .content--end {
    box-sizing: border-box;

    .content {
      font-size: 1.5rem;
      line-height: 2.2rem;
      white-space: pre-wrap;
      word-break: break-all;
      box-sizing: border-box;
    }
    .end {
      margin-top: 1.2rem;
      font-size: 12px;
      color: #333;
    }
  }
  .max-height {
    overflow: hidden;
    max-height: 11rem;
  }
  .expand-tip {
    p {
      font-size: 1.8rem;
    }
    p:last-child {
      display: inline-block;
      line-height: 2.2rem;
      color: rgb(126, 126, 126);
      font-size: 14px;
    }
  }

  .images {
    margin-top: 1rem;
    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
      border-radius: 3px;
    }
  }

  .comments {
    margin-top: 2rem;
  }
}

.avatar-visible {
  padding-left: 3.8rem;
}

.image-wrapper {
  position: relative;
  display: inline-block;
  width: 30%;
  height: 0;
  padding-bottom: 30%;
  margin-right: 3%;
  margin-bottom: 3%;

  .image-wrapper__inner {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
