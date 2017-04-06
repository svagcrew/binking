const jsonfile = require('jsonfile')
const path = require('path')
const _ = require('underscore')

module.exports = (banks) => {
  banks = _.clone(banks)
  for (const bank of banks) {
    const dest = path.resolve(__dirname, '..', 'banks', `${bank.alias}.json`)
    delete bank.logoPng
    delete bank.logoSvg
    delete bank.alias
    delete bank.country
    jsonfile.writeFileSync(dest, bank, {spaces: 2})
  }
}
