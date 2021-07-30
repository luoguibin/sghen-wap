<template>
  <div class="comments" v-show="currentPraises.length || textComments.length">
    <!-- 已点赞的用户头像 -->
    <div ref="avatars" class="avatars" v-show="currentPraises.length">
      <img
        v-for="comment in currentPraises"
        :key="comment.id"
        :src="comment.avatar"
        :item-tag="comment.itemTag"
        item-type="comment-avatar"
        alt
      />
      <div v-if="hasAvatarsMore" v-show="!isPraiseLoading" class="more" item-type="avatars-more">...</div>
      <div v-if="isPraiseLoading" class="praise-loading"><i></i></div>
    </div>

    <div v-show="currentPraises.length && textComments.length" style="border-bottom: 1px solid white;"></div>

    <!-- 评论列表 -->
    <div class="contents" v-show="textComments.length">
      <div v-for="comment in textComments" class="comment" :key="comment.id" item-type="comment">
        <span class="names">
          <span
            class="name"
            item-type="comment-from"
          >{{comment.fromPoet ? comment.fromPoet.username : comment.fromId}}</span>
          <span v-if="comment.toId !== comment.fromId" class="to">回复</span>
          <span
            v-if="comment.toId !== comment.fromId"
            class="name"
            item-type="comment-to"
          >{{comment.toPoet ? comment.toPoet.username : comment.toId}}</span>
          <i>:</i>
        </span>
        <p item-type="comment-content" v-html="$xss(comment.content0)"></p>
      </div>

      <div v-if="hasCommentsMore" class="more">
        <span v-show="!isCommentLoading" item-type="comments-more">加载更多...</span>
        <div v-if="isCommentLoading" class="praise-loading"><i></i></div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { defaultAvatarSrc } from '@/common/const'
import { toEmotionImages } from '@/common/image'

export default {
  name: 'Comments',

  props: {
    praises: {
      type: Array,
      default () {
        return []
      }
    },
    praiseTotal: {
      type: Number,
      default: -1
    },
    comments: {
      type: Array,
      default () {
        return []
      }
    },
    commentTotal: {
      type: Number,
      default: -1
    },
    isDetail: {
      type: Boolean,
      default: false
    },
    isPraiseLoading: {
      type: Boolean,
      default: false
    },
    isCommentLoading: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      defaultAvatarSrc,
      isIntoView: false
    }
  },

  computed: {
    hasAvatarsMore () {
      if (this.praiseTotal < 0) {
        return false
      }
      return this.praises.length < this.praiseTotal
    },
    hasCommentsMore () {
      if (this.commentTotal < 0) {
        return false
      }
      return this.textComments.length < this.commentTotal
    },
    textComments () {
      return this.comments.map(o => {
        return {
          ...o,
          content0: toEmotionImages(o.content)
        }
      })
    },
    currentPraises () {
      const srcFilter = Vue.filter('imgSrcFilter')
      return this.praises.map(o => {
        const temp = { ...o }
        temp.avatar = this.isIntoView ? srcFilter(o.fromPoet && o.fromPoet.avatar, 'avatar') : this.defaultAvatarSrc
        return temp
      })
    }
  },

  created () {
    window.comments = this
    if (this.isDetail) {
      this.setScrollIntoView()
    }
  },

  methods: {
    setScrollIntoView () {
      this.isIntoView = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/ui/style/const.scss';

$background: rgba(0, 0, 0, 0.03);
.comments {
  position: relative;
  border-radius: 8px;
  background-color: $background;
  &::before {
    content: "";
    width: 0;
    height: 0;
    position: absolute;
    left: 8px;
    top: -10px;
    border: solid 10px transparent;
    border-bottom-color: $background;
    border-top-width: 0;
  }

  .avatars {
    padding: 5px 8px;
    margin-right: -5px;
    box-sizing: border-box;
    overflow: hidden;
    user-select: none;
    .more,
    .praise-loading {
      display: inline-block;
      width: 3rem;
      height: 3rem;
      line-height: 3rem;
      font-size: 1.6rem;
      text-align: center;
      vertical-align: top;
    }
    img {
      width: 3rem;
      height: 3rem;
      margin-right: 5px;
      cursor: pointer;
      object-fit: contain;

      &:hover {
        background-color: rgba(250, 250, 250, 0.8);
        border-radius: 3px;
      }
    }
    img[item-tag=opacity] {
      opacity: 0;
    }
  }

  .contents {
    padding: 5px 8px;
    .more {
      padding: 0.5rem 0 0;
      margin-top: 1rem;
      color: $color-tip;
      line-height: $height-text;
      font-size: 1rem;
      text-align: center;
      border-top: 1px dashed white;
    }
    .praise-loading {
      line-height: $height-text;
      font-size: 1.6rem;
      text-align: center;
    }
  }
  .comment {
    .names {
      float: left;
    }

    p {
      white-space: pre-line;
      word-break: break-all;
      line-height: 2rem;
      font-size: 1.2rem;
    }
  }
}

.names {
  .name {
    font-weight: bold;
    line-height: 2rem;
    font-size: 1.2rem;
    cursor: pointer;
    &:hover {
      color: #148acf;
    }
  }
  .to {
    padding: 0 3px;
    font-size: 1.1rem;
    color: #555555;
  }
  i {
    padding: 0 8px 0 3px;
    font-size: 1.1rem;
    color: #555555;
  }
}

.praise-loading i{
  display: inline-block;
  width: 1rem;
  height: 1rem;
  vertical-align: middle;
  border-radius: 50%;
  border: 2px solid $color-theme;
  border-left-color: transparent;
  animation: loading-rotate 1s infinite linear;
}
@keyframes loading-rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(1turn);
  }
}
</style>

<style lang="scss">
.comments .comment p img {
  vertical-align: middle;
}
</style>
