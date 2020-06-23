<template>
  <div class="scroll-box" item-type="scroll">
    <header style="height: 30rem;">
      <h2>I'm header</h2>
      <h2>I'm header</h2>
      <h2>I'm header</h2>
    </header>

    <div ref="scroll" class="scroll" item-type="scroll">
      <div v-for="(_, index) in Array(100)" :key="index" class="item">{{index}}</div>
    </div>
    <div ref="scroll" class="scroll" item-type="scroll">
      <div v-for="(_, index) in Array(100)" :key="index" class="item">{{index}}</div>
    </div>

    <footer style="height: 50rem;">
      <h2>I'm footer</h2>
      <h2>I'm footer</h2>
      <h2>I'm footer</h2>
    </footer>
  </div>
</template>

<script>
/**
 * @param {HTMLElement} el
 */
const getScrollElement = function (el) {
  while (el) {
    if (el.getAttribute('item-type') === 'scroll') {
      break
    }
    el = el.parentElement
  }

  if (el && !el.isInitScroll) {
    initScroll(el)
  }

  return el
}

const initScroll = function (el) {
  el.isInitScroll = true

  /**
   * 停止滚动动画
   */
  el.stopAnimeScroll = function () {
    if (this.scrollTimer) {
      cancelAnimationFrame(this.scrollTimer)
      this.scrollTimer = null
    }
  }

  /**
   * 开始滚动动画
   */
  el.startAnimeScroll = function (valueY) {
    this.animeUnit = valueY // > 0 ? Math.abs(valueY) : -Math.abs(valueY)
    this.animeCount = Math.ceil(Math.abs(valueY) / 1)
    this.animeIndex = 0
    this.animeLoopStep()
  }

  /**
   * 循环滚动动画
   */
  el.animeLoopStep = function () {
    if (this.animeIndex < this.animeCount) {
      this.animeIndex++
      // 正弦递减
      const ratio = Math.sin(
        ((1 - this.animeIndex / this.animeCount) * Math.PI) / 2
      )
      this.scrollTop -= this.animeUnit * ratio
      this.scrollTimer = requestAnimationFrame(() => {
        this.animeLoopStep()
      })
    } else {
      this.scrollTimer = null
    }
  }

  /**
   * 获取父滚动元素
   */
  el.getParentScrollElement = function () {
    return getScrollElement(this.parentElement)
  }
}

/**
 * 问题背景：gnored attempt to cancel a touchmove event with cancelable=false, for example because scrolling is in progress and cannot be interrupted.
 * 需求组件：滚动完后继续滚动父级
 */
export default {
  name: 'ScrollBox',

  data () {
    return {
    }
  },

  mounted () {
    window.scrollTest = this
    this.init()
  },

  methods: {
    init () {
      const touchStartEvent = e => {
        // 获取最近一个scroll
        const scrollEl = getScrollElement(e.target)
        if (!scrollEl) {
          return
        }
        scrollEl.stopAnimeScroll()
        this.$el.addEventListener('touchmove', touchMoveEvent)

        const touch = (e.touches && e.touches[0]) || e
        this.previousTouch = touch
        this.scrollEl = scrollEl
      }

      const touchMoveEvent = e => {
        e.preventDefault()

        const touch = (e.touches && e.touches[0]) || e
        const valueY = touch.clientY - this.previousTouch.clientY
        touch.valueY = valueY
        this.previousTouch = touch

        const scrollEl = this.scrollEl
        scrollEl.scrollTop -= valueY
        if (valueY > 0) {
          // 向下拖动
          if (scrollEl.scrollTop === 0) {
            const parentScrollEl = scrollEl.getParentScrollElement()
            if (parentScrollEl) {
              this.scrollEl = parentScrollEl
            }
          }
        } else {
          // 向上拖动
          const height = Math.round(scrollEl.scrollTop + scrollEl.clientHeight)
          if (height >= scrollEl.scrollHeight) {
            const parentScrollEl = scrollEl.getParentScrollElement()
            if (parentScrollEl) {
              this.scrollEl = parentScrollEl
            }
          }
        }
      }

      const touchEndEvent = () => {
        const scrollEl = this.scrollEl
        scrollEl.startAnimeScroll(this.previousTouch.valueY)
        this.$el.removeEventListener('touchmove', touchMoveEvent)
      }

      this.$el.addEventListener('touchstart', touchStartEvent)
      this.$el.addEventListener('touchend', touchEndEvent)
    }
  }
}
</script>

<style lang="scss" scoped>
.scroll-box {
  height: 100%;
  box-sizing: border-box;
  font-size: 2rem;
  overflow: hidden;

  .scroll {
    height: 50%;
    border: 1px solid gray;
    box-sizing: border-box;
    overflow: hidden;
  }

  .item {
    padding: 0 1rem;
    margin-bottom: 2rem;
    line-height: 5rem;
    background-color: #eee;
    overflow-y: auto;
  }
}
</style>

<style lang="scss">
* {
  padding: 0;
  margin: 0;
}

html,
body {
  height: 100%;
}
</style>
