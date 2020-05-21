const cacheMap = {}

const push = function (id, msg) {
  id = '' + id
  if (!cacheMap[id]) {
    cacheMap[id] = []
  }
  if (msg && typeof msg !== 'string') {
    msg = JSON.stringify(msg)
  }
  cacheMap[id].push(`${new Date().toISOString()}: ${msg}`)
}

const print = function (id, msg, keep) {
  id = '' + id
  push(id, msg)

  const list = cacheMap[id] || []
  console.log(`${new Date().toISOString()}: Log.id=${id}`)
  console.log(list.join('\n'))
  console.log('')

  if (!keep) {
    delete cacheMap[id]
  }
}

exports.push = push
exports.print = print
