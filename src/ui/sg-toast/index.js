import Vue from 'vue'
import SgToast from './sg-toast'

let _sgToast

Vue.prototype.$toast = function (msg) {
  let toast = _sgToast
  if (!toast) {
    const Func = Vue.component(SgToast.name)
    toast = new Func().$mount()
    _sgToast = toast
  }
  if (toast.isShowing) {
    return
  }
  document.body.append(toast.$el)
  toast.setMsg(msg)
  toast.isShowing = true
  setTimeout(() => {
    toast.isShowing = false
    document.body.removeChild(toast.$el)
  }, 3000)
}

export default {
  install: function () {
    Vue.component(SgToast.name, SgToast)
  }
}
