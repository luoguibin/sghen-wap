import { MD5, enc, mode, pad, AES } from 'crypto-js'
import Base64 from 'crypto-js/enc-base64'

export const baseMd5 = function (v) {
  return Base64.stringify(MD5(v))
}

const cryptConfig = {
  paw: '',
  iv: ''
}
export const init = function () {
  const paw = 'TEST1234TEST1234'
  const iv = 'TEST5678TEST5678'
  // 十六位十六进制数作为密钥
  cryptConfig.paw = enc.Utf8.parse(paw)
  // 十六位十六进制数作为密钥偏移量
  cryptConfig.iv = enc.Utf8.parse(iv)
}

// 加密方法
export const aesEncrypt = function (word) {
  const key = enc.Utf8.parse(cryptConfig.paw)
  const srcs = enc.Utf8.parse(word)
  const encrypted = AES.encrypt(srcs, key, { iv: cryptConfig.iv, mode: mode.ECB, padding: pad.Pkcs7 })
  return encrypted.toString()
}

// 解密方法
export const aesDecrypt = function (word) {
  const key = enc.Utf8.parse(cryptConfig.paw)
  const decrypt = AES.decrypt(word, key, { iv: cryptConfig.iv, mode: mode.ECB, padding: pad.Pkcs7 })
  const bword = enc.Utf8.stringify(decrypt).toString()
  return bword
}
