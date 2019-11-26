import path from 'path'
import autoprefixer from 'autoprefixer'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'

const isProduction = process.env.NODE_ENV === 'production'

const config = {
  mode: isProduction ? 'production' as const : 'development' as const,
  entry: { index: 'index.js' },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'index.js',
    library: 'MDX',
    libraryTarget: 'umd' as const,
    globalObject: 'this'
  },
  resolve: {
    alias: {
      src: path.join(__dirname, './src'),
      business: path.join(__dirname, './src/business')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: [path.join(__dirname, '..', 'node_modules'), 'node_modules']
  },
  resolveLoader: {
    modules: ['node_modules', path.join(__dirname, 'node_modules'), path.join(__dirname, '..', 'node_modules')]
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
        }
      }
      ]
    }, {
      test: /\.tsx?$/,
      exclude: path.resolve(__dirname, 'node_modules'),
      use: [
        { loader: 'babel-loader' },
        { loader: 'awesome-typescript-loader' }
      ]
    }, {
      test: /\.(js|jsx)$/,
      loader: 'source-map-loader'
    }, {
      test: /\.(map)$/,
      loader: 'ignore-map-loader'
    }, {
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
        }
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
      }, {
        loader: 'less-loader',
        options: {
          sourceMap: !isProduction
        }
      }]
    }, {
      test: /\.css$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: !isProduction
        }
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
      ignoreOrder: false // Enable to remove warnings about conflicting order
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
  devtool: isProduction ? 'source-map' as const : 'eval-source-map' as const
}

export default config
