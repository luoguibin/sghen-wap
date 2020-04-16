<template>
  <div :class="{'peotry': true, 'avatar-visible': showAvatar}" item-type="peotry">
    <!-- 诗人头像 -->
    <img
      v-if="showAvatar"
      class="avatar"
      item-type="peot-avatar"
      :src="(peotry.user && peotry.user.iconUrl) | img-src"
    />

    <!-- 诗词选集及标题 -->
    <div class="set--title">
      <span v-if="peotry.set" class="set">{{peotry.set.name}}</span>
      <span v-if="peotry.set && peotry.title" class="dot">*</span>
      <span class="title" v-if="peotry.title">{{peotry.title}}</span>
    </div>

    <!-- 诗词作者及创建时间 -->
    <div class="peot--time">
      {{peotry.user ? peotry.user.name : ""}}
      <span v-if="showTime">--{{peotry.time | time-format}}</span>
    </div>

    <!-- 诗词内容 -->
    <div ref="contentEnd" :class="{'content--end': true, 'max-height': !isExpand }">
      <div class="content" v-html="peotry.content"></div>
      <div class="end" v-if="peotry.end">{{peotry.end}}</div>
    </div>

    <!-- 诗词扩展按钮 -->
    <div v-if="hasExpand" class="expand-tip">
      <p v-show="!isExpand">...</p>
      <p @click.stop="onClickExpand">{{isExpand ? '收起' : '展开全文'}}</p>
    </div>

    <!-- 诗词图片 -->
    <div v-if="showImage && thumbnails.length" class="images">
      <div v-for="value in thumbnails" :key="value" class="image-wrapper">
        <div class="image-wrapper__inner">
          <img item-type="peotry-image" :src="value" />
        </div>
      </div>
    </div>

    <!-- 诗词评论 -->
    <comments v-if="showComment" :praises="peotry.praiseComments" :comments="peotry.realComments"></comments>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import Comments from './comments'

export default {
  name: 'Peotry',

  components: {
    Comments
  },

  props: {
    peotry: {
      type: Object,
      required: true
    },

    /**
     * 是否有
     */
    showAvatar: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示创建时间
     */
    showTime: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示评论
     */
    showComment: {
      type: Boolean,
      default: true
    },

    /**
     * 是否显示图片
     */
    showImage: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      newComment: {
        type: 1,
        typeId: 0,
        content: '',
        fromId: 0,
        fromPeot: null,
        toId: 0,
        toPeot: null
      },
      clickTime: 0,
      hasExpand: false,
      isExpand: false,
      mainScrollBox: null,

      showUser: false,
      showUserInfo: {}
    }
  },
  filters: {},
  computed: {
    /**
     * @returns {Boolean} 返回是否为当前用户创建的诗词
     */
    isSelfPeotry () {
      return this.peotry.user && this.userID === this.peotry.user.id
    },

    /**
     * @returns {Array} 返回诗词的直接可用图片列表
     */
    peotryImages () {
      const imageObj = this.peotry.image
      if (imageObj && imageObj.count) {
        const srcFilter = Vue.filter('img-src')
        return JSON.parse(imageObj.images).map(v => {
          return srcFilter(v)
        })
      } else {
        return []
      }
    },
    thumbnails () {
      return this.peotryImages.map(v => {
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

    /**
     * @returns {Comment} 返回我的点赞对象
     */
    myPraiseComment () {
      const userID = this.userID
      if (!userID) return
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
      userID: state => state.auth.userID,
      userName: state => state.auth.userName,
      userAvatar: state => state.auth.userAvatar
    })
  },
  created () {
    const mainScrollEl = document.getElementById('main-scroll')
    if (mainScrollEl && mainScrollEl.children) {
      this.mainScrollBox = mainScrollEl.children[0]
    }
  },
  mounted () {
    this.checkCanExpand()
  },
  methods: {
    checkCanExpand () {
      const el = this.$refs.contentEnd
      if (el) {
        this.hasExpand = el.scrollHeight > el.clientHeight
      }
    },
    onClickExpand () {
      this.isExpand = !this.isExpand
    }
  }
}
</script>

<style scoped lang="scss">
.peotry {
  position: relative;
  padding-right: 1rem;
  box-sizing: border-box;

  .avatar {
    width: 2.6rem;
    height: 2.6rem;
    object-fit: contain;
    position: absolute;
    left: 3px;
    top: 0;
    cursor: pointer;
    object-fit: contain;

    &:hover {
      background-color: rgba(250, 250, 250, 0.8);
      border-radius: 3px;
    }
  }

  .set--title {
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

  .peot--time {
    padding-bottom: 1.2rem;
    font-size: 14px;
    color: #888888;
    span {
      margin-left: 8px;
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
    margin-top: 1rem;
  }
}

.avatar-visible {
  padding-left: 38px;
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
