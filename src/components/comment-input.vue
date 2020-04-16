<template>
  <div class="comment-input-mask" v-show="visible" @click="onClose">
    <div class="comment-input" @click.stop="onNothing">
      <textarea ref="textarea" v-model="content" :placeholder="placeholder"></textarea>
      <sg-button
        type="primary"
        @click.stop="onComfirm"
        :disabled="!content"
        :isLoading="isLoading"
      >确定</sg-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiPostData } from '@/api'

export default {
  name: 'CommentInput',

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number || String,
      default: 0
    },
    toId: {
      type: Number || String,
      default: 0
    },
    placeholder: {
      type: String,
      default: '请输入'
    }
  },

  data () {
    return {
      content: '',
      isLoading: false
    }
  },

  watch: {
    visible (v) {
      if (v) {
        this.content = ''
        this.$nextTick(() => {
          this.$refs.textarea.focus()
        })
      }
    }
  },

  computed: {
    ...mapState({
      userID: state => state.auth.userID
    })
  },

  created () {
    window.commentInput = this
  },

  methods: {
    onClose () {
      this.isLoading = false
      this.$emit('update:visible', false)
    },
    onComfirm (e) {
      this.isLoading = true
      apiPostData(apiURL.commentCreate, {
        type: 1,
        typeId: this.id,
        content: this.content,
        fromId: this.userID,
        toId: this.toId
      })
        .then(data => {
          this.$emit('ok', data.data)
          this.onClose()
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    onNothing () {}
  }
}
</script>

<style lang="scss" scoped>
.comment-input-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.6);
}
.comment-input {
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 8px 5px;
  box-sizing: border-box;
  background-color: white;

  textarea {
    display: block;
    width: 100%;
    height: 8rem;
    margin-bottom: 0.5rem;
    font-size: 1.4rem;
    line-height: 1.6rem;
    box-sizing: border-box;
    resize: none;
  }
}
</style>
