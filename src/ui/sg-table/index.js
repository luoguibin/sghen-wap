import Vue from 'vue'
import SgTable from './sg-table'

export default {
  install: function () {
    Vue.component(SgTable.name, SgTable)
  }
}
