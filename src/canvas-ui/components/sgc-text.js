import { SgcBase } from '../core/sgc-base'

export class SgcText extends SgcBase {
  textLines = []

  constructor (parent, text) {
    super(parent)
    this.text = text
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  measure (ctx) {
    super.measure(ctx)
    ctx.font = `${this.fontSize}px ${this.fontFamily}`
    if (this.measureWidth === 0) {
      const m = ctx.measureText(this.text)
      this.measureWidth = Math.max(m.width, this.measureWidth)
    }
    if (this.measureHeight === 0) {
      const lineHeight = this.lineHeight instanceof String ? parseInt(this.lineHeight) : this.lineHeight
      if (this.whiteSpace === 'wrap') {
        this.measureText(ctx, this.measureWidth, lineHeight, this.textMaxLine)
        this.measureHeight = lineHeight * this.textLines.length
      } else {
        this.measureHeight = lineHeight
      }
    }
  }

  layout () {
    const parent = this.parent
    console.log('text::layout', this)
    this.measureX = parent.measureX
    this.measureY = parent.measureY
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  measureText (ctx, width, lineHeight, textMaxLine = Number.MAX_SAFE_INTEGER) {
    const lines = []
    const arrText = this.text.split('')
    const len = arrText.length

    let line = ''
    let offY = 0

    for (let n = 0; n < len; n++) {
      const testLine = line + arrText[n]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > width && n > 0) {
        lines.push({
          text: line,
          offY
        })
        line = arrText[n]
        offY += lineHeight
      } else {
        line = testLine
      }
    }
    lines.push({
      text: line,
      offY
    })
    if (textMaxLine > 0 && textMaxLine <= lines.length) {
      this.textLines = lines.slice(0, textMaxLine)
      const lastLine = this.textLines[this.textLines.length - 1]
      if (lastLine.length < 5) {
        return
      }
      let endIndex = -1
      while (true) {
        let testLine = lastLine.text.slice(0, endIndex) + '...'
        const metrics = ctx.measureText(testLine)
        if (metrics.width <= width) {
          lastLine.text = testLine
          break
        } else {
          endIndex--
        }
      }
    } else {
      this.textLines = lines
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  draw (ctx) {
    super.draw(ctx)
    const x = this.measureX
    const y = this.measureY
    ctx.fillStyle = this.backgroundColor
    ctx.fillRect(x, y, this.measureWidth, this.measureHeight)

    ctx.font = `${this.fontSize}px ${this.fontFamily}`
    ctx.fillStyle = this.color
    const textStartY = y + this.fontSize
    if (this.whiteSpace === 'wrap') {
      this.textLines.forEach(o => {
        ctx.fillText(o.text, x, textStartY + o.offY)
      })
    } else {
      ctx.fillText(this.text, x, textStartY, this.measureWidth)
    }
  }
}
