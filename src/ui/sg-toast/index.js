import Vue from 'vue'
import SgToast from './sg-toast'

let _sgInstance
const toastFunc = function (msg, options = {}) {
  let toast = _sgInstance
  if (!toast) {
    const Func = Vue.component(SgToast.name)
    toast = new Func().$mount()
    document.body.append(toast.$el)
    _sgInstance = toast
  }
  if (toast.visible) {
    return
  }
  toast.show(msg, options)
  setTimeout(() => {
    toast.hide()
  }, options.duration || 3000)
}

Vue.prototype.$toast = toastFunc
window._sgGlobal.$toast = toastFunc

export default {
  install: function () {
    Vue.component(SgToast.name, SgToast)
  }
}
