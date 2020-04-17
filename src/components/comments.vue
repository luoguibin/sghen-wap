<template>
  <div class="comments" v-show="praises.length || comments.length">
    <!-- 已点赞的用户头像 -->
    <div ref="avatars" class="avatars" v-show="praises.length">
      <img
        v-for="comment in praises"
        :key="comment.id"
        :src="comment.fromPeot && comment.fromPeot.iconUrl | img-src"
        :item-tag="comment.itemTag"
        item-type="comment-avatar"
        alt
      />
    </div>

    <div v-show="praises.length && comments.length" style="border-bottom: 1px solid white;"></div>

    <!-- 评论列表 -->
    <div class="contents" v-show="comments.length">
      <div v-for="comment in comments" class="comment" :key="comment.id">
        <span class="names">
          <span
            class="name"
            item-type="comment-from"
          >{{comment.fromPeot ? comment.fromPeot.name : comment.fromId}}</span>
          <span v-if="comment.toId !== comment.fromId" class="to">回复</span>
          <span
            v-if="comment.toId !== comment.fromId"
            class="name"
            item-type="comment-to"
          >{{comment.toPeot ? comment.toPeot.name : comment.toId}}</span>
          <i>:</i>
        </span>
        <p item-type="comment-content">{{comment.content}}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Comments',

  props: {
    praises: {
      type: Array,
      default () {
        return []
      }
    },
    comments: {
      type: Array,
      default () {
        return []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$background: rgba(0, 0, 0, 0.05);
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
    user-select: none;

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
</style>
