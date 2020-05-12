<template>
  <div class="rotate-box">
    <div ref="wrapper" class="wrapper" :style="wrapperStyle" :class="{'anime' : canAnime}">
      <div v-for="item in itemStyles" :key="item.id" class="rotate-item" :style="item.style">
        <template v-if="item.slot">
          <slot :name="item.slot"></slot>
        </template>
        <template v-else>{{item.content}}</template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RotateBox',

  props: {
    items: {
      type: Array,
      default () {
        return []
      }
    },
    duration: {
      type: Number,
      default: 5000
    }
  },

  data () {
    return {
      itemStyles: [],
      rotateY: 0,
      canAnime: true,
      wrapperStyle: {
        transform: ''
      }
    }
  },

  mounted () {
    window.rotateBox = this
    this.init()
  },

  methods: {
    init () {
      const len = this.items.length
      if (len < 2) {
        return
      }

      this.itemStyles = this.items.map(o => {
        return {
          id: o.id,
          slot: o.slot,
          content: o.content,
          rotateY: 0,
          translateZ: 0,
          style: {
            ...o.style,
            transform: 'rotateY(0deg)'
          }
        }
      })

      const haflWidth = this.$el.clientWidth / 2
      const deg = 360 / len
      const rad = (Math.PI - (Math.PI * 2) / len) / 2
      const z = Math.tan(rad) * haflWidth
      this.translateZ = z
      this.itemStyles.forEach((o, i) => {
        o.rotateY = deg * i
        o.translateZ = z
      })
      this.setItemsRotateY(0)
      this.setRotateY(0)

      this.stop()
      this.start()
    },

    start (v = 0) {
      this.rotateY = v
      this.timer = setInterval(() => {
        let v = this.rotateY
        v -= 360 / this.itemStyles.length
        if (v <= -360) {
          // 1000ms后等动画完成后进行无缝重置角度
          setTimeout(() => {
            this.canAnime = false
            this.$nextTick(() => {
              this.setRotateY(0)
              this.$nextTick(() => {
                // ??不加这行代码动画直接生效
                void this.$refs.wrapper.clientWidth
                this.canAnime = true
              })
            }, 0)
          }, 1000)
        }
        this.setRotateY(v)
      }, this.duration)
    },
    stop () {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = null
    },

    setItemsRotateY (v) {
      this.itemStyles.forEach((o, i) => {
        o.style.transform = `rotateY(${v + o.rotateY}deg) translateZ(${
          o.translateZ
        }px)`
      })
    },
    setRotateY (v) {
      this.rotateY = v
      this.wrapperStyle.transform = `translateZ(${-this
        .translateZ}px) rotateY(${v}deg)`
    }
  },

  beforeDestroy () {
    this.stop()
  }
}
</script>

<style lang="scss">
.rotate-box {
  height: 15rem;
  perspective-origin: center center;
  perspective: 500px;
  overflow: hidden;
  background-color: rgba(128, 128, 128, 0.3);

  .wrapper {
    position: relative;
    height: 100%;
    transform-style: preserve-3D;
  }
  .anime {
    transition: all 500ms;
  }

  .rotate-item {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
