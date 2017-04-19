const path = require('path')
const fs = require('fs-extra')
const pkg = require('../package.json')
const banksWithPrefixes = require('./_read-banks')()
const uglify = require('./_uglify')
const banksAndPrefixes = require('./_get-banks-and-prefixes')(banksWithPrefixes)

function getDistPath (basename) {
  return path.resolve(__dirname, '..', 'dist', basename)
}

function writeFile (dist, content) {
  fs.writeFile(dist, content, (err) => {
    if (err) throw err
  })
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
const srcPath = path.resolve(__dirname, '..', 'src', 'card-info.js')
const srcCode = fs.readFileSync(srcPath, 'utf8')
const banksInjectionCode = `
;(function () {
  var banks = ${JSON.stringify(banksAndPrefixes.banks, null, 2).split('\n').map(line => '  ' + line).join('\n').trim()}
  var prefixes = ${JSON.stringify(banksAndPrefixes.prefixes, null, 2).split('\n').map(line => '  ' + line).join('\n').trim()}
  if (typeof exports !== 'undefined') {
    exports.CardInfo._banks = banks
    exports.CardInfo._prefixes = prefixes
  } else if (typeof window !== 'undefined') {
    window.CardInfo._banks = banks
    window.CardInfo._prefixes = prefixes
  }
}())
`
const destPathWithBanks = getDistPath('card-info.js')
const destPathWithBanksMin = getDistPath('card-info.min.js')
const destPathCore = getDistPath('card-info.core.js')
const destPathCoreMin = getDistPath('card-info.core.min.js')
writeFile(destPathWithBanks, bigBanner + srcCode + banksInjectionCode)
writeFile(destPathWithBanksMin, smallBanner + uglify(srcCode + banksInjectionCode))
writeFile(destPathCore, bigBanner + srcCode)
writeFile(destPathCoreMin, smallBanner + uglify(srcCode))
