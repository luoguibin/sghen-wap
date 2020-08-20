import Vue from 'vue'
import { sgScroll, sgSticky } from 'sg-scroll'

import './config'
import './style/index.scss'

import SgButton from './sg-button'
import SgForm from './sg-form'
import SgToast from './sg-toast'
import SgConfirm from './sg-confirm'
import SgScroll from './sg-scroll'
import SgDropdown from './sg-dropdown'
import SgTime from './sg-time'
import SgHeader from './sg-header'
import SgSlider from './sg-slider'
import SgTable from './sg-table'

Vue.use(SgButton)
Vue.use(SgForm)
Vue.use(SgToast)
Vue.use(SgConfirm)
Vue.use(SgScroll)
Vue.use(SgDropdown)
Vue.use(SgTime)
Vue.use(SgHeader)
Vue.use(SgSlider)
Vue.use(SgTable)

sgScroll.init()
sgSticky.init()
