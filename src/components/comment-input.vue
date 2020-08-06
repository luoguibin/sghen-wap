<template>
  <div class="sg-mask comment-input-mask" v-show="visible" @click="onClose">
    <div class="comment-input" @click.stop="onNothing">
      <div v-show="emotionVisible" class="emotions" @click="onClickEmotion">
        <img v-for="key in emotions" :key="key" :src="key | emotionURL" />
        <span class="iconfont icon-down" @click="getNextEmotions()"></span>
      </div>
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
      type: [Number, String],
      default: 0
    },
    toId: {
      type: [Number, String],
      default: 0
    },
    placeholder: {
      type: String,
      default: '请输入'
    }
  },

  data () {
    return {
      emotionVisible: false,
      emotions: [],
      content: '',
      isLoading: false
    }
  },

  watch: {
    visible (v) {
      if (v) {
        this.content = ''
        this.resetEmotions()
        this.$nextTick(() => {
          this.$refs.textarea.focus()
        })
      }
    },
    /**
     * @param {String} v
     */
    content (v = '') {
      this.emotionVisible = v.endsWith('#')
    }
  },

  computed: {
    ...mapState({
      userID: state => state.auth.userID
    })
  },

  filters: {
    emotionURL(v = '') {
      if (v.length !== 6) {
        return v
      }
      return `/sapi/file/emotions/${v.substr(3, 3)}.gif`
    }
  },

  created () {
    window.commentInput = this
  },

  methods: {
    resetEmotions() {
      this.getNextEmotions(true)
    },
    getNextEmotions(isRefresh) {
      if (this.emotionPage === undefined) {
        this.emotionPage = 0
      }
      const MAX_COUNT = 105
      const PAGE_SIZE = 8
      if (isRefresh) {
        this.emotionPage = 0
      } else {
        this.emotionPage++
        if (this.emotionPage > MAX_COUNT / PAGE_SIZE) {
          this.emotionPage = 0
        }
      }
      const emotions = []
      for (let i = this.emotionPage * PAGE_SIZE, len = Math.min(i + PAGE_SIZE, MAX_COUNT); i < len; i++) {
        let indexStr = '' + i
        if (indexStr.length === 1) {
          indexStr = '00' + indexStr
        } else if (indexStr.length === 2) {
          indexStr = '0' + indexStr
        }
        emotions.push(`#EM${indexStr}`)
      }
      this.emotions = emotions
    },
    /**
     * @param {Event} e
     */
    onClickEmotion(e) {
      this.$refs.textarea.focus()
      let el = e.target
      if (el.tagName !== 'IMG') {
        return
      }
      let index = -1
      while(el) {
        index++
        el = el.previousElementSibling
      }
      const str = this.emotions[index] || ''
      this.content = this.content.substr(0, this.content.length - 1) + str
    },

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
}
.comment-input {
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 8px 5px;
  box-sizing: border-box;
  background-color: white;

  .emotions {
    height: 2.5rem;
    line-height: 2.5rem;
    margin-bottom: 0.5rem;

    span {
      display: inline-block;
      vertical-align: middle;
      padding: 0 0.5rem;
      font-size: 1.6rem;
      transform: rotate(-90deg);
      border-radius: 5px;;
      background-color: rgb(245, 245, 245);
    }

    img {
      width: 2rem;
      height: 2rem;
      vertical-align: middle;
      margin-right: 0.5rem;
    }
  }

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
