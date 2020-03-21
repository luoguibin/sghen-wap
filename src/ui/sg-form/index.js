import Vue from 'vue'
import SgForm from './sg-form'

export default {
  install: function () {
    Vue.component(SgForm.name, SgForm)
  }
}
