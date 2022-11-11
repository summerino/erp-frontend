module.exports = {
  // https://cli.vuejs.org/config/#productionsourcemap
  productionSourceMap: false,

  // https://cli.vuejs.org/config/#css-extract
  css: {
    extract: { ignoreOrder: true },
    loaderOptions: {
      sass: {
        additionalData: '@import \'~@/assets/scss/vuetify/variables\''
      },
      scss: {
        additionalData: '@import \'~@/assets/scss/vuetify/variables\';'
      }
    }
  },

  // https://cli.vuejs.org/config/#configurewebpack
  configureWebpack: {
    output: {
      chunkFilename: 'js/[name].[contenthash].js',
      filename: 'js/[name].[contenthash].js'
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        minSize: 100000,
        maxSize: 550000
      }
    }
  },

  chainWebpack: (config) => {
    // Remove the following lines to add Vue Prefetch and Preload on index.html
    // https://cli.vuejs.org/guide/html-and-static-assets.html#disable-index-generation
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')

    config.module
      .rule('cur')
      .test(/\.cur$/)
      .use('url-loader')
      .loader('url-loader')
  },

  // https://cli.vuejs.org/config/#transpiledependencies
  transpileDependencies: [
    'vue-echarts',
    'resize-detector',
    'vuetify'
  ]
}
