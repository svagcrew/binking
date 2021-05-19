const path = require('path')
const fs = require('fs')
const pkg = require('./package.json')
const UglifyJS = require('uglify-js')

const uglify = code => {
  const result = UglifyJS.minify(code)
  if (result.error) {
    throw result.error
  }
  return result.code
}
const getDestPath = basename => {
  return path.resolve(__dirname, 'dist', basename)
}
const bigBanner = `/*
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * ${pkg.repository.url.substring(4)}
 * by ${pkg.author.name} (${pkg.author.url})
 */

`
const smallBanner = `/* ${pkg.name} v${pkg.version} | ${pkg.description} | ${pkg.repository.url.substring(4)} | by ${pkg.author.name} (${pkg.author.url}) */
`
const srcPath = path.resolve(__dirname, 'index.js')
const srcCode = fs.readFileSync(srcPath, 'utf8')
const destPath = getDestPath('binking.js')
const destPathMin = getDestPath('binking.min.js')
fs.writeFileSync(destPath, bigBanner + srcCode)
fs.writeFileSync(destPathMin, smallBanner + uglify(srcCode))
console.info(`Builded
${destPath}
${destPathMin}`)
