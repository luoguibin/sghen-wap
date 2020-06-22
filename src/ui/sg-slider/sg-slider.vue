<template>
  <div
    :class="{'sg-slider': true, 'slide-anime': !isTouching}"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @click="$emit('click', $event)"
  >
    <div
      v-for="item in slideItems"
      ref="items"
      :key="item.id"
      :class="{'slider-item': true, 'card-item__active': item.id === activeId}"
      :style="item.itemStyle"
      :item-type="itemType"
    >
      <slot :name="item.slot"></slot>
    </div>
  </div>
</template>

<script>
const GAP_IN_PERCENT = 20

export default {
  name: 'SgSlider',

  props: {
    items: {
      type: Array,
      required: true
    },
    itemType: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      slideItems: [],
      isTouching: false,

      activeId: 0,
      activeIndex: 0
    }
  },

  computed: {},

  created () {
    window.sgSlider = this

    this.slideItems = this.items.map(o => {
      return {
        id: o.slot,
        slot: o.slot,
        ratioX: 100,
        contentStyle: o.contentStyle,
        itemStyle: {
          ...o.itemStyle,
          // left: '100%',
          transform: 'translate(100%, 0) scale(1)'
        }
      }
    })
    this.slideItems[0].ratioX = 0
    this.setSlideStyle(this.slideItems[0])
    this.activeId = this.slideItems[0].id
    this.activeIndex = 0
  },

  methods: {
    onTouchStart (e) {
      e.preventDefault()
      this.isTouching = true
      this.canSlide = true
      const touch = (e.touches && e.touches[0]) || e
      this.preClientX = touch.clientX
      this.downClientX = touch.clientX
      this.downClientY = touch.clientY
      this.downScrollLeft = this.$refs.items[this.activeIndex].scrollLeft
      this.downScrollTop = this.$refs.items[this.activeIndex].scrollTop
    },
    onTouchMove (e) {
      if (!this.isTouching) {
        return
      }
      e.preventDefault()

      const touch = (e.touches && e.touches[0]) || e
      const xVal = touch.clientX - this.preClientX
      // xVal正数，则当前item向右移动
      const itemEl = this.$refs.items[this.activeIndex]
      itemEl.scrollTop = this.downScrollTop - (touch.clientY - this.downClientY)
      if (itemEl.scrollLeft > 0 && xVal > 0) {
        this.canSlide = false
        itemEl.scrollLeft = this.downScrollLeft - (touch.clientX - this.downClientX)
        this.preClientX = touch.clientX
        return
      }
      if (itemEl.clientWidth + itemEl.scrollLeft < itemEl.scrollWidth && xVal < 0) {
        this.canSlide = false
        itemEl.scrollLeft = this.downScrollLeft - (touch.clientX - this.downClientX)
        this.preClientX = touch.clientX
        return
      }

      const index = this.activeIndex
      const activeItem = this.slideItems[index]
      const ratio = (xVal * 100) / this.$el.clientWidth
      activeItem.ratioX += ratio
      activeItem.ratioX = Math.max(-100, activeItem.ratioX)
      activeItem.ratioX = Math.min(100, activeItem.ratioX)
      this.setSlideStyle(activeItem)

      const nextItem = this.slideItems[index + 1]
      if (nextItem) {
        // -100% ~ 0 ~ 100%
        if (activeItem.ratioX <= 0) {
          nextItem.ratioX = activeItem.ratioX + 100
        } else {
          nextItem.ratioX = 100
        }
        this.setSlideStyle(nextItem)
      }

      const previousItem = this.slideItems[index - 1]
      if (previousItem) {
        if (activeItem.ratioX >= 0) {
          previousItem.ratioX = activeItem.ratioX - 100
        } else {
          previousItem.ratioX = -100
        }
        this.setSlideStyle(previousItem)
      }

      this.preClientX = touch.clientX
    },
    onTouchEnd (e) {
      e.preventDefault()
      this.isTouching = false

      const index = this.activeIndex
      const activeItem = this.slideItems[index]
      // <-GAP_IN_PERCENT% 或者 >GAP_IN_PERCENT% 则认为进行切换
      if (activeItem.ratioX < -GAP_IN_PERCENT) {
        // 下一页活动
        this.slideChange(1)
      } else if (activeItem.ratioX > GAP_IN_PERCENT) {
        // 上一页活动
        this.slideChange(-1)
      } else {
        // 当前页活动
        this.slideChange()
      }
    },
    slideChange (unit = 0) {
      const index = this.activeIndex
      const activeItem = this.slideItems[index]
      const previousItem = this.slideItems[index - 1]
      const nextItem = this.slideItems[index + 1]
      if (unit > 0) {
        if (nextItem) {
          activeItem.ratioX = -100
          nextItem.ratioX = 0
          this.setSlideStyle(nextItem)

          this.activeIndex++
          this.$emit('change', this.activeIndex)
        } else {
          activeItem.ratioX = 0
          this.$emit('change', -2)
        }
      } else if (unit < 0) {
        if (previousItem) {
          activeItem.ratioX = 100
          previousItem.ratioX = 0
          this.setSlideStyle(previousItem)

          this.activeIndex--
          this.$emit('change', this.activeIndex)
        } else {
          activeItem.ratioX = 0
          this.$emit('change', -1)
        }
      } else {
        activeItem.ratioX = 0
        if (previousItem) {
          previousItem.ratioX = -100
          this.setSlideStyle(previousItem)
        }
        if (nextItem) {
          nextItem.ratioX = 100
          this.setSlideStyle(nextItem)
        }
      }
      this.setSlideStyle(activeItem)
      this.activeId = this.slideItems[this.activeIndex].id
    },
    setSlideStyle (slide) {
      const { ratioX, itemStyle } = slide
      const scale = Math.max(1 - Math.abs(ratioX / 100), 0.8)
      itemStyle.transform = `translate(${ratioX}%) scale(${scale}, ${scale})`
      // const blurNum = Math.floor((1 - scale) * GAP_IN_PERCENT)
      // itemStyle.filter = `blur(${blurNum}px)`
      // itemStyle.left = `${ratioX}%`
    }
  }
}
</script>

<style lang="scss" scoped>
.sg-slider {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;

  .slider-item {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
  }
}
.slide-anime .slider-item {
  transition: transform 300ms, left 300ms;
}
</style>
