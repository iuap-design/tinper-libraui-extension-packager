import webpack from 'webpack'
import getConfig, { WebpackConfigOptions } from './webpack.config'
import path from 'path'
import fs from 'fs'
import { Manifest } from '@libraui/extension'

interface PackagerOptions {
  command: 'build' | 'debug'
  directory: string
  outputDir: string
}

interface ManifestFile {
  id: string
  version: string
  name: string
  description: string
  index: string // 入口文件
  lessVars?: AnyObject<string> // less变量
}

function getManifestFile (dir: string): ManifestFile | undefined {
  const filepath = path.join(dir, 'manifest.json')
  try {
    const manifestFileContent = fs.readFileSync(filepath, 'utf-8')

    // 加载 manifest.json 文件的内容
    const manifest: ManifestFile = JSON.parse(manifestFileContent)
    manifest.lessVars = manifest.lessVars || {}

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
    const webpackOptions: WebpackConfigOptions = {
      outputPath: path.resolve(options.outputDir || path.join(options.directory, 'dist')),
      indexPath: manifestFile.index,
      outputFilename: 'index.js',
      lessVars: manifestFile.lessVars
    }
    const webpackConfig = getConfig(webpackOptions)
    const manifestOutputPath = path.join(webpackOptions.outputPath, 'manifest.json')
    const instance = webpack(webpackConfig)
    if (options.command === 'build') {
      instance.run((err, stats) => {
        console.log(stats.toString({ colors: true }))
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
          const indexFilePath = path.join(webpackOptions.outputPath, webpackOptions.outputFilename)
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
                // throw new Error(`${componentName} is not a Class`)
                console.warn(`${componentName} is not a Class`)
                continue
              }
              const componentManifest = CLS.manifest || (new CLS()).manifest
              manifest.components.push(componentManifest)
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
