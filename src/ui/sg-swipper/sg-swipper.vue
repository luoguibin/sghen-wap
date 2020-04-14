<template>
  <div class="sg-swipper">
    <div ref="wrapper" :class="{ 'sg-swipper-wrapper': true, 'sg-swipper-wrapper_anime': !isTouching }"
      :style="wrapperStyle" @touchstart="onMouseDown" @touchend="onMouseUp">
      <div v-for="(item, index) in items" :key="index"
        :class="{ 'sg-swipper-item': true, 'sg-swipper-item_active': index === currentIndex }">
        <slot :name="item.slot"></slot>
      </div>
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
    auto: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      translateX: 0,
      currentIndex: 0,
      isTouching: false
    }
  },

  mounted () {
    window.sgSwipper = this
    this.setCurrentIndex(0)
  },

  computed: {
    wrapperStyle () {
      return {
        transform: `translate(${this.translateX}px, 0)`
      }
    }
  },

  methods: {
    setCurrentIndex (index) {
      this.$nextTick(() => {
        const itemWidth = this.$refs.wrapper.clientWidth
        this.currentIndex = index
        this.translateX = -index * itemWidth
        this.$emit('change', index)
      })

      if (!this.auto) {
        return
      }
      this._clearLoop()
      this.loopTimer = setTimeout(() => {
        let index = this.currentIndex + 1
        if (index >= this.items.length) {
          index = 0
        }
        this.setCurrentIndex(index)
      }, 5000)
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
      const clientX = e.touches[0].clientX
      this.translateX += clientX - this.previouseX
      if (this.translateX > 200) {
        this.translateX = 200
      } else {
        const wrapperEl = this.$refs.wrapper
        const maxWidth = this.items.length * wrapperEl.clientWidth - 200
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
      const index = Math.floor(Math.abs(this.translateX - itemWidth / 2) / itemWidth)
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
.sg-swipper {
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
    box-sizing: border-box;
    overflow: hidden;
  }
  .sg-swipper-item_active {
  }
}
</style>
