import path from 'path'
import autoprefixer from 'autoprefixer'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import TsImportPluginFactory from 'ts-import-plugin'
import { Configuration } from 'webpack'

const isProduction = process.env.NODE_ENV === 'production'

export interface WebpackConfigOptions {
  indexPath: string
  outputPath: string
  outputFilename: string
  lessVars?: AnyObject<string>
}

const getConfig = (config: WebpackConfigOptions): Configuration => ({
  mode: isProduction ? 'production' as const : 'development' as const,
  entry: { index: config.indexPath },
  output: {
    path: config.outputPath,
    filename: config.outputFilename,
    library: '__MDX__',
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
  externals: [
    {
      react: {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react',
        root: 'React'
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom',
        umd: 'react-dom'
      }
    }
  ],
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
        {
          loader: 'awesome-typescript-loader',
          options: {
            silent: true,
            getCustomTransformers: () => ({
              before: [TsImportPluginFactory([
                { libraryName: 'antd', libraryDirectory: 'lib', style: true },
                { libraryName: 'antd-mobile', libraryDirectory: 'lib', style: true }
              ])]
            }),
            compilerOptions: {
              module: 'esnext'
            }
          }
        }
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
        name: 'images/[hash:8].[name].[ext]'
      }
    }, {
      test: /\.(woff|eot|ttf)\??.*$/,
      loader: 'url-loader',
      options: {
        name: 'fonts/[name].[md5:hash:hex:7].[ext]'
      }
    }, {
      test: /\.(css|less)$/,
      include: /node_modules/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          hmr: !isProduction
        }
      }, {
        loader: 'css-loader',
        options: {
          modules: false,
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
          javascriptEnabled: true,
          sourceMap: !isProduction,
          modifyVars: config.lessVars || {}
        }
      }]
    }, {
      test: /\.(css|less)$/,
      exclude: /node_modules/,
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
          javascriptEnabled: true,
          sourceMap: !isProduction,
          modifyVars: config.lessVars || {}
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
})

export default getConfig
