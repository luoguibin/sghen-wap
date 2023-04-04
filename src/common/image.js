/**
 * 定义可使用的图片文件后缀
 */
export const IMAGE_SUFFIXS = ['.png', '.jpg', '.jpeg']

/**
 * 获取缩略图
 * @param {String} v
 */
export const getSmallImage = function (v) {
  const suffix = IMAGE_SUFFIXS.find(v_ => v.endsWith(v_))
  if (suffix) {
    v = v.replace(new RegExp(suffix + '$'), '_100' + suffix)
  } else {
    v += '_100.jpg'
  }
  return v
}

/**
 *
 * @param {*} src
 * @param {*} maxSize
 */
export const resizeImage = function (src, maxSize = 800 * 600) {
  return new Promise(function (resolve, reject) {
    const image = new Image()
    image.onload = function () {
      const max = image.width * image.height
      const ratio = Math.sqrt(maxSize / max)
      const newWidth = ratio < 1 ? Math.floor(image.width * ratio) : image.width
      const newHeight = ratio < 1 ? Math.floor(image.height * ratio) : image.height
      //   console.log(maxSize, max, image.width, image.height, newWidth, newHeight)

      const canvas = window._sgGlobal.testCavans || document.createElement('canvas')
      if (!window._sgGlobal.testCavans) {
        window._sgGlobal.testCavans = canvas
      }
      canvas.setAttribute('width', newWidth)
      canvas.setAttribute('height', newHeight)

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, newWidth, newHeight)
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, newWidth, newHeight)
      resolve(canvas.toDataURL())
    }
    image.onerror = function () {
      reject(src)
    }
    image.src = src
  })
}

/**
 * @param {String} base64Data
 * @param {String} fileName
 */
export const base64ToFile = function (base64Data, fileName) {
  const arr = base64Data.split(',')
  const fileType = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  const tempArr = []
  for (let i = 0, len = bstr.length; i < len; i++) {
    tempArr.push(bstr.charCodeAt(i))
  }
  const index = fileName.lastIndexOf('.')
  const name = fileName.substring(0, index)
  return new File([new Uint8Array(tempArr)], name + '.png', {
    type: fileType
  })
}

/**
 * @description 将表情指令代码转化为表情图片地址
 * @param {String} v
 */
export const toEmotionImages = function (v = '') {
  return v.replace(/#EM[0-9]{3}/g, function (a) {
    return `<img src="/napi/public/file/emotions/${a.substr(3, 3)}.gif" />`
  })
}
/**
 * @description 将表情图片地址转化为表情指令代码
 * @param {String} v
 */
export const toEmotionCodes = function (v = '') {
  return v.replace(/<img.*?>/g, function (a) {
    const index = a.length - (a.indexOf('.gif') - 3)
    const code = a.substr(-index, 3)
    return `#EM${code}`
  })
}
