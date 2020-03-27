export class SgcBase {
  root = null
  name = ''

  display = 'inline'
  width = 0
  height = 0
  color = 'black'
  lineHeight = 20
  fontSize = 16
  fontFamily = 'sans-serif'
  textOverflow = 'ellipsis'
  textMaxLine = Number.MAX_SAFE_INTEGER
  whiteSpace = 'nowrap'
  backgroundColor = 'transparent'

  measureX = 0
  measureY = 0
  measureWidth = 0
  measureHeight = 0

  constructor (parent) {
    this.parent = parent
    if (parent) {
      this.root = parent.root
      parent.addChild(this)
    }
  }

  setStyle (object) {
    for (const key in object) {
      const v = this[key]
      if (v !== undefined && (typeof v === 'number' || typeof v === 'string')) {
        this[key] = object[key]
      }
    }
  }

  layout () {
    // console.log('base::layout', this.name)
  }

  /**
   * 测量
   * @param {CanvasRenderingContext2D} ctx
   */
  measure (ctx) {
    // console.log('base::measure', this.name)
    if (typeof this.width === 'string') {
      let ratio = parseInt(this.width)
      if (this.width.endsWith('%')) {
        ratio /= 100
      }
      this.measureWidth = ratio * this.parent.measureWidth
    } else {
      if (!this.width && this.display === 'block') {
        this.measureWidth = this.parent.measureWidth
      } else {
        this.measureWidth = this.width
      }
    }
    if (typeof this.height === 'string') {
      let ratio = parseInt(this.height)
      if (this.height.endsWith('%')) {
        ratio /= 100
      }
      this.measureHeight = ratio * this.parent.measureHeight
    } else {
      this.measureHeight = this.height
    }
  }

  /**
   * 测量
   * @param {CanvasRenderingContext2D} ctx
   */
  draw (ctx) {
    // console.log('base draw', this.name)
  }
}
