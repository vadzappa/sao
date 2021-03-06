#!/usr/bin/env node
const cac = require('cac').default
const SAOError = require('../lib/SAOError')

const cli = cac()

cli
  .command(
    '*',
    {
      desc: 'Run a generator',
      alias: 'run'
    },
    (input, flags) => {
      const options = Object.assign(
        {
          generator: input[0],
          outDir: input[1] || '.',
          updateCheck: true
        },
        flags
      )

      if (!options.generator) {
        return cli.showHelp()
      }

      return require('../')(options).run()
    }
  )
  .option('npm-client', {
    desc: `Use a specific npm client ('yarn' or 'npm')`,
    type: 'string'
  })
  .option('update', {
    desc: 'Update cached generator',
    type: 'boolean',
    alias: 'u'
  })
  .option('yes', {
    desc: 'Use the default options',
    alias: 'y'
  })

cli.command('set-alias', 'Set an alias for a generator path', input => {
  const store = require('../lib/store')
  const { escapeDots } = require('../lib/utils/common')
  const logger = require('../lib/logger')

  const name = input[0]
  const value = input[1]
  if (!name || !value) {
    throw new SAOError(`Invalid arguments: sao set-alias <alias> <generator>`)
  }

  store.set(`alias.${escapeDots(name)}`, value)
  logger.success(`Added alias '${name}'`)
})

cli.command('get-alias', 'Get the generator for an alias', input => {
  const store = require('../lib/store')
  const { escapeDots } = require('../lib/utils/common')

  console.log(store.get(`alias.${escapeDots(input[0])}`))
})

cli.on('error', error => {
  return require('..').handleError(error)
})

cli.parse()
