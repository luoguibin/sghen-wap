<template>
  <div class="test iconfont">
    <div v-for="(item, index) in items" :key="index" class="item" v-html="item.value"></div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: 'Test',

  data () {
    return {
      items: [
        { name: 'history', value: '&#xe69d;' },
        { name: 'nickname', value: '&#xe6a2;' },
        { name: 'edit', value: '&#xe69c;' },
        { name: 'message', value: '&#xe6df;' },
        { name: 'mark', value: '&#xe6ec;' },
        { name: 'delete', value: '&#xe699;' },
        { name: 'check more', value: '&#xe6db;' },
        { name: 'increase', value: '&#xe6a0;' },
        { name: 'like', value: '&#xe6eb;' },
        { name: 'top', value: '&#xe6a1;' },
        { name: 'search', value: '&#xe6e1;' },
        { name: 'setting', value: '&#xe6f0;' },
        { name: 'down', value: '&#xe69b;' },
        { name: 'close', value: '&#xe69e;' }
      ]
    }
  },

  mounted () {
    window.test = this
    document.fonts.ready.then(() => {
      const ctx = this.$refs.canvas.getContext('2d')
      this.ctx = ctx
      this.draw()
    })
    // this.init()
  },
  methods: {
    init () {
      const fontFace = this.getFontFace('iconfont')
      if (!fontFace) {
        console.log('no iconfont font-family')
        setTimeout(() => {
          this.init()
        }, 300)
        return
      }
      fontFace.loaded.then(() => {
        const ctx = this.$refs.canvas.getContext('2d')
        this.ctx = ctx
        this.draw()
      })
    },

    getFontFace (name) {
      const values = document.fonts.values()
      let item = values.next()
      while (!item.done) {
        let fontFace = item.value
        if (fontFace.family === name) {
          return fontFace
        }
        item = values.next()
      }
      return null
    },

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    draw (ctx) {
      if (!ctx) {
        ctx = this.ctx
      }

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      ctx.fillStyle = '#148acf'
      ctx.font = '30px iconfont'
      // const eg = '&#xe69d;'
      // const iconText = eval('("\\ue69d")') // way 1
      // const iconText = unescape('%ue69d') // way 2
      let x = 50
      let y = 30
      this.items.forEach((o) => {
        const icon = unescape(`%u${o.value.substring(3, o.value.length - 1)}`)
        ctx.fillText(icon, x, y)
        x += 50
        if (x > ctx.canvas.width - 50) {
          x = 50
          y += 50
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.test {
  position: relative;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;

  .item {
    display: inline-block;
    text-align: center;
    font-size: 2rem;
    transition: transform 200ms;
    &:hover,
    &:active {
      transform: scale(1.2);
      transform-origin: center center;
    }
    &:active {
      color: #148acf;
    }
  }

  canvas {
    border: 1px solid #ddd;
  }
}
</style>

<style lang="scss">
@font-face {
  font-family: "iconfont"; /* project id 1730652 */
  src: url("//at.alicdn.com/t/font_1730652_fd9wta2l0hb.eot");
  src: url("//at.alicdn.com/t/font_1730652_fd9wta2l0hb.eot?#iefix")
      format("embedded-opentype"),
    url("//at.alicdn.com/t/font_1730652_fd9wta2l0hb.woff2") format("woff2"),
    url("//at.alicdn.com/t/font_1730652_fd9wta2l0hb.woff") format("woff"),
    url("//at.alicdn.com/t/font_1730652_fd9wta2l0hb.ttf") format("truetype"),
    url("//at.alicdn.com/t/font_1730652_fd9wta2l0hb.svg#iconfont") format("svg");
}
.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}

html,
body {
  overflow: hidden;
}
body {
  margin: 0;
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
