
/**
 * 将数组转为Map
 * @param {Array} data
 * @param {String} key
 * @returns {Map}
 */
export const arrayToMap = function (data = [], key = 'id') {
  const map = {}
  data.forEach(o => {
    map[o[key]] = o
  })
  return map
}

/**
 * 获取缩略图
 * @param {String} v
 */
export const getSmallImage = function (v) {
  if (v.endsWith('.jpg')) {
    v = v.replace(/.jpg$/, '_100.jpg')
  } else if (v.endsWith('.png')) {
    v = v.replace(/.png$/, '_100.png')
  } else if (v.endsWith('.jpeg')) {
    v = v.replace(/.jpeg$/, '_100.jpeg')
  } else {
    v += '_100.jpg'
  }
  return v
}
