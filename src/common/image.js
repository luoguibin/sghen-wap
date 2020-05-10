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
      if (max <= maxSize) {
        resolve(src)
        return
      }
      const ratio = Math.sqrt(maxSize / max)
      const newWidth = Math.floor(image.width * ratio)
      const newHeight = Math.floor(image.height * ratio)
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

export const base64ToBlob = function (base64Data) {
  const arr = base64Data.split(',')
  const fileType = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let l = bstr.length
  const u8Arr = new Uint8Array(l)

  while (l--) {
    u8Arr[l] = bstr.charCodeAt(l)
  }
  return new Blob([u8Arr], {
    type: fileType
  })
}

export const blobToFile = function (newBlob, fileName) {
  newBlob.lastModifiedDate = new Date()
  newBlob.name = fileName
  return newBlob
}
