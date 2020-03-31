export const baseUrl = process.env.NODE_ENV === 'production' ? 'http://sapi.sghen.cn' : 'http://localhost:8085'

/**
 * 诗词图片路径前缀
 */
export const imagePrefixxPath = process.env.NODE_ENV === 'production' ? '/peotry/images/' : 'http://localhost/peotry/images/'
