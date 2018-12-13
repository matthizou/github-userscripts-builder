const pathLib = require('path')
var fs = require('fs')
var { EOL } = require('os')

export default function addMetadataBlock(metadataFileName = 'metadata.json') {
  return {
    name: 'add-metadata-block',

    generateBundle(outputOptions, bundle, isWrite) {
      console.log('***Add meta data*****')
      const bundleNames = Object.keys(bundle)
      bundleNames.forEach(bundleName => {
        const { modules, code: bundleCode } = bundle[bundleName]

        const metadataFilePath = Object.keys(modules)
          // Get folders of of modules used in the bundle
          .map(fullPath => pathLib.dirname(fullPath))
          // Remove dupplicates paths
          .filter((element, index, array) => array.indexOf(element) === index)
          // Adds the metadata file name to the paths
          .map(folderPath => pathLib.join(folderPath, metadataFileName))
          // Test existence
          .find(fullPath => fs.existsSync(fullPath))

        if (!metadataFilePath) {
          throw new Error(
            `No metadata file found. A file named '${metadataFileName}' must be present in the entry point of bundle: ${bundleName}`
          )
        }

        if (metadataFilePath) {
          const metadataText = jsonToMetadataBlock(metadataFilePath)
          const newCode = `${metadataText}${EOL}${bundleCode}`
          const bundleFullPath = pathLib.resolve(outputOptions.file)
          const userscriptFullPath = bundleFullPath.replace(/\.js$/, '.user.js')
          try {
            // Write in file
            console.log('Generating:' + userscriptFullPath)
            fs.writeFileSync(userscriptFullPath, newCode)
            console.log('Success')
          } catch (err) {
            throw new Error(
              `Error while generating userscript: ${pathLib.basename(
                userscriptFullPath
              )}.${EOL}Details: ${err}`
            )
          }
        }

        console.log(metadataFilePath)
        //const txtFile = fs.readFileSync(path, 'utf8');
      })
    },
  }
}

/** Generate a userscript metadata block from a JSON file
 * @param {string} path - The full path to the json file
 * @returns {string}
 */
function jsonToMetadataBlock(path) {
  // Load Json file
  const metadata = require(path)
  const attributes = Object.keys(metadata)
  const spacing = Math.max(...attributes.map(x => x.length)) + 2

  const metadataText = attributes
    .map(attribute => {
      let values = metadata[attribute]
      if (!Array.isArray(values)) {
        values = [values]
      }

      return values
        .map(value => `// @${attribute}${' '.repeat(spacing - attribute.length)}${value}`)
        .join(EOL)
    })
    .join(EOL)

  return `// ==UserScript==${EOL}${metadataText}${EOL}// ==/UserScript==${EOL}`
}
