import Vue from 'vue'

const blurHandler = function (e) {
  const el = e.target
  const parentEl = el.parentElement
  parentEl.classList.remove('sg-focus-within')
  if (el.value) {
    parentEl.classList.add('sg-input-value')
  } else {
    parentEl.classList.remove('sg-input-value')
  }
  el.removeEventListener('blur', blurHandler)
}

const focusHandler = function (e) {
  const parentEl = e.target.parentElement
  parentEl.classList.add('sg-focus-within')
  e.target.addEventListener('blur', blurHandler)
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
