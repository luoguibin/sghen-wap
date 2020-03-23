import { SgcText } from './components/sgc-text'

export class SgcUi {
  children = []

  /**
   * 构造函数
   * @param {HTMLCanvasElement} canvas
   */
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = canvas.clientWidth
    this.height = canvas.clientHeight
    this.init()
    this.test()
    this.measure()
    this.draw()
  }

  test () {
    window.sgcUi = this

    const o0 = new SgcText(this, 'hello world. fjYiQ 你好，世界。')
    o0.setStyle({
      width: '90%'
    })
    this.addChild(o0)

    const o1 = new SgcText(this, 'adflsdflasdjflsdj')
    o1.setStyle({
      position: 'relative',
      backgroundColor: 'gray',
      fontSize: 30,
      x: 5,
      y: 5
    })
    this.addChild(o1)

    this.measure()
    this.layout()
    this.draw()
  }

  init () {
    this._initListeners()
    this.resize()
  }

  _initListeners () {}

  resize () {
    const c = this.canvas
    const p = c.parentElement
    this.width = p.clientWidth
    this.height = p.clientHeight
    c.setAttribute('width', this.width)
    c.setAttribute('height', this.height)
  }

  addChild (o) {
    this.children.push(o)
  }

  layout () {
    const children = this.children
    if (!children.length) {
      return
    }
    children[0].layout()
    for (let i = 1; i < children.length; i++) {
      children[i].layout(children[i - 1])
    }
  }

  measure () {
    this.children.forEach(o => {
      o.measure(this.ctx)
    })
  }

  draw () {
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.children.forEach(o => {
      o.draw(this.ctx)
    })
  }

  release () {}
}
