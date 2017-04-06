const writeBanks = require('./_write-banks')
const _ = require('underscore')
const banks = require('./_read-banks')()
const keys = ['name', 'nameEn', 'url', 'logoPng', 'logoSvg', 'backgroundColor', 'backgroundColors', 'backgroundLightness', 'logoStyle', 'text', 'prefixes']

const normalizedBanks = _.map(banks, (bank) => {
  bank.prefixes = _.sortBy(bank.prefixes)
  return _.chain(bank)
    .pairs()
    .sortBy(pair => keys.indexOf(pair[0]))
    .object()
    .value()
})

writeBanks(normalizedBanks)
