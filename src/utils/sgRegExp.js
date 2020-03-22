/**
 * 判断是否为手机号码
 * @param {String|Number} v
 */
export const sgIsPhone = function (v) {
  return /^([1][3,4,5,6,7,8,9])\d{9}$/.test(v)
}
