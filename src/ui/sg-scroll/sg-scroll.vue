<template>
  <div class="sg-scroll" @touchstart="onMouseDown" @touchend="onMouseUp">
    <div class="sg-scroll-wrapper" :style="wrapperStyle">
      <div class="sg-scroll-slice">
        <template v-if="isPullHanding">{{isLoading ? '加载中...' : '松开后刷新'}}</template>
        <template v-else>下拉刷新</template>
      </div>
      <div :class="{'sg-scroll-content': true, 'sg-scroll-hidden': false}" ref="scrollEl">
        <div>
          <slot></slot>
        </div>
      </div>
      <div class="sg-scroll-slice">
        <template v-if="isEnd">暂无更多数据</template>
        <template v-else-if="isPullHanding">{{isLoading ? '加载中...' : '松开后加载'}}</template>
        <template v-else>上拉加载</template>
      </div>
    </div>
  </div>
</template>

<script>
const PULL_DOWN = 'pull-down'
const PULL_UP = 'pull-up'

export default {
  name: 'SgScroll',

  props: {
    isEnd: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      marginTop: -50,
      pullStatus: undefined,
      isLoading: false,
      isPullHanding: false
    }
  },

  created () {
    window.sgScroll = this
    this.refresh()
  },

  computed: {
    wrapperStyle () {
      return {
        'margin-top': this.marginTop + 'px'
      }
    }
  },

  methods: {
    refresh () {
      this.isPullHanding = true
      this.isLoading = true
      this.marginTop = 0
      this.pullStatus = PULL_DOWN
      this.$emit('refresh')
    },
    load () {
      this.isPullHanding = true
      this.isLoading = true
      this.marginTop = -100
      this.pullStatus = PULL_UP
      if (this.isEnd) {
        this.$nextTick(() => {
          this.reset()
        })
      } else {
        this.$emit('load')
      }
    },
    reset () {
      this.isPullHanding = false
      this.isLoading = false
      this.marginTop = -50
      this.pullStatus = undefined
    },
    /**
     * @param{Event} e
     */
    onMouseDown (e) {
      // e.preventDefault()
      // e.stopPropagation()
      if (this.pullStatus !== undefined || this.isPullHanding) {
        return
      }
      // console.log('onMouseDown', this.isPullHanding)
      this.moveHandle = e => {
        // e.preventDefault()
        // e.stopPropagation()
        this.onMouseMove(e)
      }
      this.previouseY = e.touches[0].clientY
      this.$el.addEventListener('touchmove', this.moveHandle)
    },

    onMouseMove (e) {
      const clientY = e.touches[0].clientY
      const yValue = clientY - this.previouseY
      if (this.pullStatus === undefined) {
        const scrollEl = this.$refs.scrollEl
        const clientHeight = scrollEl.clientHeight
        const scrollTop = scrollEl.scrollTop
        const scrollHeight = scrollEl.scrollHeight

        this.previouseY = clientY
        // console.log(scrollTop, clientHeight, scrollHeight)
        if (scrollTop < 2 && yValue > 0) {
          this.pullStatus = PULL_DOWN
        } else if (scrollTop + clientHeight + 2 > scrollHeight && yValue < 0) {
          this.pullStatus = PULL_UP
        }
        // console.log('pullStatus', this.pullStatus, yValue)
      } else {
        const unit = parseInt(yValue * 0.618)
        this.previouseY = clientY
        this.marginTop += unit
        if (this.pullStatus === PULL_DOWN) {
          if (this.marginTop < -50) {
            this.marginTop = -50
          } else if (this.marginTop > 0) {
            this.marginTop = 0
          }
          this.isPullHanding = this.marginTop > -10
        } else {
          if (this.marginTop < -100) {
            this.marginTop = -100
          } else if (this.marginTop > -50) {
            this.marginTop = -50
          }
          this.isPullHanding = this.marginTop < -90
        }
      }
    },
    onMouseUp (e) {
      // e.preventDefault()
      // e.stopPropagation()
      if (!this.moveHandle) {
        return
      }
      this.$el.removeEventListener('touchmove', this.moveHandle)
      this.moveHandle = null

      if (this.isPullHanding) {
        if (this.pullStatus === PULL_DOWN) {
          this.refresh()
        } else {
          this.load()
        }
      } else {
        this.reset()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sg-scroll {
  position: relative;
  height: 100%;
  overflow: hidden;

  .sg-scroll-wrapper {
    height: 100%;
    margin-top: 0;
    transition: margin-top 250ms;
  }

  .sg-scroll-slice {
    height: 50px;
    background-color: white;
    box-sizing: border-box;
    text-align: center;
    line-height: 50px;
  }

  .sg-scroll-content {
    height: 100%;
    overflow: auto;
  }

  .sg-scroll-hidden {
    user-select: none;
    overflow: hidden;
  }
}
</style>
