<template>
  <transition
    @before-enter="beforeEnter"
    @enter="enter"
    @after-enter="afterEnter"
    @enter-cancelled="enterCancelled"
  >
    <div class="praise-anime iconfont icon-praise" v-show="visible"></div>
  </transition>
</template>

<script>
export default {
  name: 'PraiseAnime',

  props: {
    id: {
      type: Number || String,
      default: 0
    },
    from: {
      type: Object,
      required: true
    },
    to: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      visible: false
    }
  },

  mounted () {
    window.praiseAnime = this
    this.visible = true
  },

  methods: {
    beforeEnter (el) {
      const style = el.style
      const o = this.from
      for (const key in o) {
        style[key] = o[key]
      }
    },
    // 当与 CSS 结合使用时
    // 回调函数 done 是可选的
    enter (el, done) {
      void el.offsetWidth
      const duration = 800
      const style = el.style
      style.transition = `all ${duration}ms`
      const o = this.to
      for (const key in o) {
        style[key] = o[key]
      }
      setTimeout(() => {
        done()
      }, duration)
    },
    afterEnter (el) {
      this.$emit('end', this.id)
    },
    enterCancelled (el) {
      // console.log('enterCancelled')
    }
  }
}
</script>

<style lang="scss" scoped>
.praise-anime {
  position: fixed;
  top: 0;
  left: 0;
  font-size: 3.5rem;
  color: steelblue;
  z-index: 99;
  transform: translate(-50%, -50%);
}
</style>
