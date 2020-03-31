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
  login: '/v1/user/login',
  // 验证码
  smsCode: '/v1/sms/send',
  // 诗词词频列表
  peotryHotWord: '/v1/api/get/peotry/hot-word',
  // 热门诗词选集
  poetrySetPopular: '/v1/api/get/peotry-set/popular',
  // 年度诗词选集
  peotrySetListYear: '/v1/api/get/peotry-set/list-year',
  // 根据年度诗词创建数获取诗词作者列表
  peotryUserListYear: '/v1/api/get/peotry-user/list-year'
}
