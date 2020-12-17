// const { VuetifyLoaderPlugin } = require('vuetify-loader')

module.exports = {
  transpileDependencies: ["vuetify"],
  publicPath: process.env.NODE_ENV === 'production'
  ? '/admin/'
  : '/',
  // chainWebpack: config => {
  //   config.plugin('VuetifyLoaderPlugin').tap(args => [{
  //     match (originalTag, { kebabTag, camelTag, path, component }) {
  //       if (kebabTag.startsWith('core-')) {
  //         return [camelTag, `import ${camelTag} from '@/components/core/${camelTag.substring(4)}.vue'`]
  //       }
  //     }
  //   }])
  // }
};
