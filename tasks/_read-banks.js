const glob = require('glob')
const path = require('path')
const jsonfile = require('jsonfile')
const fs = require('fs-extra')

module.exports = (options = {}) => {
  const countries = options.countries || ['all']
  const banksAliases = options.banks || ['all']
  const pattern = path.resolve(__dirname, '..', 'banks', '*.json')
  const filesPaths = glob.sync(pattern)
  const banks = []
  for (const filePath of filesPaths) {
    const bank = jsonfile.readFileSync(filePath)
    bank.alias = path.basename(filePath, '.json')
    bank.country = bank.alias.split('-')[0]
    const logoPng = `${bank.alias}.png`
    if (fs.existsSync(path.resolve(__dirname, '..', 'dist', 'banks-logos', logoPng))) bank.logoPng = logoPng
    const logoSvg = `${bank.alias}.svg`
    if (fs.existsSync(path.resolve(__dirname, '..', 'dist', 'banks-logos', logoSvg))) bank.logoSvg = logoSvg
    if (!countries.includes('all') && !countries.includes(bank.country)) continue
    if (!banksAliases.includes('all') && !bank.includes(bank.alias)) continue
    banks.push(bank)
  }
  return banks
}
