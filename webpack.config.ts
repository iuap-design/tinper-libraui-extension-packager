const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

export default {
  mode: isProduction ? 'production' : 'development',
  entry: { index: 'index.js' },
  output: {
    path: './build',
    filename: 'index.js',
    chunkFilename: 'index.js'
  },
  resolve: {
    alias: {
      src: path.join(__dirname, './src'),
      business: path.join(__dirname, './src/business')
    },
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  externals: ['react'],
  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        query: {
          cacheDirectory: true
        }}
      ],
    },{
      test: /\.tsx?$/,
      exclude: path.resolve(__dirname, 'node_modules'),
      use: [
        {loader: 'babel-loader'},
        {loader: 'awesome-typescript-loader'}
      ]
    },{
      test: /\.(js|jsx)$/,
      loader: 'source-map-loader',
    },{
      test: /\.(map)$/,
      loader: 'ignore-map-loader',
    },{
      test: /\.(jpg|png|gif|ico|svg)$/,
      loader: 'url-loader',
      options: {
        limit: 8192,
        name: 'styles/default/images/[hash:8].[name].[ext]'
      }
    }, {
      test: /\.(woff|eot|ttf)\??.*$/,
      loader: 'url-loader',
      options: {
        name: 'fonts/[name].[md5:hash:hex:7].[ext]'
      }
    }, {
      test: /\.less$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: !isProduction
        },
      }, {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 2,
          sourceMap: !isProduction
        },
      }, {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          sourceMap: !isProduction,
          plugins: [
            autoprefixer()
          ]
        }
      }, {
        loader: 'less-loader',
        options: {
          sourceMap: !isProduction
        }
      }]
    }, {
      test: /\.css$/,
      use: [{
        loader: isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
        options: {
          hmr: !isProduction
        },
      }, {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 2,
          sourceMap: !isProduction
        }
      }, {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          sourceMap: !isProduction,
          plugins: [
            autoprefixer()
          ]
        }
      }]
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'index.css',
      chunkFilename: 'index.css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    })
  ].concat(
    isProduction
      ? [
        new CaseSensitivePathsPlugin(),
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            safe: true,
            mergeLonghand: false,
            discardComments: { removeAll: true }
          },
          canPrint: true
        })
      ]
      : []
  ),
  devtool: isProduction ? 'source-map' : 'eval-source-map'
}
