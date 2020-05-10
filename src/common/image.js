/**
 *
 * @param {*} src
 * @param {*} maxSize
 */
export const resizeImage = function (src, type, maxSize = 800 * 600) {
  return new Promise(function (resolve, reject) {
    const image = new Image()
    image.onload = function () {
      const max = image.width * image.height
      const ratio = Math.sqrt(maxSize / max)
      const newWidth = ratio > 1 ? Math.floor(image.width * ratio) : image.width
      const newHeight = ratio > 1 ? Math.floor(image.height * ratio) : image.height
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
      resolve(canvas.toDataURL('image/' + type, 1.0))
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
