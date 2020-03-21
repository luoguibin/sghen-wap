import Vue from 'vue'
import SgToast from './sg-toast'

let _sgToast

Vue.prototype.$toast = function (msg, options = {}) {
  let toast = _sgToast
  if (!toast) {
    const Func = Vue.component(SgToast.name)
    toast = new Func().$mount()
    document.body.append(toast.$el)
    _sgToast = toast
  }
  if (toast.visible) {
    return
  }
  toast.showMsg(msg, options)
  setTimeout(() => {
    toast.hide()
  }, options.duration || 3000)
}

export default {
  install: function () {
    Vue.component(SgToast.name, SgToast)
  }
}
