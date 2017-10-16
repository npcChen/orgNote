const path = require('path');
const webpack = require('webpack');

// webpack.config.js
module.exports = {
  devtool: 'source-map',
  target: 'web',
  entry: path.resolve(__dirname, './index.js'),
  output: {
    path: path.resolve(__dirname),
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  },
  resolve: {
    modules: [
      path.resolve(__dirname, './index.js'),
      './node_modules/',
    ]
  },
  plugins: [
  ]
};

