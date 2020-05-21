const test = function (num = 100) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      if (num >= 100) {
        resolve({ num })
      } else {
        reject(new Error('num is smaller than 100'))
      }
    }, 1000)
  })
}

const filter = function (data) {
  console.log(data)
  if (data.num !== 100) {
    return Promise.reject(data)
  }
  return data.num
}

test(1).then(filter).then(num => {
  console.log(`num=${num}`)
}).catch(err => {
  console.log(`err`, err)
})
