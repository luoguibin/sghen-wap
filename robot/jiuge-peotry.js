const SERVICE = require('./service')
const Utils = require('./utils')

// const host = 'jiuge.thunlp.cn'
const host = '47.52.252.160'
const baseUrl = `http://${host}`
const baseHeaders = {
  'Remote-Address': `${host}:80`,
  'Referrer-Policy': `no-referrer-when-downgrade`,
  'Content-Type': `application/x-www-form-urlencoded`,
  'Host': `${host}`,
  'HostName': `${host}`,
  'Origin': `${baseUrl}`,
  'Referer': `${baseUrl}/cangtou.html`,
  'User-Agent': `Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36`,
  'X-Requested-With': `XMLHttpRequest`
}

const JiuGe = {
  yans: [5, 7], // 五言、七言
  typeMap: {
    jueju: {
      genre: 1
    },
    fengge: {
      genre: 4,
      userStyles: ['萧瑟凄凉', '忆旧感喟', '孤寂惆怅', '思乡忧老', '渺远孤逸']
    },
    cangtou: {
      genre: 2,
      userStyles: ['悲伤', '较悲伤', '中性', '较喜悦', '喜悦'],
      isInputValid: function (v) {
        return v && v.length > 0 && v.length < 5
      }
    },
    lvshi: {
      genre: 7
    },
    jiju: {
      genre: 5,
      yans: [5],
      isInputValid: function (v) {
        return v && (v.length === 5 || v.length === 7)
      }
    },
    ci: {
      genre: 3,
      yans: [0],
      userStyles: [
        '归字谣', '如梦令', '梧桐影', '渔歌子', '捣练子', '忆江南', '秋风清', '忆王孙', '河满子',
        '思帝乡', '望江怨', '醉吟商', '卜算子', '点绛唇', '乌夜啼', '江亭怨', '踏莎行', '画堂春',
        '浣溪沙', '武陵春', '采桑子', '城头月', '玉楼春', '海棠春', '苏幕遮', '蝶恋花', '江城子',
        '八声甘州', '声声慢', '水龙吟', '满江红', '沁园春'
      ]
    }
  },
  getRandomParams () {
    const types = Object.keys(this.typeMap)
    return this.getTypeParams(Utils.randomItem(types))
  },
  getTypeParams (key = 'jueju') {
    const jiugeType = this.typeMap[key]
    console.log('getTypeParams', jiugeType)
    const params = {
      genre: jiugeType.genre,
      level: 1,
      yan: Utils.randomItem(jiugeType.yans || this.yans),
      userId: Utils.randomString(30),
      isInputValid: jiugeType.isInputValid || function (v) {
        return v && v.length > 0 && v.length < 11
      }
    }
    if (jiugeType.userStyles) {
      params.style = Utils.randomIndex(jiugeType.userStyles)
    }
    return params
  }
}

const EventBus = {
  callMap: {},
  setData: function (id, data) {
    const call = this.callMap[id]
    if (call) {
      call(data)
      delete this.callMap[id]
    }
  },
  setCall: function (id, call) {
    this.callMap[id] = call
  }
}

const getPoem = function (params, loopCount = 0) {
  console.log('getPoem')
  const data = {
    style: params.style || -1,
    genre: params.genre,
    yan: params.yan,
    keywords: JSON.stringify(params.foramtKeywords),
    user_id: params.userId
  }
  SERVICE.post(`${baseUrl}/getPoem`, data, baseHeaders)
    .then(resp => {
      if (resp.code === '0') {
        EventBus.setData(params.userId, resp.data)
      } else if (resp.code === '1') {
        loopCount++
        if (loopCount > 20) {
          return
        }
        setTimeout(() => {
          console.log('getPoem() continue')
          getPoem(params, loopCount)
        }, 2000)
      } else {
        console.log('getPoem', resp)
      }
    }).catch(err => {
      console.log('getPoem err::', err)
    })
}

const sendPoem = function (params) {
  console.log('sendPoem')
  const data = {
    style: params.style || -1,
    genre: params.genre,
    yan: params.yan,
    keywords: JSON.stringify(params.foramtKeywords),
    user_id: params.userId
  }
  SERVICE.post(`${baseUrl}/sendPoem`, data, {
    ...baseHeaders,
    'Accept': `application/json, text/javascript, */*; q=0.01`
  }).then(resp => {
    if (resp.code === '0') {
      getPoem(params)
    } else {
      console.log('sendPoem', resp)
    }
  }).catch(err => {
    console.log('sendPoem err::', err)
  })
}

const sendKeyWord = function (params) {
  console.log('sendKeyWord', params.keywords)
  SERVICE.post(`${baseUrl}/getKeyword`, {
    level: params.level,
    genre: params.genre,
    keywords: params.keywords
  }, {
    ...baseHeaders,
    'Content-Type': `multipart/form-data`
  }).then(resp => {
    if (resp.code === '0') {
      params.foramtKeywords = resp.data
      sendPoem(params)
    } else {
      console.log('sendKeyWord', resp)
    }
  }).catch(err => {
    console.log('sendKeyWord err::', err)
  })
}

const buildPeomText = function (arr) {
  if (arr && arr[0] instanceof Array) {
    let texts = ''
    arr.forEach(arr_ => {
      texts += buildPeomText(arr_) + '\n'
    })
    return texts
  }
  let i = 0
  const len = arr.length
  for (; i < len; i++) {
    if (i % 2 === 0) {
      arr[i] += '，\n'
    } else {
      arr[i] += '。\n'
    }
  }

  if (len > 2 && len % 2 === 1) {
    arr[len - 1] = arr[len - 1].replace('，', '。')
    arr[len - 2] = arr[len - 2].replace('。', '，')
  }
  return arr.join('')
}

const createPeotry = function (keywords, call) {
  console.log(`createPeotry() keywords=${keywords}`)
  if (!keywords) {
    return
  }
  const originParams = JiuGe.getRandomParams()
  // const originParams = JiuGe.getTypeParams('lvshi')
  if (originParams.isInputValid(keywords)) {
    originParams.keywords = keywords
    console.log('userCreatePeotry()', originParams)
    EventBus.setCall(originParams.userId, data => {
      console.log('EventBus::call success:', data)
      call && call(buildPeomText(data.poem))
    })
    sendKeyWord(originParams)
  } else {
    console.log('userCreatePeotry() keywords check is invalid', originParams)
    call && call()
  }
}

exports.createPeotry = createPeotry
