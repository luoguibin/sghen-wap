import { SgcBase } from '../core/sgc-base'

export class SgcText extends SgcBase {
  color = 'black'
  fontSize = 16

  constructor (sgc, text) {
    super(sgc)
    this.text = text
  }

  layout (previous) {
    if (previous) {
      this.measureY = previous.measureY + previous.measureHeight
      if (this.position === 'relative') {
        this.measureX = this.x
        this.measureY += this.y
      }
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  measure (ctx) {
    ctx.font = `${this.fontSize}px ${this.fontFamily}`
    const m = ctx.measureText(this.text)
    if (typeof this.width === 'string') {
      let ratio = parseInt(this.width)
      if (this.width.endsWith('%')) {
        ratio /= 100
      }
      this.measureWidth = Math.max(m.width, ratio * this.sgc.width)
    } else {
      this.measureWidth = Math.max(m.width, this.width)
    }
    this.measureHeight = this.fontSize * 1.3
  }

  setStyle (object) {
    for (const key in object) {
      this[key] = object[key]
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw (ctx) {
    ctx.save()
    ctx.translate(this.measureX, this.measureY)

    ctx.fillStyle = this.backgroundColor
    ctx.fillRect(0, 0, this.measureWidth, this.measureHeight)

    ctx.font = `${this.fontSize}px ${this.fontFamily}`
    ctx.fillStyle = this.color
    ctx.fillText(this.text, 0, this.fontSize, this.measureWidth)
    ctx.restore()
  }
}
