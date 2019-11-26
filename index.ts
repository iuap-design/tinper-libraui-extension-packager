import webpack from 'webpack'
import baseConfig from './webpack.config'
import path from 'path'
import fs from 'fs'

interface PackagerOptions {
  command: 'build' | 'debug'
  directory: string
}

interface Manifest {
  name: string
  id: string
  description: string
  index: string
}

function getManifest (dir: string): Manifest | undefined {
  const filepath = path.join(dir, 'manifest.json')
  try {
    const manifest = fs.readFileSync(filepath, 'utf-8')
    return JSON.parse(manifest) as Manifest
  } catch (error) {
    console.error(`Read file ${filepath} failed`)
    console.error(error)
  }
}

const packager = (options: PackagerOptions): void => {
  const manifest = getManifest(options.directory)
  if (!manifest) {
    process.exit(1)
  } else {
    (baseConfig.entry as webpack.Entry).index = manifest.index
  }
  const instance = webpack(baseConfig)
  if (options.command === 'build') {
    instance.run((err, stats) => {
      if (err instanceof Error) {
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
      if (!(err instanceof Error) && !stats.hasErrors() && !stats.hasWarnings()) {
        console.log('success!')
      }
    })
  } else {
    instance.watch({}, () => { })
  }
}

export default packager
