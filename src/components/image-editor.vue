<template>
  <div class="image-editor sg-flex-column">
    <input ref="input" type="file" accept="image/*" @change="handleChange" hidden />
    <div
      class="image-outter sg-flex-one"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div ref="inner" class="image-inner">
        <img v-if="currentSrc" ref="img" :src="currentSrc" :style="imgStyle" @load="handleLoad" />
      </div>
    </div>
    <div class="menus">
      <sg-button type="text" @click="onOpenSelect()">重选</sg-button>
      <sg-button type="text" @click="reset()">重置</sg-button>
      <sg-button type="text" @click="resetCenter()">居中</sg-button>
      <sg-button type="text" @click="resetOrigin()">原始大小</sg-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageEditor',

  props: {
    autoOpen: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      currentSrc: '',

      display: 'none',
      scaleX: 1,
      scaleY: 1,
      transX: 0,
      transY: 0
    }
  },

  computed: {
    imgStyle () {
      return {
        display: this.display,
        'transform-origin': 'left top',
        transform: `translate(${this.transX}px, ${this.transY}px) scale(${this.scaleX}, ${this.scaleY})`
      }
    }
  },

  mounted () {
    window.imageEditor = this
    this.autoOpen && this.onOpenSelect()
  },

  methods: {
    onOpenSelect () {
      this.$refs.input.click()
    },
    handleChange (e) {
      const file = e.target.files[0]
      if (!file) {
        return
      }

      const reader = new FileReader()
      reader.onload = e => {
        this.currentSrc = e.target.result
      }
      reader.readAsDataURL(file)
    },
    handleLoad (e) {
      this.naturalWidth = e.target.naturalWidth
      this.naturalHeight = e.target.naturalHeight

      this.maxScale = 5
      this.minScale = 0.01
      // console.log(`this.maxScale=${this.maxScale}  this.minScale=${this.minScale}`)
      this.reset()
      this.resetCenter()
      this.display = ''
    },
    setScale (scaleX, scaleY) {
      this.scaleX = scaleX
      this.scaleY = scaleY
      this.checkScale()
    },
    addScale (scaleX, scaleY) {
      this.scaleX += scaleX
      this.scaleY += scaleY
      this.checkScale()
    },
    checkScale () {
      this.scaleX = Math.min(this.scaleX, this.maxScale)
      this.scaleX = Math.max(this.scaleX, this.minScale)

      this.scaleY = Math.min(this.scaleY, this.maxScale)
      this.scaleY = Math.max(this.scaleY, this.minScale)
    },
    reset () {
      const inner = this.$refs.inner
      const ratio = Math.max(
        this.naturalWidth / inner.clientWidth,
        this.naturalHeight / inner.clientHeight,
        1
      )
      this.setScale(1 / ratio, 1 / ratio)
      this.resetCenter()
    },
    resetOrigin () {
      this.setScale(1, 1)
      this.resetCenter()
    },
    resetCenter () {
      const imgScaleWidth = this.naturalWidth * this.scaleX
      const imgScaleHeight = this.naturalHeight * this.scaleY

      const innerWidth = this.$refs.inner.clientWidth
      const innerHeight = this.$refs.inner.clientHeight

      this.transX = (innerWidth - imgScaleWidth) / 2
      this.transY = (innerHeight - imgScaleHeight) / 2
    },

    handleTouchStart (e) {
      const touch0 = e.touches[0]
      this.previousX0 = touch0.clientX
      this.previousY0 = touch0.clientY

      const touch1 = e.touches[1]
      if (touch1) {
        this.previousDistance = Math.max(
          this.getTouchDistance(touch0, touch1),
          100
        )
        this.touchCount = 2
        this.doubleTouch = true
      } else {
        this.touchCount = 1
      }
      // this.$toast(
      //   `touchCount=${this.touchCount} startDistance=${this.startDistance}`
      // )
    },
    /**
     * @param {TouchEvent} e
     */
    handleTouchMove (e) {
      e.preventDefault()
      e.stopPropagation()

      const touch0 = e.touches[0]
      if (this.doubleTouch) {
        const distance = this.getTouchDistance(touch0, e.touches[1])
        const distanceVal = distance - this.previousDistance
        const ratio = distanceVal / 200
        this.addScale(ratio, ratio)
        this.previousDistance = distance
      } else {
        this.transX += touch0.clientX - this.previousX0
        this.transY += touch0.clientY - this.previousY0
        this.previousX0 = touch0.clientX
        this.previousY0 = touch0.clientY
      }
    },
    handleTouchEnd (e) {
      this.touchCount--
      if (this.touchCount <= 0) {
        this.doubleTouch = false
        this.touchCount = 0
      }
    },

    getTouchDistance (touch0, touch1) {
      const xVal = Math.pow(touch0.clientX - touch1.clientX, 2)
      const yVal = Math.pow(touch0.clientY - touch1.clientY, 2)
      return Math.sqrt(xVal + yVal)
    },

    /**
     * @param {CanvasRenderingContext2D} ctx0
     */
    getImage (call, ctx0) {
      if (!this.currentSrc) {
        return
      }
      const canvas = document.createElement('CANVAS')

      const inner = this.$refs.inner
      const dw = inner.clientWidth
      const dh = inner.clientHeight
      canvas.setAttribute('width', dw + 'px')
      canvas.setAttribute('height', dh + 'px')

      const ctx = canvas.getContext('2d')
      ctx.translate(this.transX, this.transY)
      ctx.scale(this.scaleX, this.scaleY)
      // , sx, sy, sw, sh, 0, 0, dw, dh
      ctx.drawImage(this.$refs.img, 0, 0)

      call && call(canvas.toDataURL())
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/ui/style/const.scss";

.image-editor {
  height: 100%;
  .image-outter {
    position: relative;
    min-height: 20rem;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    overflow: hidden;
  }
  .image-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 15rem;
    height: 15rem;
    // overflow: hidden;
    box-sizing: border-box;
    transform: translate(-50%, -50%);
    &::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 99;
      border: 2px dashed $color-theme;
    }
  }
  .menus {
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
    text-align: center;
    .sg-button + .sg-button {
      margin-left: 1rem;
    }
  }
}
</style>
