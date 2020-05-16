<template>
  <div class="sg-swipper">
    <div
      ref="wrapper"
      :class="{ 'sg-swipper-wrapper': true, 'sg-swipper-wrapper_anime': !isTouching }"
      :style="wrapperStyle"
      @touchstart="onMouseDown"
      @touchend="onMouseUp"
    >
      <div
        v-for="(item, index) in items"
        :key="item.slot"
        ref="swipperItems"
        :class="{ 'sg-swipper-item': true, 'sg-swipper-item_active': index === currentIndex }"
      >
        <slot :name="item.slot"></slot>
      </div>
    </div>
    <div class="sg-swipper-pointers">
      <div
        v-for="(item, index) in items"
        :key="item.slot"
        :class="{'pointer': true, 'pointer-active': index === currentIndex}"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SgSwipper',

  props: {
    items: {
      type: Array,
      required: true
    },
    duration: {
      type: Number,
      default: 5000
    },
    auto: {
      type: [Boolean, Number],
      default: true
    },
    index: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      translateX: 0,
      currentIndex: 0,
      loopCount: 0,
      isTouching: false
    }
  },

  mounted () {
    window.sgSwipper = this
    this.start()
  },

  computed: {
    wrapperStyle () {
      return {
        transform: `translate(${this.translateX}px, 0)`
      }
    }
  },

  methods: {
    start () {
      this.loopCount = 0
      this.setCurrentIndex(this.index)
    },
    setCurrentIndex (index) {
      this.$nextTick(() => {
        const itemWidth = this.$refs.wrapper.clientWidth
        this.currentIndex = index
        this.translateX = -index * itemWidth
        if (this.originIndex !== index) {
          this.$emit('change', index)
        }
        this.originIndex = index
      })

      if (!this.auto) {
        return
      }

      this._clearLoop()
      this.loopTimer = setTimeout(() => {
        let index = this.currentIndex + 1
        if (index >= this.items.length) {
          index = 0
          this.loopCount++
          if (typeof this.auto === 'number' && this.loopCount >= this.auto) {
            return
          }
        }
        this.setCurrentIndex(index)
      }, this.duration)
    },
    _clearLoop () {
      if (this.loopTimer) {
        clearTimeout(this.loopTimer)
        this.loopTimer = undefined
      }
    },
    onMouseDown (e) {
      if (this.moveHandle) {
        return
      }
      this._clearLoop()
      this.moveHandle = e => {
        this.onMouseMove(e)
      }
      this.isTouching = true
      this.previouseX = e.touches[0].clientX
      this.$el.addEventListener('touchmove', this.moveHandle)
    },
    onMouseMove (e) {
      const item = this.$refs.swipperItems[this.currentIndex]
      if (
        item.scrollLeft > 0 &&
        item.scrollLeft + item.clientWidth < item.scrollWidth
      ) {
        return
      }
      const clientX = e.touches[0].clientX
      this.translateX += clientX - this.previouseX
      if (this.translateX > 100) {
        this.translateX = 100
      } else {
        const wrapperEl = this.$refs.wrapper
        const maxWidth = this.items.length * wrapperEl.clientWidth - 100
        if (this.translateX < -maxWidth) {
          this.translateX = -maxWidth
        }
      }
      this.previouseX = clientX
    },
    onMouseUp (e) {
      if (!this.moveHandle) {
        return
      }

      const itemWidth = this.$refs.wrapper.clientWidth
      // todo: 优化
      let index = Math.floor(
        Math.abs(this.translateX - itemWidth / 2) / itemWidth
      )
      index = index === this.items.length ? index - 1 : index
      this.setCurrentIndex(index)

      this.isTouching = false
      this.$el.removeEventListener('touchmove', this.moveHandle)
      this.moveHandle = null
    }
  },
  beforeDestroy () {
    this._clearLoop()
  }
}
</script>

<style lang="scss" scoped>
@import "../style/const.scss";

.sg-swipper {
  position: relative;
  height: 15rem;
  overflow: hidden;

  .sg-swipper-wrapper {
    height: 100%;
    white-space: nowrap;
  }
  .sg-swipper-wrapper_anime {
    transition: transform 600ms;
  }
  .sg-swipper-item {
    display: inline-block;
    width: 100%;
    height: 100%;
    background-color: white;
    vertical-align: top;
    box-sizing: border-box;
    overflow: auto;
  }
  .sg-swipper-item_active {
  }
  .sg-swipper-pointers {
    position: absolute;
    left: 50%;
    bottom: 0.2rem;
    transform: translate(-50%, 0);
    .pointer {
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background-color: $color-theme-disabled;
    }
    .pointer + .pointer {
      margin-left: 1rem;
    }
    .pointer-active {
      background-color: $color-theme-active;
    }
  }
}
</style>
