<template>
  <div class="sg-slider">
    <div
      ref="wrapper"
      class="wrapper"
      :style="wrapperStyle"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @click="$emit('click', $event)"
    >
      <div
        v-for="item in options"
        :key="item.id"
        class="card-item-wrapper"
        :style="item.style"
        :item-type="itemType"
      >
        <div
          :class="{'card-item': true, 'card-item__active': item.id === activeId}"
          :style="item.itemStyle"
        >
          <slot :name="item.slot"></slot>
        </div>
      </div>
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
            }
          },
          {
            slot: 'slot-1',
            itemStyle: {
              backgroundColor: 'rgba(123, 12, 234, 0.3)'
            }
          },
          {
            slot: 'slot-2',
            itemStyle: {
              backgroundColor: 'rgba(234, 12, 123, 0.3)'
            }
          },
          {
            slot: 'slot-3',
            itemStyle: {
              backgroundColor: 'rgba(12, 234, 123, 0.3)'
            }
          },
          {
            slot: 'slot-4',
            itemStyle: {
              backgroundColor: 'rgba(123, 234, 12, 0.3)'
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

      transX: 0,
      activeId: 0,
      activeIndex: 0,
      swipeDistance: 100
    }
  },

  computed: {
    wrapperStyle () {
      return {
        width: `${this.options.length * 100}%`,
        transform: `translate(${this.transX}px, 0)`
      }
    }
  },

  created () {
    window.swipeCards = this

    this.options = this.items.map(o => {
      return {
        id: o.slot,
        slot: o.slot,
        itemStyle: {
          ...o.itemStyle,
          filter: 'blur(0px)',
          transform: 'scale(1)'
        },
        style: {
          ...o.style,
          width: 0,
          opacity: 1
        }
      }
    })

    const itemCssWidth = (100 / this.options.length).toFixed(3) + '%'
    this.options.forEach(o => {
      o.style.width = itemCssWidth
    })
    this.activeId = this.options[0].id
  },

  mounted () {
    // this.swipeDistance = this.$el.clientWidth / 2
  },

  methods: {
    onTouchStart (e) {
      if (this.isDown) {
        return
      }
      this.isStart = true
      const touch = e.touches[0]
      this.preClientX = touch.clientX
    },
    onTouchMove (e) {
      const touch = e.touches[0]
      this.addTrans(touch.clientX - this.preClientX)
      this.preClientX = touch.clientX
    },
    onTouchEnd () {
      this.isStart = false
      this.activeIndex = this.getNextIndex()
      this.$emit('change', this.activeIndex)
      this.animeToIndex(this.activeIndex)
    },
    setTrans (v) {
      this.transX = v
      this.addTrans(0)
    },
    addTrans (v) {
      this.transX += v
      if (this.transX > this.swipeDistance) {
        this.transX = this.swipeDistance
      } else {
        const maxTransX =
          this.$el.clientWidth * (this.options.length - 1) + this.swipeDistance
        if (this.transX < -maxTransX) {
          this.transX = -maxTransX
        }
      }
      this.calItem()
    },
    getNextIndex () {
      let nextIndexValue = 0
      // 当前滑动得间距
      const value = this.transX - this.getItemTrans(this.activeIndex)
      const count = 0 // Math.floor(Math.abs(this.transX) / this.$el.clientWidth)
      if (value > this.swipeDistance) {
        nextIndexValue = -(1 + count)
      } else if (value < -this.swipeDistance) {
        nextIndexValue = 1 + count
      }

      let nextIndex = this.activeIndex + nextIndexValue
      if (nextIndex < 0) {
        nextIndex = 0
      } else if (nextIndex >= this.options.length) {
        nextIndex = this.options.length - 1
      }
      return nextIndex
    },
    getItemTrans (index) {
      return -this.$el.clientWidth * index
    },
    calItem () {
      // 0: -101 + -100%*-1 ~  -100 + -100%*0
      // 1: -101 + -100%*0  ~  -100 + -100%*1
      // 2: -101 + -100%*1  ~  -100 + -100%*2
      // 2: -101 + -100%*2  ~  -100 + -100%*3
      const clientWidth = this.$el.clientWidth
      const transX = this.transX
      const firstVisibleIndex = Math.max(Math.floor(-transX / clientWidth), 0)
      const ratio = Math.abs(-transX / clientWidth) % 1

      // console.log(firstVisibleIndex, ratio)
      this.setItemRatio(firstVisibleIndex, ratio)
    },
    animeToIndex (index) {
      const v = this.getItemTrans(index)
      const stepValue = v - this.transX > 0 ? 30 : -30
      const stepCount = Math.floor(
        Math.abs(v - this.transX) / Math.abs(stepValue)
      )

      cancelAnimationFrame(this.frameTimer)
      let stepIndex = 0
      const loop = () => {
        this.addTrans(stepValue)
        stepIndex++
        // console.log(this.transX, stepValue, stepIndex, stepCount)
        if (stepIndex > stepCount) {
          this.setTrans(v)
        } else {
          this.frameTimer = requestAnimationFrame(loop)
          // setTimeout(loop, 100)
        }
      }
      loop()
    },
    setItemRatio (index, ratio) {
      let itemStyle = this.options[index].itemStyle
      itemStyle.transform = `scale(${Math.max(1 - ratio, 0.8)})`
      itemStyle.filter = `blur(${ratio * 30}px)`
      if (index !== 0) {
        itemStyle = this.options[index - 1].itemStyle
        itemStyle.transform = `scale(${Math.max(ratio, 0.8)})`
        itemStyle.filter = `blur(${(1 - ratio) * 30}px)`
      }
      if (index < this.options.length - 1) {
        itemStyle = this.options[index + 1].itemStyle
        itemStyle.transform = `scale(${Math.max(ratio, 0.8)})`
        itemStyle.filter = `blur(${(1 - ratio) * 30}px)`
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sg-slider {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  .wrapper {
    height: 100%;
    white-space: nowrap;
  }
  .card-item-wrapper {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
  .card-item {
    width: 100%;
    height: 100%;
  }
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
