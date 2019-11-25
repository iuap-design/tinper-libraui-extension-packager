import webpack from 'webpack'
import baseConfig from './webpack.config'

interface PackagerOptions {
  command: 'build' | 'debug'
  directory: string
}
const packager = (options: PackagerOptions) => {
  // TODO: implement this function
  const instance = webpack(baseConfig)
  if (options.command === 'build') {
    instance.run(()=> {})
  } else {
    instance.watch({}, () => {})
  }
}

export default packager
