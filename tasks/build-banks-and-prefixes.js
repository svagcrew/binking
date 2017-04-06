const fs = require('fs-extra')
const path = require('path')
const uglify = require('../tasks/_uglify')
const banksWithPrefixes = require('../tasks/_read-banks')()
const getBanksAndPrefixes = require('./_get-banks-and-prefixes')

const banksForCountriesWithPrefixes = {}
for (const bank of banksWithPrefixes) {
  if (!banksForCountriesWithPrefixes[bank.country]) banksForCountriesWithPrefixes[bank.country] = []
  banksForCountriesWithPrefixes[bank.country].push(bank)
}

const destDir = path.resolve(__dirname, '..', 'dist', 'banks-and-prefixes')
fs.ensureDirSync(destDir)
for (const [country, banksForCountry] of Object.entries(banksForCountriesWithPrefixes)) {
  const banksAndPrefixesForCountry = getBanksAndPrefixes(banksForCountry)
  const code = `;(function () {
  var banksAndPrefixes = ${JSON.stringify(banksAndPrefixesForCountry, null, 2).split('\n').map(line => '  ' + line).join('\n').trim()}
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = banksAndPrefixes
    }
    exports.banksAndPrefixes = banksAndPrefixes
  } else if ((typeof window !== 'undefined') && (typeof window.CardInfo !== 'undefined')) {
    window.CardInfo.addBanksAndPrefixes(banksAndPrefixes)
  }
}())
`
  fs.writeFile(path.resolve(destDir, `${country}.js`), code, (err) => {
    if (err) throw err
  })
  fs.writeFile(path.resolve(destDir, `${country}.min.js`), uglify(code), (err) => {
    if (err) throw err
  })
}
