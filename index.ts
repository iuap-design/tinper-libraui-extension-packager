import webpack from 'webpack'
import baseConfig from './webpack.config'

interface PackagerOptions {
  command: 'build' | 'debug'
  directory: string
}
const packager = (options: PackagerOptions): void => {
  // TODO: implement this function
  const instance = webpack(baseConfig)
  if (options.command === 'build') {
    instance.run((err, stats) => {
      if (err) {
        console.error(err)
      }
      if (stats.hasWarnings()) {
        for (const item of stats.toJson().warnings) {
          console.warn(item)
        }
      }
      if (stats.hasErrors()) {
        for (const item of stats.toJson().errors) {
          console.error(item)
        }
      }
      if (!err && !stats.hasErrors() && !stats.hasWarnings()) {
        console.log('success!')
      }
    })
  } else {
    instance.watch({}, () => { })
  }
}

export default packager
