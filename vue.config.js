module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/interaktionseditor/'  // Replace with your repo name
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