import { createFilter } from 'rollup-pluginutils';
const { EOL } = require('os');
const pathLib = require('path');

export default function myPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'add-filename',

    transform(code, id) {
      if (!filter(id)) return;
      const fancySeparator = `---------`;
      const filename = pathLib.basename(id);
      if (filename === 'main.js') {
        console.log(code);
      }
      const header = `/* ${fancySeparator}${EOL} * ${filename}${EOL} * ${fancySeparator} */${EOL}`;

      return {
        code: `${header}${code}`,
      };
    },
  };
}
