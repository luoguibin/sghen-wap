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
  userInfoList: `${preffix}/v1/api/get/user/list`,
  // 作者诗词总数
  userPoetryCount: `${preffix}/v1/api/get/user/peotry-count`,
  // 作者诗词总数
  userPraiseCount: `${preffix}/v1/api/get/user/peotry-praise-count`,

  // 诗词默认列表
  peotryList: `${preffix}/v1/peotry/query`,
  // 诗词热门列表
  peotryPopular: `${preffix}/v1/api/get/peotry/popular`,
  // 诗词创建
  peotryCreate: `${preffix}/v1/peotry/create`,
  // 诗词更新
  peotryUpdate: `${preffix}/v1/peotry/update`,
  // 诗词删除
  peotryDelete: `${preffix}/v1/peotry/delete`,
  // 诗词图片
  peotryImages: `${preffix}/v1/api/get/peotry/images`,
  // 诗词图片查询
  peotryImageQuery: `${preffix}/v1/api/get/peotry/images-query`,
  // 诗词选集查询
  peotrySetQuery: `${preffix}/v1/api/get/peotry/set-query`,

  // 选集列表
  peotSets: `${preffix}/v1/peotry-set/query`,
  // 选集创建
  peotSetCreate: `${preffix}/v1/peotry-set/create`,
  // 选集删除
  peotSetDelete: `${preffix}/v1/peotry-set/delete`,

  // 诗词词频列表
  peotryHotWord: `${preffix}/v1/api/get/peotry/hot-word`,
  // 热门诗词选集
  poetrySetPopular: `${preffix}/v1/api/get/peotry-set/popular`,
  // 年度诗词选集
  peotrySetListYear: `${preffix}/v1/api/get/peotry-set/list-year`,
  // 根据年度诗词创建数获取诗词作者列表
  peotryUserListYear: `${preffix}/v1/api/get/peotry-user/list-year`,
  // 书三行选集对应的诗词总数
  peotryCount10001: `${preffix}/v1/api/get/peotry/count-10001`,

  // 评论创建
  commentCreate: `${preffix}/v1/comment/create`,
  // 评论删除
  commentDelete: `${preffix}/v1/comment/delete`,
  // 点赞列表
  commentPraise: `${preffix}/v1/api/get/peotry/praise-comments`,
  // 用户评论列表
  commentWords: `${preffix}/v1/api/get/peotry/word-comments`,
  // 用户是否点赞诗词
  commentPraises: `${preffix}/v1/api/get/peotry/is-praise`
}
