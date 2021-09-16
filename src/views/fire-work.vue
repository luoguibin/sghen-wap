<template>
  <div class="firework" @click="onTestOP()">
    <div>{{ opText }}</div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
const RGB_COLORS = ['rgb(222, 35, 25)', 'rgb(50, 232, 40)', 'rgb(33, 50, 212)']
function randomRgbColor () {
  return RGB_COLORS[Math.floor(Math.random() * RGB_COLORS.length)]
  // //随机生成RGB颜色
  // const r = Math.floor(Math.random() * 256);
  // const g = Math.floor(Math.random() * 256);
  // const b = Math.floor(Math.random() * 256);
  // return `rgb(${r},${g},${b})`;
}

function newRadialFire (r = 3, color) {
  const r2 = r * 2
  /** @type HTMLCanvasElement */
  const c = document.createElement('CANVAS')
  c.setAttribute('width', `${r2}px`)
  c.setAttribute('height', `${r2}px`)
  /** @type CanvasRenderingContext2D */
  const ctx = c.getContext('2d')
  const rg = ctx.createRadialGradient(r, r, 0, r, r, r)
  rg.addColorStop(0, color)
  rg.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = rg
  ctx.clearRect(0, 0, r2, r2)
  ctx.beginPath()
  ctx.arc(r, r, r, 0, Math.PI * 2, false)
  ctx.fill()
  return c
}

const OPS = [
  'source-atop',
  'source-in',
  'source-out',
  'source-over',
  'destination-atop',
  'destination-in',
  'destination-out',
  'destination-over',
  'lighter',
  'copy',
  'xor'
]
let op0 = 4
let op1 = 8

export default {
  name: 'FireWork',

  data () {
    return {
      fireworks: [],
      opText: ''
    }
  },

  mounted () {
    window.fireworks = this
    // this.opText = OPS[op0] + "  " + OPS[op1];
    this.initFirework()
  },

  methods: {
    onTestOP () {
      op0++
      if (op0 >= OPS.length) {
        op0 = 0
        op1++
        if (op1 >= OPS.length) {
          op1 = 0
        }
      }
      this.opText = OPS[op0] + '  ' + OPS[op1]
    },
    initFirework () {
      const c = this.$refs.canvas
      const p = c.parentElement
      c.width = p.clientWidth
      c.height = p.clientHeight
      c.setAttribute('width', c.width + 'px')
      c.setAttribute('width', c.height + 'px')

      /** @type CanvasRenderingContext2D */
      const ctx = c.getContext('2d')
      ctx.cw = c.width
      ctx.ch = c.height
      this.ctx = ctx
      this.loopDraw()

      setInterval(() => {
        this.createFireWork()
      }, 1000)
    },

    createFireWork () {
      if (this.fireworks.length > 10) {
        return
      }
      const ctx = this.ctx
      const x = Math.random() * ctx.cw
      const y = Math.random() * ctx.ch

      const fires = []
      const fireCount = 150 + Math.floor(Math.random() * 50)
      const randColor = randomRgbColor()
      const speedSeed = 1.6
      for (let i = 0; i < fireCount; i++) {
        const radians = Math.random() * Math.PI * 2
        const speed = Math.random() * speedSeed - speedSeed / 2
        const vx = Math.cos(radians) * speed
        const vy = Math.sin(radians) * speed
        const type = 'radial'
        const fire = {
          type,
          x,
          y,
          vx,
          vy,
          c: randColor,
          rd: radians
        }

        const fr = Math.floor(Math.random() * 5 + 2)
        fire.img = newRadialFire(fr, randColor)
        fire.r = fr

        fires.push(fire)
      }

      this.fireworks.push({
        x,
        y,
        c: 0, // 用累加次数来表示烟花爆炸范围
        cMax: 40 + Math.floor(Math.random() + 80),
        cMax0: 150 + Math.floor(Math.random() * 100),
        fires
      })
    },

    loopDraw () {
      this.draw()
      this.calculate()
      requestAnimationFrame(this.loopDraw)
    },

    draw () {
      /** @type CanvasRenderingContext2D */
      const ctx = this.ctx
      // ctx.clearRect(0, 0, ctx.cw, ctx.ch);

      this.fireworks.forEach((o) => {
        if (o.c > o.cMax) {
          return
        }

        o.fires.forEach((f) => {
          // ctx.beginPath();
          // ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, false);
          // ctx.closePath();
          ctx.globalAlpha = (o.cMax - o.c) / o.cMax
          ctx.drawImage(f.img, f.x, f.y)

          // const rg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 2);
          // rg.addColorStop(0, f.c);
          // rg.addColorStop(1, "rgba(0, 0, 0, 0)");
          // ctx.fillStyle = rg;
          // ctx.fill();
        })
      })
      ctx.globalAlpha = 1

      // 不断加半透明蒙层，使上一帧的流星变淡
      // ctx.globalCompositeOperation = OPS[op0];
      const rd = Math.random() * 0.02 - 0.01
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 - rd})`
      ctx.fillRect(0, 0, ctx.cw, ctx.ch)
      // ctx.globalCompositeOperation = OPS[op1];
    },

    calculate () {
      const fireworks = this.fireworks

      for (let i = fireworks.length - 1; i >= 0; i--) {
        const o = fireworks[i]
        o.c++
        if (o.c > o.cMax) {
          if (o.c > o.cMax0) {
            fireworks.splice(i, 1)
            this.createFireWork()
          }
          return
        }
        o.fires.forEach((f) => {
          f.x += f.vx
          f.y += f.vy
          f.vy += 0.01
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.firework {
  // position: fixed;
  // top: 0;
  // right: 0;
  // left: 0;
  // z-index: 1;
  width: 100%;
  height: 400px;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
