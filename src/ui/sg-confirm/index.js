import Vue from 'vue'
import SgConfirm from './sg-confirm'

let _sgInstance

Vue.prototype.$confirm = function (options = {}) {
  let confirm = _sgInstance
  if (!confirm) {
    const Func = Vue.component(SgConfirm.name)
    confirm = new Func().$mount()
    document.body.append(confirm.$el)
    _sgInstance = confirm
  }
  if (confirm.visible) {
    return
  }
  confirm.show(options)
}
Vue.prototype.$confirm.hide = function () {
  _sgInstance.hide()
}

export default {
  install: function () {
    Vue.component(SgConfirm.name, SgConfirm)
  }
}
