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
 * @description 接口地址列表
 */
export const apiURL = {
  // 用户登陆
  login: '/sapi/v1/user/login',
  // 验证码
  smsCode: '/sapi/v1/sms/send',

  // 诗词热门列表
  peotryHot: '/sapi/v1/peotry/query-popular',

  // 诗词词频列表
  peotryHotWord: '/sapi/v1/api/get/peotry/hot-word',
  // 热门诗词选集
  poetrySetPopular: '/sapi/v1/api/get/peotry-set/popular',
  // 年度诗词选集
  peotrySetListYear: '/sapi/v1/api/get/peotry-set/list-year',
  // 根据年度诗词创建数获取诗词作者列表
  peotryUserListYear: '/sapi/v1/api/get/peotry-user/list-year',

  // 评论创建
  commentCreate: '/sapi/v1/comment/create',
  // 评论删除
  commentDelete: '/sapi/v1/comment/delete'
}
