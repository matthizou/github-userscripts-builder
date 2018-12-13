//import pkg from './package.json'
import addMetaTags from './rollup-plugin-add-metadata-block.js'
import myTransformer from './rollup-plugin-my-transformer.js'

export default [
  {
    input: 'src/index.js',
    output: [{ file: 'dist/userscript_rollup.js', format: 'iife', name: 'userscript' }],
    plugins: [myTransformer(), addMetaTags()],
  },
]
