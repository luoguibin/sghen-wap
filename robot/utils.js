exports.randomString = function (len) {
  len = len || 32
  // 默认去掉容易混淆的字符oOLl,9gq,Vv,Uu,I1
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

const randomIndex = function (arrs = []) {
  return Math.floor(Math.random() * arrs.length)
}
exports.randomIndex = randomIndex

exports.randomItem = function (arrs = []) {
  return arrs[randomIndex(arrs)]
}
