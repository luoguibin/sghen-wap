<template>
  <div class="sg-scroll-outter">
    <div class="sg-scroll" @touchstart="onMouseDown" @touchend="onMouseUp">
      <div :class="{'sg-scroll-wrapper': true, 'sg-scroll-anime': !isTouching}" :style="wrapperStyle">
        <div class="sg-scroll-slice" :style="topSliceStyle">
          <template v-if="pullResult">{{pullResult}}</template>
          <template v-else-if="isPullHanding">{{isLoading ? '加载中...' : '松开后刷新'}}</template>
          <template v-else>下拉刷新</template>
        </div>
        <div :class="{'sg-scroll-content': true, 'sg-scroll-hidden': false}" ref="scrollEl">
          <div>
            <slot></slot>
          </div>
        </div>
        <div class="sg-scroll-slice" :style="bottomSliceStyle">
          <template v-if="pullResult">{{pullResult}}</template>
          <template v-else-if="isEnd">暂无更多数据</template>
          <template v-else-if="isPullHanding">{{isLoading ? '加载中...' : '松开后加载'}}</template>
          <template v-else>上拉加载</template>
        </div>
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
      sliceHeight: 50,
      translateY: 0,
      topScale: 1,
      bottomScale: 1,

      pullResult: '',
      pullStatus: undefined,
      isTouching: false,
      isPullHanding: false,

      isLoading: false
    }
  },

  created () {
    window.sgScroll = this
    this.refresh()
  },

  computed: {
    wrapperStyle () {
      return {
        'transform': `translate(0, ${this.translateY}px)`
      }
    },
    topSliceStyle () {
      const pxStr = this.sliceHeight + 'px'
      const topScale = this.topScale
      return {
        'height': pxStr,
        'line-height': pxStr,
        'margin-top': '-' + pxStr,
        'transform': `scale(${topScale}, ${topScale})`
      }
    },
    bottomSliceStyle () {
      const pxStr = this.sliceHeight + 'px'
      const bottomScale = this.bottomScale
      return {
        'height': pxStr,
        'line-height': pxStr,
        'margin-bottom': '-' + pxStr,
        'transform': `scale(${bottomScale}, ${bottomScale})`
      }
    }
  },

  methods: {
    refresh () {
      this.isPullHanding = true
      this.isLoading = true
      this.translateY = this.sliceHeight
      this.pullStatus = PULL_DOWN
      this.topScale = 1
      this.$emit('refresh')
    },
    load () {
      this.isPullHanding = true
      this.isLoading = true
      this.translateY = -this.sliceHeight
      this.pullStatus = PULL_UP
      this.bottomScale = 1
      if (this.isEnd) {
        this.$nextTick(() => {
          this.reset()
        })
      } else {
        this.$emit('load')
      }
    },
    success () {
      this.pullResult = this.pullStatus === PULL_DOWN ? '刷新成功' : '加载成功'
      const scrollEl = this.$refs.scrollEl
      const scrollTop = scrollEl.scrollTop
      setTimeout(() => {
        if (this.pullStatus === PULL_UP) {
          const targetScrollTop = scrollTop + this.$el.clientHeight * 0.9
          this.intervalTimer = setInterval(() => {
            if (targetScrollTop > scrollEl.scrollTop) {
              scrollEl.scrollTop += 50
            } else {
              clearInterval(this.intervalTimer)
              this.intervalTimer = null
            }
          }, 20)
        }
        this.reset()
      }, 800)
    },
    fail () {
      this.pullResult = this.pullStatus === PULL_DOWN ? '刷新失败，请重试' : '加载失败，请重试'
      setTimeout(() => {
        this.reset()
      }, 800)
    },
    reset () {
      this.isPullHanding = false
      this.isLoading = false
      this.isTouching = false
      this.pullStatus = undefined
      this.pullResult = ''
      this.translateY = 0
    },
    /**
     * @param{Event} e
     */
    onMouseDown (e) {
      if (this.pullStatus !== undefined || this.isPullHanding) {
        return
      }
      // console.log('onMouseDown', this.isPullHanding)
      if (!this.moveHandle) {
        this.moveHandle = e => {
          this.onMouseMove(e)
        }
      }
      this.isTouching = true
      this.previouseY = e.touches[0].clientY
      this.$el.addEventListener('touchmove', this.moveHandle)
    },

    onMouseMove (e) {
      const clientY = e.touches[0].clientY
      const yValue = clientY - this.previouseY
      this.previouseY = clientY

      const scrollEl = this.$refs.scrollEl
      const scrollTop = scrollEl.scrollTop
      const sliceHeight = this.sliceHeight

      // console.log(`translateY=${this.translateY}, scrollTop=${scrollTop},`)
      // console.log(`scrollEl.clientHeight=${scrollEl.clientHeight}, scrollEl.scrollHeight=${scrollEl.scrollHeight}`)
      // console.log('')

      let tempY = this.translateY
      if (scrollTop === 0) {
        // 可进入下拉，translateY应该为正数
        if (yValue) {
          e.preventDefault()
          e.stopPropagation()
        }
        tempY += yValue
        tempY = Math.max(tempY, 0)
        tempY = Math.min(tempY, sliceHeight * 3)

        this.isPullHanding = tempY > sliceHeight * 0.75
        this.topScale = Math.max(1, tempY / sliceHeight)
        this.pullStatus = PULL_DOWN
      } else if (scrollTop + scrollEl.clientHeight === scrollEl.scrollHeight) {
        // 可进入上拉，translateY应该为负数
        tempY += yValue
        tempY = Math.max(tempY, -sliceHeight * 3)
        tempY = Math.min(tempY, 0)

        this.isPullHanding = tempY < -sliceHeight * 0.75
        this.bottomScale = Math.max(1, -tempY / sliceHeight)
        this.pullStatus = PULL_UP
      } else {
        // 默认区域上下滑动
        tempY = 0
      }
      this.translateY = tempY
    },
    onMouseUp (e) {
      // e.preventDefault()
      // e.stopPropagation()
      if (!this.moveHandle) {
        return
      }
      this.$el.removeEventListener('touchmove', this.moveHandle)
      this.moveHandle = null
      this.isTouching = false

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
.sg-scroll-outter {
  height: 100%;
  touch-action: none;
}
.sg-scroll {
  position: relative;
  height: 100%;
  overflow: hidden;

  .sg-scroll-wrapper {
    height: 100%;
    margin-top: 0;
  }

  .sg-scroll-anime {
    transition: transform 250ms;
    .sg-scroll-slice {
      transition: inherit;
    }
  }

  .sg-scroll-slice {
    background-color: rgb(240, 240, 240);
    box-sizing: border-box;
    text-align: center;
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
