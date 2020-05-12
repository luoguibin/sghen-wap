<template>
  <div class="rotate-box">
    <div ref="wrapper" class="wrapper" :style="wrapperStyle" :class="{'anime' : canAnime}">
      <div
        v-for="item in items"
        :key="item.id"
        class="rotate-item"
        :style="item.style"
      >{{item.name}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RotateBox',

  data () {
    return {
      items: [
        {
          id: 0,
          name: '第一个展示模块',
          rotateY: 0,
          translateZ: 0,
          style: {
            backgroundColor: 'rgba(70, 130, 180, 0.95)',
            transform: 'rotateY(0deg)'
          }
        },
        {
          id: 1,
          name: '第二个展示模块',
          rotateY: 0,
          translateZ: 0,
          style: {
            backgroundColor: 'rgba(180, 129, 70, 0.95)',
            transform: 'rotateY(0deg)'
          }
        },
        {
          id: 2,
          name: '第三个展示模块',
          rotateY: 0,
          translateZ: 0,
          style: {
            backgroundColor: 'rgba(180, 70, 112, 0.95)',
            transform: 'rotateY(0deg)'
          }
        },
        {
          id: 3,
          name: '第四个展示模块',
          rotateY: 0,
          translateZ: 0,
          style: {
            backgroundColor: 'rgba(70, 180, 130, 0.95)',
            transform: 'rotateY(0deg)'
          }
        }
      ],
      rotateY: 0,
      canAnime: true,
      wrapperStyle: {
        transform: ''
      }
    }
  },

  mounted () {
    window.rotateBox = this
    const haflWidth = this.$el.clientWidth / 2
    const v = 360 / this.items.length

    const rad = (Math.PI - (Math.PI * 2) / this.items.length) / 2
    // 当只有一个卡片时，z计算出来为大负数
    const z = Math.max(Math.tan(rad) * haflWidth, 100)
    this.translateZ = z
    this.items.forEach((o, i) => {
      o.rotateY = v * i
      o.translateZ = z
    })
    this.setRotateY(0)
    this.setWrapperRotateY(0)
    this.start()
  },

  methods: {
    start (v = 0) {
      this.rotateY = v
      this.timer = setInterval(() => {
        let v = this.rotateY
        v -= 360 / this.items.length
        if (v <= -360) {
          // 1000ms后等动画完成后进行无缝重置角度
          setTimeout(() => {
            this.canAnime = false
            this.$nextTick(() => {
              this.setWrapperRotateY(0)
              this.$nextTick(() => {
                // ??不加这行代码动画直接生效
                void this.$refs.wrapper.clientWidth
                this.canAnime = true
              })
            }, 0)
          }, 1000)
        }
        this.setWrapperRotateY(v)
      }, 3000)
    },
    setRotateY (v) {
      this.items.forEach((o, i) => {
        o.style.transform = `rotateY(${v + o.rotateY}deg) translateZ(${
          o.translateZ
        }px)`
      })
    },
    setWrapperRotateY (v) {
      this.rotateY = v
      this.wrapperStyle.transform = `translateZ(${-this
        .translateZ}px) rotateY(${v}deg)`
    }
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
    font-size: 1.5rem;
    color: white;
    text-align: center;
    line-height: 6rem;
  }
}
</style>
