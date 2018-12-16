// import pkg from './package.json'
import resolve from 'rollup-plugin-node-resolve' // To handle index.js files
import addMetaTags from './rollup-plugin-add-metadata-block'
import addFilename from './rollup-plugin-add-filenames'

export default [
  {
    input: 'src/index.js',
    output: [{ file: 'dist/userscript_rollup.js', format: 'iife', name: 'userscript' }],
    plugins: [resolve(), addFilename(), addMetaTags()],
  },
]
