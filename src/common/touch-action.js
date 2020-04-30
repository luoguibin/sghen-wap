export class TouchAction {
  previousTouch = null

  calls = []

  /**
   * 构造函数
   * @param {HTMLElement} el
   * @param {String} itemType
   */
  constructor (el, itemType) {
    this.el = el
    this.itemType = itemType
    this.init()
  }

  init () {
    this.touchstart = this.touchstart.bind(this)
    this.touchmove = this.touchmove.bind(this)
    this.touchend = this.touchend.bind(this)

    this.el.addEventListener('touchstart', this.touchstart, true)
    this.el.addEventListener('touchmove', this.touchmove, true)
    this.el.addEventListener('touchend', this.touchend)
  }

  addEventListener (key, call) {
    this.calls.push({ key, call })
  }

  removeEventListener (key, call) {
    const index = this.calls.findIndex(o => (o.key === key && o.call === call))
    this.calls.splice(index, 1)
  }

  /**
   * @param {TouchEvent} e
   */
  touchstart (e) {
    if (this.itemType) {
      const itemType = e.target.getAttribute('item-type')
      this.isValid = itemType === this.itemType
    } else {
      this.isValid = true
    }
    this.previousTouch = e.touches[0]
    this.isHorizontal = false
    if (this.isValid) {
      this.calls.filter(o => o.key === 'touchstart').forEach(o => {
        o.call(e)
      })
    }
  }

  /**
   * @param {TouchEvent} e
   */
  touchmove (e) {
    if (!this.isValid) {
      return
    }
    const touch = e.touches[0]
    const valueX = touch.clientX - this.previousTouch.clientX
    if (this.isHorizontal) {
      e.stopPropagation()
    } else {
      const ratio = (touch.clientY - this.previousTouch.clientY) / valueX
      if (ratio > 0.7 || ratio < -0.7) {
        this.isHorizontal = true
        e.stopPropagation()
      }
    }
    this.previousTouch = touch
    this.calls.filter(o => o.key === 'touchmove').forEach(o => {
      o.call(e, valueX)
    })
  }

  touchend (e) {
    if (this.isValid) {
      this.calls.filter(o => o.key === 'touchend').forEach(o => {
        o.call()
      })
    }
    this.isValid = false
  }

  release () {
    this.calls = []
    this.el.removeEventListener('touchstart', this.touchstart)
    this.el.removeEventListener('touchmove', this.touchmove)
    this.el.removeEventListener('touchend', this.touchend)
  }
}
