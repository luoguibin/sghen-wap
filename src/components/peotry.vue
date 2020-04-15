<template>
  <div :class="{'peotry': true, 'avatar-visible': showAvatar}" item-type="peotry">
    <!-- 诗人头像 -->
    <img
      v-if="showAvatar"
      class="peot-avatar"
      item-type="peot-avatar"
      :src="(peotry.user && peotry.user.iconUrl) | imgFilter"
    />

    <!-- 诗词选集及标题 -->
    <div :class="{'peotry-title': true, 'peotry-inline': titleInline}">
      <span v-if="peotry.set" class="peotry-set">{{peotry.set.name}}</span>
      <span v-if="peotry.set && peotry.title" class="peotry-dot">*</span>
      <span class="peotry-title" v-if="peotry.title">{{peotry.title}}</span>
    </div>

    <!-- 诗词作者及创建时间 -->
    <div :class="{'peot-name': true, 'peotry-inline': titleInline}">
      <template v-if="titleInline">
        {{peotry.user ? '--' + peotry.user.name : ""}}
        <span
          v-if="showTime"
        >于{{peotry.time | time-format}}</span>
      </template>
      <template v-else>
        {{peotry.user ? peotry.user.name : ""}}
        <span v-if="showTime">--{{peotry.time | time-format}}</span>
      </template>
    </div>

    <!-- `white-wrap: pre-wrap` and code's format -->
    <!-- 诗词内容 -->
    <div class="content-container" ref="contentEl" :style="{height: contentHeight}">
      <div :class="{'content': true }" v-html="peotry.content"></div>
      <div class="end" v-if="peotry.end">{{peotry.end}}</div>
    </div>

    <!-- 诗词扩展按钮 -->
    <div v-if="canExpand" class="content-expand">
      <p v-show="contentHeight !== 'initial'">...</p>
      <span @click.stop="onClickExpand">{{contentHeight === 'initial' ? '收起' : expandText}}</span>
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
    <div v-if="showComment && hasComments" class="comments">
      <div class="praise-users" v-show="peotry.praiseComments.length">
        <img
          v-for="comment in peotry.praiseComments"
          :key="comment.id"
          :src="comment.fromPeot && comment.fromPeot.iconUrl | imgFilter"
          item-type="comment-avatar"
          alt
        />
      </div>

      <div v-show="hasComments" class="comments-divider"></div>

      <div v-for="comment in peotry.realComments" class="comment" :key="comment.id">
        <div class="users">
          <span
            class="user"
            :user-id="comment.fromId"
            :comment-id="comment.id"
          >{{comment.fromPeot ? comment.fromPeot.name : comment.fromId}}</span>
          <span v-if="comment.toId !== comment.fromId" class="comment_to">回复</span>
          <span
            v-if="comment.toId !== comment.fromId"
            class="user"
            :user-id="comment.toId"
          >{{comment.toPeot ? comment.toPeot.name : comment.toId}}</span>
          <span class="comment_dot">:</span>
        </div>
        <p>{{comment.content}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Peotry',

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
     * 标题和作者内联排列
     */
    titleInline: {
      type: Boolean,
      default: false
    },

    /**
     * 是否显示点赞数
     */
    showPraiseCount: {
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
    },

    /**
     * 是否显示更多操作
     */
    showMore: {
      type: Boolean,
      default: false
    },

    /**
     * 是否直接展示操作按钮
     */
    showMoreDirect: {
      type: Boolean,
      default: false
    },

    /**
     * 扩展按钮
     */
    expandText: {
      type: String,
      default: '展开全文'
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
      canExpand: false,
      contentHeight: 'initial',
      mainScrollBox: null,

      showUser: false,
      showUserInfo: {}
    }
  },
  filters: {
    imgFilter (v) {
      if (!v) {
        return require('@/assets/logo.png')
      }
      let path
      if (v.indexOf('.') === 0) {
        if (v.indexOf('./file') === 0) {
          path = '/sapi' + v.substr(1)
        } else {
          path = '/sapi/file/peotry/img' + v.substr(1)
        }
      } else {
        path = '/sapi/file/peotry/img/' + v
      }
      return path
    }
  },
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
      window.peotry = this
      const imageObj = this.peotry.image
      if (imageObj && imageObj.count) {
        const imgFilter = this.$options.filters['imgFilter']
        return JSON.parse(imageObj.images).map(v => {
          return imgFilter(v)
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

    hasComments () {
      return (
        this.peotry.realComments.length && this.peotry.praiseComments.length
      )
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
    this.checkCanExpand(true)
  },
  methods: {
    checkCanExpand (widthExpand) {
      const contentEl = this.$refs.contentEl
      if (!contentEl) {
        return
      }
      if (contentEl.clientHeight >= 120) {
        this.canExpand = true
        if (widthExpand) {
          this.onClickExpand()
        }
      }
    },
    onClickExpand () {
      this.contentHeight =
        this.contentHeight === 'initial' ? '105px' : 'initial'
    }
  }
}
</script>

<style scoped lang="scss">
$size-content: 18px;
$padding-set: 12px;

.peotry {
  position: relative;
  box-sizing: border-box;
  padding-right: 1rem;

  .peot-avatar {
    width: 26px;
    height: 26px;
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

  .peotry-title {
    padding-bottom: $padding-set;

    .peotry-set {
      font-size: 18px;
    }
    .peotry-dot {
      font-size: 16px;
      padding: 0 5px;
    }
    .peotry-title {
      font-size: 16px;
    }
  }
  .peotry-title.peotry-inline {
    margin-right: 10px;
  }

  .peotry-rank {
    padding: 2px 5px;
    background-color: #eeeeee;

    .peotry-count {
      font-size: 14px;
      i {
        font-size: 20px;
        color: #a4c8ff;
        vertical-align: bottom;
      }
    }
    .rank-praise {
      cursor: pointer;
      margin-left: 8px;
      .el-icon-star-on {
        font-size: 15px;
        color: #e6a23c;
      }
      .el-icon-star-off {
        font-size: 15px;
      }
    }
  }

  .peot-name {
    padding-bottom: $padding-set;
    font-size: 14px;
    color: #888888;
    span {
      margin-left: 8px;
    }
  }

  .content-container {
    overflow: hidden;
    box-sizing: border-box;

    .content {
      font-size: $size-content;
      line-height: 26px;
      white-space: pre-wrap;
      word-break: break-all;
      box-sizing: border-box;
      padding-bottom: $padding-set;
    }
    .end {
      font-size: 12px;
      color: #333;
      padding-bottom: $padding-set;
    }
  }

  .content-expand {
    margin-bottom: 2rem;
    font-size: $size-content;

    span {
      cursor: pointer;
      color: rgb(112, 112, 112);
      font-size: 14px;
    }
  }

  .images {
    .image-wrapper {
      position: relative;
      display: inline-block;
      width: 30%;
      height: 0;
      padding-bottom: 30%;
      margin-right: 3%;
      margin-bottom: 3%;
    }
    .image-wrapper__inner {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
      border-radius: 3px;
    }
  }

  .peotry-more {
    margin: 5px 0;
    text-align: right;
    .peotry-more_icon {
      font-size: 20px;
      cursor: pointer;

      &:active {
        color: #148acf;
      }
    }
  }

  .comments {
    position: relative;
    margin: 0;
    padding: 5px 10px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 8px;

    .comments-divider {
      border-bottom: 1px solid white;
    }

    .praise-users {
      user-select: none;

      img {
        width: 30px;
        height: 30px;
        margin-right: 3px;
        cursor: pointer;
        object-fit: contain;

        &:hover {
          background-color: rgba(250, 250, 250, 0.8);
          border-radius: 3px;
        }
      }
    }

    &::before {
      content: "";
      width: 0;
      height: 0;
      position: absolute;
      left: 8px;
      top: -10px;
      border: solid 10px transparent;
      border-bottom-color: rgba(0, 0, 0, 0.1);
      border-top-width: 0;
    }

    .comment {
      padding: 5px 3px;

      .users {
        float: left;
        font-weight: bold;
        margin-right: 8px;

        .user {
          cursor: pointer;

          &:hover {
            color: #148acf;
          }
        }
      }

      .comment_to {
        padding: 0 5px;
        font-weight: initial;
        font-size: 0.9rem;
        color: #555555;
      }

      .comment_dot {
        font-weight: initial;
        font-size: 0.9rem;
        color: #555555;
      }

      p {
        white-space: pre-line;
        word-break: break-all;
        line-height: 21px;
      }
    }
  }

  .comment-input {
    text-align: right;
    margin-top: 5px;
    padding-right: 10px;

    .el-button {
      margin-top: 5px;
    }
  }

  .peotry-inline {
    display: inline-block;
  }
}

.avatar-visible {
  padding-left: 38px;
}
</style>
