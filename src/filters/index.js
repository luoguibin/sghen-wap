import Vue from 'vue'
import { defaultImgSrc } from '@/common/const'

const numFormat = function (num, n) {
  return Array(n > num ? (n - ('' + num).length + 1) : 0).join(0) + num
}

const getDateValueMap = function (d) {
  return {
    year: d.getFullYear(),
    month: numFormat(d.getMonth() + 1, 2),
    date: numFormat(d.getDate(), 2),
    hour: numFormat(d.getHours(), 2),
    minute: numFormat(d.getMinutes(), 2),
    second: numFormat(d.getSeconds(), 2)
  }
}

export const timeFilter = function (s) {
  const d = new Date(s)
  const n = new Date()
  const dMap = getDateValueMap(d)
  const nMap = getDateValueMap(n)

  const time0 = new Date(`${nMap.year}-${nMap.month}-${nMap.date}`).getTime()
  const timeVal = time0 - d.getTime()
  let output = ''
  if (timeVal >= 0) {
    // 非当天时间
    const day = Math.floor(timeVal / (24 * 60 * 60 * 1000))
    if (day < 1) {
      output = `昨天 ${dMap.hour}:${dMap.minute}`
    } else if (day < 2) {
      output = `前天 ${dMap.hour}:${dMap.minute}`
    } else if (day < 7) {
      output = `${day}天前`
    } else {
      output = `${dMap.year}-${dMap.month}-${dMap.date} ${dMap.hour}:${dMap.minute}`
    }
  } else {
    // 当天时间内
    const seconds = (n.getTime() - d.getTime()) / 1000
    if (seconds < 60) {
      output = '刚刚'
    } else if (seconds < 60 * 60) {
      output = `${Math.floor(seconds / 60)}分钟前`
    } else if (seconds <= 3 * 60 * 60 * 1000) {
      output = `${Math.floor(seconds / 60 / 60)}小时前`
    } else {
      output = `今天 ${dMap.hour}:${dMap.minute}`
    }
  }

  return output
}

export const imgSrcFilter = function (v) {
  if (!v) {
    return defaultImgSrc
  }
  let path
  if (v.indexOf('.') === 0) {
    if (v.indexOf('./file') === 0) {
      path = '/sapi' + v.substr(1)
    } else {
      path = '/sapi/file/peotry/img' + v.substr(1)
    }
  } else {
    path = '/sapi/file/peotry/img/' + v
  }
  return path
}

export const numFilter = function (v) {
  if (v < 0) {
    return '?'
  }
  if (v && (v + '').length > 4) {
    return v.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')
  }
  return v || 0
}

Vue.filter('timeFilter', timeFilter)
Vue.filter('imgSrcFilter', imgSrcFilter)
Vue.filter('numFilter', numFilter)
