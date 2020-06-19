<template>
  <div
    :class="{'sg-slider': true, 'slide-anime': !isTouching}"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @mousedown="onTouchStart"
    @mousemove="onTouchMove"
    @mouseup="onTouchEnd"
    @click="$emit('click', $event)"
  >
    <div
      v-for="item in options"
      ref="items"
      :key="item.id"
      :class="{'slider-item': true, 'card-item__active': item.id === activeId}"
      :style="item.itemStyle"
      :item-type="itemType"
    >
      <!-- <slot :name="item.slot"></slot> -->
      <div :style="item.contentStyle">{{item}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SgSlider',

  props: {
    items: {
      type: Array,
      // required: true,
      default () {
        return [
          {
            slot: 'slot-0',
            itemStyle: {
              backgroundColor: 'rgba(12, 123, 234, 0.3)'
            },
            contentStyle: {
              width: '180%',
              height: '150%'
            }
          },
          {
            slot: 'slot-1',
            itemStyle: {
              backgroundColor: 'rgba(123, 12, 234, 0.3)'
            },
            contentStyle: {
              width: '150%',
              height: '100%'
            }
          },
          {
            slot: 'slot-2',
            itemStyle: {
              backgroundColor: 'rgba(234, 12, 123, 0.3)'
            },
            contentStyle: {
              width: '300%',
              height: '100%'
            }
          },
          {
            slot: 'slot-3',
            itemStyle: {
              backgroundColor: 'rgba(12, 234, 123, 0.3)'
            },
            contentStyle: {
              width: '100%',
              height: '100%'
            }
          },
          {
            slot: 'slot-4',
            itemStyle: {
              backgroundColor: 'rgba(123, 234, 12, 0.3)'
            },
            contentStyle: {
              width: '100%',
              height: '100%'
            }
          }
        ]
      }
    },
    itemType: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      options: [],
      isTouching: false,

      activeId: 0,
      activeIndex: 0
    }
  },

  computed: {},

  created () {
    window.sgSlider = this

    this.options = this.items.map(o => {
      return {
        id: o.slot,
        slot: o.slot,
        ratioX: 100,
        contentStyle: o.contentStyle,
        itemStyle: {
          ...o.itemStyle,
          // left: '100%',
          transform: 'translate(100%, 0)'
        }
      }
    })
    this.options[0].ratioX = 0
    // this.options[0].itemStyle.left = 0
    this.options[0].itemStyle.transform = 'translate(0, 0)'
    this.activeId = this.options[0].id
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
      const activeItem = this.options[index]
      const ratio = (xVal * 100) / this.$el.clientWidth
      activeItem.ratioX += ratio
      activeItem.ratioX = Math.max(-100, activeItem.ratioX)
      activeItem.ratioX = Math.min(100, activeItem.ratioX)
      activeItem.itemStyle.transform = `translate(${activeItem.ratioX}%)`
      // activeItem.itemStyle.left = `${activeItem.ratioX}%`

      const nextItem = this.options[index + 1]
      if (nextItem) {
        // -100% ~ 0 ~ 100%
        if (activeItem.ratioX <= 0) {
          nextItem.ratioX = activeItem.ratioX + 100
        } else {
          nextItem.ratioX = 100
        }
        nextItem.itemStyle.transform = `translate(${nextItem.ratioX}%)`
        // nextItem.itemStyle.left = `${nextItem.ratioX}%`
      }

      const previousItem = this.options[index - 1]
      if (previousItem) {
        if (activeItem.ratioX >= 0) {
          previousItem.ratioX = activeItem.ratioX - 100
        } else {
          previousItem.ratioX = -100
        }
        previousItem.itemStyle.transform = `translate(${previousItem.ratioX}%)`
        // previousItem.itemStyle.left = `${previousItem.ratioX}%`
      }

      this.preClientX = touch.clientX
    },
    onTouchEnd (e) {
      e.preventDefault()
      this.isTouching = false

      const index = this.activeIndex
      const activeItem = this.options[index]
      // <-20% 或者 >20% 则认为进行切换
      if (activeItem.ratioX < -20) {
        // 下一页活动
        this.slideChange(1)
      } else if (activeItem.ratioX > 20) {
        // 上一页活动
        this.slideChange(-1)
      } else {
        // 当前页活动
        this.slideChange()
      }
    },
    slideChange (unit = 0) {
      const index = this.activeIndex
      const activeItem = this.options[index]
      const previousItem = this.options[index - 1]
      const nextItem = this.options[index + 1]

      if (unit > 0) {
        if (nextItem) {
          activeItem.ratioX = -100
          this.activeIndex++
          nextItem.ratioX = 0
          nextItem.itemStyle.transform = `translate(${nextItem.ratioX}%)`
          // nextItem.itemStyle.left = `${nextItem.ratioX}%`
        } else {
          activeItem.ratioX = 0
        }
      } else if (unit < 0) {
        if (previousItem) {
          activeItem.ratioX = 100
          this.activeIndex--
          previousItem.ratioX = 0
          previousItem.itemStyle.transform = `translate(${previousItem.ratioX}%)`
          // previousItem.itemStyle.left = `${previousItem.ratioX}%`
        } else {
          activeItem.ratioX = 0
        }
      } else {
        activeItem.ratioX = 0
        if (previousItem) {
          previousItem.ratioX = -100
          previousItem.itemStyle.transform = `translate(${previousItem.ratioX}%)`
          // previousItem.itemStyle.left = `${previousItem.ratioX}%`
        }
        if (nextItem) {
          nextItem.ratioX = 100
          nextItem.itemStyle.transform = `translate(${nextItem.ratioX}%)`
          // nextItem.itemStyle.left = `${nextItem.ratioX}%`
        }
      }

      activeItem.itemStyle.transform = `translate(${activeItem.ratioX}%)`
      // activeItem.itemStyle.left = `${activeItem.ratioX}%`
      this.activeId = this.options[this.activeIndex].id
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

<style>
* {
  margin: 0;
  padding: 0;
}
html {
  font-size: 12px;
}
html,
body {
  height: 100%;
}
</style>
