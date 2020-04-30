import Vue from 'vue'

import SgHeader from './sg-header'

export default {
  install: function () {
    Vue.component(SgHeader.name, SgHeader)
  }
}
