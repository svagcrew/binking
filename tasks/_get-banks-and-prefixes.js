const _ = require('underscore')

module.exports = (banksWithPrefixes) => {
  const banks = {}
  const prefixes = {}
  for (const bank of banksWithPrefixes) {
    const bankWithoutPrefixes = _.clone(bank)
    const prefixesArray = _.clone(bank.prefixes)
    delete bankWithoutPrefixes.prefixes
    banks[bank.alias] = bankWithoutPrefixes
    for (const prefix of prefixesArray) {
      prefixes[prefix] = bank.alias
    }
  }
  return { banks, prefixes }
}
