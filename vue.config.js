module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/bachelor-thesis/' 
    : '/',
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.xml$/i,
          use: 'raw-loader',
        },
      ],
    },
  }
}