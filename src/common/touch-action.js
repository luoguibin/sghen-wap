export class TouchAction {
  previousTouch = null
  moveCount = 0

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
    this.isMatchType = e.target.getAttribute('item-type') === this.itemType
    if (!this.isMatchType || !this.itemType) {
      this.isMatchType = false
      return
    }

    this.previousTouch = e.touches[0]
    this.moveCount = 0
    this.isValid = false
    // this.calls.filter(o => o.key === 'touchstart').forEach(o => {
    //   o.call(e)
    // })
  }

  /**
   * @param {TouchEvent} e
   */
  touchmove (e) {
    if (!this.isMatchType) {
      return
    }

    const touch = e.touches[0]
    const valueX = touch.clientX - this.previousTouch.clientX

    if (this.moveCount === 0) {
      const ratio = Math.abs((touch.clientY - this.previousTouch.clientY) / valueX)
      if (ratio < 0.35) {
        this.isValid = true
        e.stopPropagation()
        this.calls.filter(o => o.key === 'touchstart').forEach(o => {
          o.call(e)
        })
      } else {
        this.isValid = false
      }
    }

    this.moveCount++
    if (!this.isValid) {
      return
    }
    e.stopPropagation()

    this.previousTouch = touch

    this.calls.filter(o => o.key === 'touchmove').forEach(o => {
      o.call(e, valueX)
    })
  }

  touchend (e) {
    if (!this.isValid) {
      return
    }
    this.calls.filter(o => o.key === 'touchend').forEach(o => {
      o.call(e)
    })
  }

  release () {
    this.calls = []
    this.el.removeEventListener('touchstart', this.touchstart)
    this.el.removeEventListener('touchmove', this.touchmove)
    this.el.removeEventListener('touchend', this.touchend)
  }
}
