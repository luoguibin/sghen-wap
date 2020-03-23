import Vue from 'vue'

const blurHandler = function (e) {
  const el = e.target
  let tempEl = el.parentElement
  while (tempEl) {
    const classList = [...tempEl.classList]
    if (classList.includes('sg-form-item')) {
      tempEl.classList.remove('sg-focus-within')
      if (el.value) {
        tempEl.classList.add('sg-input-value')
      } else {
        tempEl.classList.remove('sg-input-value')
      }
      el.removeEventListener('blur', blurHandler)
      break
    }
    tempEl = tempEl.parentElement
  }
}

const focusHandler = function (e) {
  let tempEl = e.target.parentElement
  while (tempEl) {
    const classList = [...tempEl.classList]
    if (classList.includes('sg-form-item')) {
      tempEl.classList.add('sg-focus-within')
      e.target.addEventListener('blur', blurHandler)
      break
    }
    tempEl = tempEl.parentElement
  }
}

Vue.directive('focus-within', {
  bind: function (el) {
    el.addEventListener('focus', focusHandler)
  },
  inserted: function (el) {
    blurHandler({ target: el })
  },
  update: function () {},
  componentUpdated: function () {},
  unbind: function (el) {
    el.removeEventListener('focus', focusHandler)
  }
})
