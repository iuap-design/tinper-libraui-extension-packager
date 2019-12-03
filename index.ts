import webpack from 'webpack'
import baseConfig from './webpack.config'
import path from 'path'
import fs from 'fs'
import { Manifest } from '@libraui/extension'

interface PackagerOptions {
  command: 'build' | 'debug'
  directory: string
}

interface ManifestFile {
  id: string
  version: string
  name: string
  description: string
  index: string // 入口文件
}

function getManifestFile (dir: string): ManifestFile | undefined {
  const filepath = path.join(dir, 'manifest.json')
  try {
    const manifestFileContent = fs.readFileSync(filepath, 'utf-8')

    // 加载 manifest.json 文件的内容
    const manifest: ManifestFile = JSON.parse(manifestFileContent)

    return manifest
  } catch (error) {
    console.error(`Read file ${filepath} failed`)
    console.error(error)
  }
}

const packager = (options: PackagerOptions): void => {
  const manifestFile = getManifestFile(options.directory)
  if (!manifestFile) {
    process.exit(1)
  } else {
    baseConfig.entry.index = manifestFile.index
    // baseConfig.output.library = `MDF_${manifestFile.id}`
    baseConfig.output.path = path.resolve(path.join(options.directory, 'build'))
    const manifestOutputPath = path.join(baseConfig.output.path, 'manifest.json')
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
          const indexFilePath = path.join(baseConfig.output.path, baseConfig.output.filename)
          try {
            const manifest: Manifest = {
              id: manifestFile.id,
              version: manifestFile.version,
              name: manifestFile.version,
              description: manifestFile.description,
              components: []
            }
            const indexJs = require(indexFilePath) // eslint-disable-line @typescript-eslint/no-var-requires
            const components = Object.keys(indexJs)
            for (const componentName of components) {
              const CLS = indexJs[componentName]
              if (typeof CLS !== 'function') {
                throw new Error(`${componentName} is not a Class`)
              }
              const item = new CLS()
              manifest.components.push(item.manifest)
            }
            fs.writeFileSync(manifestOutputPath, JSON.stringify(manifest, customJsonStringify))
          } catch (error) {
            console.error(`parse index file ${indexFilePath} failed`)
            console.error(error)
            process.exit(1)
          }
          console.log('success!')
        }
      })
    } else {
      instance.watch({}, () => { })
    }
  }
}

export function customJsonStringify (key: any, value: any): string {
  if (typeof value === 'function') {
    return `/Function(${value.toString()})/`
  }
  return value
}

export function customJsonParse (key: any, value: any): any {
  if (typeof value === 'string' &&
      value.startsWith('/Function(') &&
      value.endsWith(')/')) {
    value = value.substring(10, value.length - 2)
    return eval(`(${value})`) // eslint-disable-line no-eval
  }
  return value
}

export default packager
