import Vue from 'vue'
import SgSlider from './sg-slider'

export default {
  install: function () {
    Vue.component(SgSlider.name, SgSlider)
  }
}
