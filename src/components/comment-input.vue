<template>
  <transition name="slide">
    <div class="sg-mask comment-input-mask" v-show="visible" @click="onClose">
      <div class="comment-input" @click.stop="onNothing">
        <div ref="emotionWrapper" v-show="emotionVisible" class="emotions" @click="onClickEmotion">
          <img v-for="key in emotions" :key="key" :src="key | emotionURL" />
          <span ref="pageEl" class="iconfont icon-down" @click="getNextEmotions()"></span>
        </div>
        <div
          ref="inputarea"
          class="inputarea"
          contenteditable="true"
          :toPlacehoder="toPlacehoder"
          @input="onContentInput"
          @focus="onFocus"
          @blur="onBlur"
        ></div>
        <sg-button
          type="primary"
          @click.stop="onComfirm"
          :disabled="!contentHTML"
          :isLoading="isLoading"
        >确定</sg-button>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapState } from 'vuex'
import { apiURL, apiPostData } from '@/api'
import { toEmotionImages, toEmotionCodes } from '@/common/image'

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
    typeUserId: {
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
      isFocus: false,
      emotionVisible: true,
      emotions: [],
      contentHTML: '',
      isLoading: false,
      pageSize: 8
    }
  },

  watch: {
    visible (v) {
      if (v) {
        this.$nextTick(() => {
          this.resetEmotions()
          const inputarea = this.$refs.inputarea
          inputarea.innerHTML = ''
          this.onContentInput({ target: inputarea })
          inputarea.focus()
        })
      }
    }
  },

  computed: {
    toPlacehoder () {
      return this.contentHTML.length ? '' : this.placeholder
    },
    ...mapState({
      userID: (state) => state.auth.userID
    })
  },

  filters: {
    emotionURL (v = '') {
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
    resetEmotions () {
      const rootFontSize = parseInt(
        getComputedStyle(document.documentElement).fontSize
      )
      const { emotionWrapper, pageEl } = this.$refs
      const width = emotionWrapper.clientWidth - pageEl.clientWidth
      this.pageSize = Math.floor(width / (2.5 * rootFontSize))
      this.getNextEmotions(true)
    },
    getNextEmotions (isRefresh) {
      if (this.emotionPage === undefined) {
        this.emotionPage = 0
      }
      const MAX_COUNT = 105
      const PAGE_SIZE = this.pageSize
      if (isRefresh) {
        this.emotionPage = 0
      } else {
        this.emotionPage++
        if (this.emotionPage > MAX_COUNT / PAGE_SIZE) {
          this.emotionPage = 0
        }
      }
      const emotions = []
      for (
        let i = this.emotionPage * PAGE_SIZE,
          len = Math.min(i + PAGE_SIZE, MAX_COUNT);
        i < len;
        i++
      ) {
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
    onClickEmotion (e) {
      e.stopPropagation()
      e.preventDefault()
      let el = e.target
      this.$refs.inputarea.focus()
      if (el.tagName !== 'IMG') {
        return
      }
      let index = -1
      while (el) {
        index++
        el = el.previousElementSibling
      }
      this.insertEmotion(toEmotionImages(this.emotions[index] || ''))
    },
    insertEmotion (html) {
      if (!html) {
        return
      }
      // todo
      if (window.getSelection) {
        const sel = window.getSelection()
        if (sel.getRangeAt && sel.rangeCount) {
          let range = sel.getRangeAt(0)
          range.deleteContents()
          const el = document.createElement('div')
          el.innerHTML = html

          const frag = document.createDocumentFragment()
          let node
          let lastNode
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node)
          }
          range.insertNode(frag)

          if (lastNode) {
            range = range.cloneRange()
            range.setStartAfter(lastNode)
            range.collapse(true)
            sel.removeAllRanges()
            sel.addRange(range)
          }
        }
      } else {
        const selection = document.selection
        if (selection && selection.type !== 'Control') {
          // IE9以下
          selection.createRange().pasteHTML(html)
        }
      }

      this.onContentInput({ target: this.$refs.inputarea })
    },

    onContentInput (e) {
      this.contentHTML = e.target.innerHTML
    },
    onFocus () {
      this.isFocus = true
    },
    onBlur () {
      this.isFocus = false
    },

    onClose () {
      this.isLoading = false
      this.$emit('update:visible', false)
    },
    onComfirm (e) {
      this.isLoading = true
      const content = toEmotionCodes(this.contentHTML)
      apiPostData(apiURL.commentCreate, {
        poetryId: this.id,
        poetId: this.typeUserId,
        content,
        toId: this.toId
      })
        .then((data) => {
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
@import "@/ui/style/const.scss";

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
      border-radius: 5px;
      background-color: rgb(245, 245, 245);
    }

    // 更改大小后需要改变单行个数
    img {
      width: 2rem;
      height: 2rem;
      vertical-align: middle;
      margin-right: 0.5rem;
      user-select: none;
    }
  }

  .inputarea {
    position: relative;
    display: block;
    width: 100%;
    height: 8rem;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 1.4rem;
    line-height: 1.6rem;
    box-sizing: border-box;
    resize: none;
    outline: none;
    border: 1px solid $color-theme-disabled;
    &::before {
      content: attr(toPlacehoder);
      position: absolute;
      top: 0;
      left: 0;
      padding: inherit;
      display: inline-block;
      font-size: $size-text;
      color: $color-tip;
      pointer-events: none;
    }
  }
}

.slide-enter,
.slide-leave-to {
  background-color: transparent;
}
.slide-enter .comment-input,
.slide-leave-to .comment-input {
  transform: translate(0, 100%);
}
.slide-enter-active,
.slide-leave-active {
  transition: background-color 0.3s ease;
}
.slide-enter-active .comment-input,
.slide-leave-active .comment-input {
  transition: transform 0.3s ease;
}
</style>

<style lang="scss">
.comment-input .inputarea img {
  vertical-align: middle;
}
</style>
