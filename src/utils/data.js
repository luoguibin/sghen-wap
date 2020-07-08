
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
