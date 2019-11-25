#!/usr/bin/env node
import packager from './index'
import * as yargs from 'yargs'

function showHelp () {
  console.log(`
  usage: extension-packager [build|debug] <dir>
  `)
}

const argv = yargs.argv
const command = argv._[0]
const directory = argv._[1]

const allowCommands = ['build', 'debug']

if (!command || !directory || !allowCommands.includes(command)) {
  showHelp()
  process.exit(1)
}
