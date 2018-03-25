import webpack from 'webpack'
import HtmlWebPackPlugin from 'html-webpack-plugin'
import fs from 'fs'

const env = process.env.NODE_ENV || 'development'

const babelConf = JSON.parse(fs.readFileSync('.babelrc'))

export default {
  mode: env,
  target: 'web',
  entry: {
    style: './src/style.js',
    app: './src/main.js'
  },
  output: {
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    rules: [{
        test: /\.jsx?$/,
        include: `${__dirname}/src`,
        loader: 'babel-loader',
        query: babelConf
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader'
      },
      {
        test: /\.css$/,
        use: [{
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'font-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `"${env}"`
    }),
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html'
    })
  ]
}
