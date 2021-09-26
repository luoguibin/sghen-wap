import request from './http'

/**
 * @description 通用get请求
 * @param {String} url
 * @param {Object} params
 */
export const apiGetData = (url, params) =>
  request({
    url,
    method: 'get',
    params
  })

/**
 * @description 通用post请求
 * @param {String} url
 * @param {Object} params
 */
export const apiPostData = (url, data) =>
  request({
    url,
    method: 'post',
    data
  })

/**
 * @description 通用上传请求
 * @param {String} url
 * @param {Object} params
 */
export const apiPostUpload = (url, data, params, call) =>
  request({
    url,
    method: 'post',
    params,
    data,
    timeout: 60 * 1000,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => {
      call && call(e)
    }
  })

const preffix = '/sapi'
const nodePreffix = '/napi'

/**
 * @description 接口地址列表
 */
export const apiURL = {
  // 用户登陆
  login: `${preffix}/v1/user/login`,
  userCreate: `${preffix}/v1/user/create`,
  userUpdate: `${preffix}/v1/user/update`,
  // 校验码
  captcha: `${preffix}/v1/sms/captcha`,
  // 验证码
  smsCode: `${preffix}/v1/sms/send`,
  // 上传
  upload: `${preffix}/v1/upload`,

  // 获取作者基本信息
  userInfoList2: `${nodePreffix}/dynamic-api/v2/user/info/list`,
  // 作者诗词总数
  userPoetryCount: `${nodePreffix}/dynamic-api/v2/user/poetry/count`,
  // 作者诗词被赞总数
  userPraiseCount: `${nodePreffix}/dynamic-api/v2/auth/user/poetry/praise-census`,
  // 用户所有诗词的已统计获赞数
  userRecentPraiseCount: `${nodePreffix}/dynamic-api/v2/user/poetry/recent-praise-census`,

  // 诗词默认列表
  poetryList: `${preffix}/v1/poetry/query`,
  // 诗词热门列表
  poetryPopular: `${nodePreffix}/dynamic-api/v2/poetry/popular`,

  // 诗词创建
  poetryCreate: `${preffix}/v1/poetry/create`,
  // 诗词更新
  poetryUpdate: `${preffix}/v1/poetry/update`,
  // 诗词删除
  poetryDelete: `${preffix}/v1/poetry/delete`,
  // 诗词图片列表
  poetryImageList: `${nodePreffix}/dynamic-api/poetry-image/list`,

  // 选集列表
  poetSets: `${nodePreffix}/dynamic-api/v2/user/poetry-set/list`,
  // 选集创建
  poetSetCreate: `${nodePreffix}/dynamic-api/v2/poetry-set/create`,
  // 选集删除
  poetSetDelete: `${nodePreffix}/dynamic-api/v2/poetry-set/delete`,

  // 诗词词频列表
  poetryHotWord: `${nodePreffix}/dynamic-api/poetry/hot-word`,
  // 热门诗词选集
  poetrySetPopular: `${nodePreffix}/dynamic-api/v2/poetry-set/popular`,
  // 年度诗词选集
  poetrySetListYear: `${nodePreffix}/dynamic-api/v2/poetry-set/year-popular`,
  // 根据年度诗词创建数获取诗词作者列表
  poetryUserListYear: `${nodePreffix}/dynamic-api/v2/user/poetry/year-create`,

  // 评论创建
  commentCreate: `${nodePreffix}/dynamic-api/v2/poetry-comment/create`,
  // 评论删除
  commentDelete: `${nodePreffix}/dynamic-api/v2/poetry-comment/delete`,
  // 分页获取一诗词评论列表
  commentList: `${nodePreffix}/dynamic-api/v2/poetry-comment/list`,
  // 评论详情
  commentDetail: `${nodePreffix}/dynamic-api/v2/poetry-comment/detail`,

  // 点赞创建
  praiseCreate: `${nodePreffix}/dynamic-api/v2/poetry-praise/create`,
  // 点赞列表
  praiseList: `${nodePreffix}/dynamic-api/v2/poetry-praise/list`,
  // 点赞删除
  praiseDelete: `${nodePreffix}/dynamic-api/v2/poetry-praise/delete`,
  // 用户是否点赞诗词
  praiseCheck: `${nodePreffix}/dynamic-api/v2/auth/poetry-praise/checked`,

  // 获取系统消息
  sysMsg: `${nodePreffix}/dynamic-api/v2/auth/user/sys-msg/list`,
  // 读系统消息
  readSysMsg: `${nodePreffix}/dynamic-api/v2/sys-msg/read`,

  // 简历API
  resumeCreate: `${preffix}/v1/auth/resume/create`,
  resumeDetail: `${preffix}/v1/auth/resume/detail`,
  resumeUpdate: `${preffix}/v1/auth/resume/update`,
  resumeDelete: `${preffix}/v1/auth/resume/delete`,

  // 分享链接
  shareCreate: `${nodePreffix}/auth/share/create`,
  shareDetail: `${nodePreffix}/share/detail`,

  // 微服务
  servicesUrl: `/napi/services`
}
