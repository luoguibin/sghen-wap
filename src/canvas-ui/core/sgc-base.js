export class SgcBase {
  position = 'static'
  x = 0
  y = 0
  measureX = 0
  measureY = 0
  width= 0
  height= 0
  measureWidth = 0
  measureHeight = 0

  fontFamily = 'sans-serif'
  lineHeight = '20px'
  backgroundColor = '#148acf'

  constructor (sgc) {
    this.sgc = sgc
  }

  layout () {}

  /**
   * 测量
   * @param {CanvasRenderingContext2D} ctx
   */
  measure (ctx) {}

  /**
   * 测量
   * @param {CanvasRenderingContext2D} ctx
   */
  draw (ctx) {}
}
