import { createFilter } from 'rollup-pluginutils'

const { EOL } = require('os')
const pathLib = require('path')

export default function myPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'add-filename',

    transform(code, id) {
      if (!filter(id)) return
      const fancySeparator = `---------`
      const filename = pathLib.basename(id)
      const header = `/* ${fancySeparator}${EOL} * ${filename}${EOL} * ${fancySeparator} */${EOL}`
      if (filename === 'index.js') {
        return
      }
      // eslint-disable-next-line consistent-return
      return {
        code: `${header}${code}`,
      }
    },
  }
}
