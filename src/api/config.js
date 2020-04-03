export const baseUrl = process.env.NODE_ENV === 'development' ? 'http://sapi.sghen.cn' : 'http://localhost:8085'

/**
 * 诗词图片路径前缀
 */
export const imagePrefixPath = process.env.NODE_ENV === 'development' ? 'http://sapi.sghen.cn/peotry/images/' : 'http://localhost/peotry/images/'
