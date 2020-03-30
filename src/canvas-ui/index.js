import { SgcContainer } from './components/sgc-container'
import { SgcText } from './components/sgc-text'

export class SgcUi extends SgcContainer {
  /**
   * 构造函数
   * @param {HTMLCanvasElement} canvas
   */
  constructor (canvas) {
    super(null)
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.measureWidth = canvas.clientWidth
    this.measureHeight = canvas.clientHeight
    this.root = this

    this.name = 'root'
    this.backgroundColor = 'transparent'

    this.init()
    this.test()
  }

  test () {
    window.sgcUi = this

    const c = new SgcContainer(this)
    c.name = '0'
    c.setStyle({
      display: 'block',
      height: '100%',
      backgroundColor: 'white'
    })

    const c0 = new SgcContainer(c)
    c0.name = '0-0'
    c0.setStyle({
      display: 'inline',
      width: 450,
      height: 60,
      backgroundColor: '#16C6D8'
    })

    const c1 = new SgcContainer(c)
    c1.name = '0-1'
    c1.setStyle({
      display: 'inline',
      width: 180,
      height: 70,
      backgroundColor: '#148ACF'
    })

    const c2 = new SgcContainer(c)
    c2.name = '0-2'
    c2.setStyle({
      display: 'inline',
      width: 300,
      height: 40,
      backgroundColor: 'rgba(207, 20, 138, 0.3)'
    })

    const c3 = new SgcContainer(c)
    c3.name = '0-3'
    c3.setStyle({
      display: 'block',
      width: '60%',
      height: '50%',
      backgroundColor: 'rgba(207, 138, 20, 0.3)'
    })

    const o = new SgcText(c3, `好棒哦！下雪了！是时候堆个雪人了。詹姆斯跑了出去。他弄了一大堆雪。他把一个大雪球放到了最上面来充当头部。他给雪人加了一个围巾和一个帽子，又给雪人添了一个桔子当鼻子。他就加了煤炭来充当眼睛和纽扣。傍晚，詹姆斯打开了门。他看见了什么？雪人在移动！詹姆斯邀请它进来。雪人从来没有去过房间里面。它对猫咪打了个招呼。猫咪玩着纸巾。不久之后，雪人牵着詹姆斯的手出去了。他们一直向上升，一直升到空中！他们在飞翔！多么美妙的夜晚！第二天早上，詹姆斯从床上蹦了起来。他向门口跑去。他想感谢雪人，但是它已经消失了。`)
    o.name = '4'
    o.setStyle({
      width: '100%',
      whiteSpace: 'wrap',
      textMaxLine: 3,
      backgroundColor: 'rgba(0, 0, 0, 0.3)'
    })

    this.measure()
    this.layout()
    this.draw()

    this.ratio = 0
    this.testAnimation()
  }

  testAnimation () {
    if (this.ratio >= 1) {
      this.ratio = 1
      this.drawFrame(this.ratio)
      return
    }
    this.drawFrame(this.ratio)
    this.ratio += 0.02
    requestAnimationFrame(() => {
      this.testAnimation()
    })
  }

  init () {
    this._copyCanvas()
    this._initListeners()
    this.resize()
    this._resizeHandle = e => {
      this.resize()
      this.measure()
      this.layout()
      this.draw()
    }
    window.addEventListener('resize', this._resizeHandle)
  }

  _copyCanvas () {
    this._canvas = this.canvas.cloneNode()
    this._ctx = this._canvas.getContext('2d')
  }

  _initListeners () {}

  resize () {
    const c = this.canvas
    const p = c.parentElement
    this.width = p.clientWidth
    this.height = p.clientHeight
    c.setAttribute('width', this.width)
    c.setAttribute('height', this.height)

    const _c = this._canvas
    _c.setAttribute('width', this.width)
    _c.setAttribute('height', this.height)
  }

  measure () {
    super.measure(this._ctx)
  }

  layout () {
    super.layout()
  }

  draw () {
    const ctx = this._ctx
    super.draw(ctx)
    this.drawFrame()
  }

  drawFrame () {
    const ctx = this.ctx
    ctx.save()
    ctx.clearRect(0, 0, this.width, this.height)
    const ratio = 1 - this.ratio || 0
    const imageData = this._ctx.getImageData(this.width * ratio, 0, this.width, this.height)
    // const data = imageData.data
    // const len = data.length
    // // run slowly
    // for (let i = 0; i < len; i = i + 4) {
    //   data[i] *= ratio
    //   data[i + 1] *= ratio
    //   data[i + 2] *= ratio
    //   data[i + 3] *= ratio
    // }

    ctx.putImageData(imageData, 0, 0)
    ctx.restore()
  }

  release () {
    window.removeEventListener('resize', this._resizeHandle)
  }
}
