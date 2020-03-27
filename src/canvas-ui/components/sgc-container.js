import { SgcBase } from '../core/sgc-base'

export class SgcContainer extends SgcBase {
  children = []

  addChild (o) {
    this.children.push(o)
  }

  measure (ctx) {
    super.measure(ctx)
    // console.log('container::measure', this.name)
    this.children.forEach(o => {
      o.measure(ctx)
    })

    if (this.height === 0) {
      this.measureHeight = this.children.reduce((a, b) => a.measureHeight + b.measureHeight, { measureHeight: 0 })
    }
  }

  layout () {
    super.layout()
    this.layoutChildren()
  }

  layoutChildren () {
    // console.log('layoutChildren', this.name)
    let lineIndex = 0
    let currentLineWidth = 0
    let currentLineHeight = 0
    let currentHeight = 0
    let loopCount = 0

    const children = this.children
    const length = children.length
    for (let i = 0; i < length; i++) {
      loopCount++
      if (loopCount > 10) {
        console.error('强制跳出循环')
        break
      }
      const child = children[i]

      // 虚拟占位宽度，若超过父容器宽度，则认为是100%
      let virtualWidth
      if (child.display === 'block') {
        virtualWidth = this.measureWidth
      } else {
        virtualWidth = Math.min(child.measureWidth, this.measureWidth)
      }

      const testLineWidth = currentLineWidth + virtualWidth
      // console.log('i=' + i, 'lineIndex=' + lineIndex, 'display=' + child.display)
      // console.log('currentLineWidth=' + currentLineWidth, 'currentHeight=' + currentHeight, 'currentLineHeight=' + currentLineHeight)
      // console.log('virtualWidth=' + virtualWidth, 'testLineWidth=' + testLineWidth, 'parentWidth=' + this.measureWidth)
      // console.log('')
      if (testLineWidth <= this.measureWidth) {
        // 刚好占满位置、或能够占据位置
        child.measureX = this.measureX + currentLineWidth
        child.measureY = this.measureY + currentHeight
        child._lineIndexInParent = lineIndex

        currentLineHeight = Math.max(child.measureHeight, currentLineHeight)
        if (testLineWidth === this.measureWidth) {
          // 刚好占满位置，下一个换行
          currentHeight += currentLineHeight
          currentLineWidth = 0
          currentLineHeight = 0
          lineIndex++
        } else {
          currentLineWidth = testLineWidth
        }
      } else {
        // 当前行不能满足占位，换行
        i--
        currentHeight += currentLineHeight
        currentLineWidth = 0
        currentLineHeight = 0
        lineIndex++
      }

      child.layout()
    }
  }

  draw (ctx) {
    super.draw(ctx)
    const x = this.measureX
    const y = this.measureY

    ctx.fillStyle = this.backgroundColor
    ctx.fillRect(x, y, this.measureWidth, this.measureHeight)
    // ctx.fillStyle = this.color
    // ctx.fillText(this.name + ':' + this.display, x + 10, y + 25)
    // ctx.stroke()

    this.children.forEach(o => {
      o.draw(ctx)
    })
  }
}
