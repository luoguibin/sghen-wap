const SERVICE = require('./service')
const JiuGe = require('./jiuge-peotry')
const Utils = require('./utils')
const Log = require('./log')
const Mock = require('mockjs')

const host = 'www.sghen.cn'
const baseUrl = `https://${host}/sapi/v1/`
const LoginUserMap = {}
const UserPraiseMap = {}
const peotries = []

const RobotStartID = 200100001
const RobotCount = 10000
const RobotEndID = RobotStartID + RobotCount

// 九歌僵尸作者ID范围
const JiugetRobotStartID = RobotStartID
const JiugetRobotEndID = JiugetRobotStartID + 100

const SGHEN = {
  apiRespFunc: function (resp) {
    if (!resp || resp.code !== 1000) {
      return Promise.reject(resp)
    }
    return resp
  },
  get: function (url, params) {
    return SERVICE.get(url, params).then(this.apiRespFunc)
  },
  post: function (url, data, headers, params) {
    return SERVICE.post(url, data, headers, params).then(this.apiRespFunc)
  }
}

function createRobotUser (id) {
  return SGHEN.post(`${baseUrl}/user/create`, {
    id,
    name: Mock.mock('@cname'),
    pw: '123456',
    code: 'test'
  }, {
    token: 'test'
  }, {
    id: 123456
  })
}

function getPeotryComments (typeId, fromId) {
  return SGHEN.get(`${baseUrl}/api/get/peotry/comments`, {
    id: typeId,
    datas: fromId
  })
}

function getPoetriesInfos () {
  return SGHEN.get(`${baseUrl}/api/get/peotry/list-id`)
}

function loginUser (id) {
  Log.push(id, `loginUser() start`)
  return SGHEN.post('https://www.sghen.cn/sapi/v1/user/login', {
    account: id,
    pw: Utils.md5('123456'),
    type: 1
  }).then(resp => {
    const info = resp.data
    LoginUserMap[info.id] = info
    Log.push(id, `loginUser() success`)
    return resp
  })
}

function commentPeotry (peotry, user, toId, content) {
  Log.push(user.account, `commentPeotry() start`)
  return SGHEN.post(`${baseUrl}/comment/create`, {
    type: 1,
    typeId: peotry.id,
    content: content,
    fromId: user.id,
    toId: toId
  }, {
    Authorization: user.token
  }).then(resp => {
    if (toId === -1) {
      UserPraiseMap[peotry.id] = true
    }
    Log.print(user.account, `commentPeotry() success`)
  })
}

function createPeotry (userInfo, setId, title, content) {
  return SGHEN.post(`${baseUrl}/peotry/create`, {
    userId: userInfo.id,
    setId: setId || 10005,
    title: title,
    content: content,
    end: ''
  }, {
    Authorization: userInfo.token
  })
}

const keyWords = '蝉鸣'
const loopOneCreatPeotry = function () {
  const userId = Math.floor(Math.random() * (JiugetRobotEndID - JiugetRobotStartID)) + JiugetRobotEndID
  loginUser(userId).then(resp => {
    JiuGe.createPeotry(keyWords, userId).then(content => {
      Log.push(userId, `JiuGe.createPeotry() content=${content}`)
      createPeotry(resp.data, '', keyWords, content).then(() => {
        Log.print(userId, 'createPoetry() success')
        // setTimeout(() => {
        //   loopOneCreatPeotry()
        // }, 5000)
      })
    }).catch(err => {
      Log.print(userId, err)
      // setTimeout(() => {
      //   loopOneCreatPeotry()
      // }, 5000)
    })
  }).catch(err => {
    Log.print(userId, err)
  })
}

function checkBeforeCommentPeotry (peotry, user, toId = -1, content = 'praise') {
  Log.push(user.account, `checkBeforeCommentPeotry() user.id=${user.id}`)
  if (toId === -1) {
    if (Math.random() < 0.2 && UserPraiseMap[peotry.id]) {
      return
    }
    if (Math.random() < 0) {
      toId = user.id
      content = Math.random() < 0.15 ? Mock.mock('@csentence(1,100)') : Mock.mock('@csentence(1,10)')
    } else {
      Log.push(user.account, `getPeotryComments() peotry.id=${peotry.id} user.id=${user.id}`)
      getPeotryComments(peotry.id, user.id).then(resp => {
        const list = resp.data || []
        const index = list.findIndex(o => o.toId === -1 && o.content === 'praise')
        if (index >= 0) {
          UserPraiseMap[peotry.id] = true
          return
        }
        commentPeotry(peotry, user, toId, content)
      }).catch(err => {
        Log.push(user.account, err)
      })
      return
    }
  } else {
    return
  }
  commentPeotry(peotry, user, toId, content)
}

function autoComments () {
  Log.print(0, 'autoComments()')
  for (let i = 0; i < 10; i++) {
    const peotryIndex = Math.floor(peotries.length * Math.random())
    const peotry = peotries[peotryIndex]
    const userId = RobotStartID + Math.floor(RobotCount * Math.random())
    if (LoginUserMap[userId]) {
      Log.push(userId, `loginUser() aleady login`)
      checkBeforeCommentPeotry(peotry, LoginUserMap[userId])
    } else {
      loginUser(userId).then(resp => {
        checkBeforeCommentPeotry(peotry, resp.data)
      })
    }
  }

  setTimeout(() => {
    autoComments()
  }, 10000)
}

// Log.push(0, 'getPoetriesInfos() start')
// getPoetriesInfos().then(resp => {
//   const len = resp.data.length
//   Log.print(0, 'getPoetriesInfos() success count=' + len)

//   peotries.push(...resp.data.slice(len - 5))
//   // peotries.push(...resp.data)
//   autoComments()
// }).catch(err => {
//   Log.print(0, `getPoetriesInfos() err: ${err}`)
// })

loopOneCreatPeotry()
