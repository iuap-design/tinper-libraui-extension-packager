#!/usr/bin/env node
import packager from './index'
import * as yargs from 'yargs'
import path from 'path'

function showHelp (): void {
  console.log(`
  usage: extension-packager [build|debug] <dir>
  `)
}

const argv = yargs.argv
const command = argv._[0]
const directory = argv._[1]

const allowCommands = ['build', 'debug']

if (directory === undefined || !allowCommands.includes(command)) {
  showHelp()
  process.exit(1)
}

packager({
  command: command as any,
  directory,
  outputDir: argv.output as string || path.join(directory, 'dist')
})
