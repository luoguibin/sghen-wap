const path = require('path')
const argv = require('yargs').argv

module.exports = {
  lintOnSave: true,
  runtimeCompiler: true,

  publicPath: process.env.NODE_ENV === 'production' ? '/poetry/' : './',

  chainWebpack: config => {
    // config
    //   .output
    //   .filename('js/[name].js?[hash]')
    //   .chunkFilename('js/[name].js?[hash]')
    //   .end()

    config.resolve.alias.set(
      'img',
      path.join(__dirname, 'src/assets/img')
    )

    // 忽略的打包文件
    // config.externals({
    //   'element-ui': 'ELEMENT'
    // })

    const plugins = config.plugins
    plugins.delete(`prefetch`)
    plugins.delete(`preload`)

    if (argv.analyzer) {
      config.plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      try {
        const terserOptions = config.optimization.minimizer[0].options.terserOptions
        const compress = terserOptions.compress
        terserOptions.compress = {
          ...compress,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        }
      } catch (e) {
        console.error(e)
      }
    }
  },

  productionSourceMap: false,
  filenameHashing: true,

  css: {
    extract: process.env.NODE_ENV === 'production',
    sourceMap: false
  },

  devServer: {
    port: 8080,
    disableHostCheck: true,
    host: '0.0.0.0',
    open: false,
    // https: false,
    // hotOnly: false,
    proxy: {
      '/napi/': {
        target: 'https://www.sghen.cn',
        ws: false,
        secure: true,
        changeOrigin: true
        // pathRewrite: {
        //   '/napi/': '/'
        // }
      }
    }
  }
}
