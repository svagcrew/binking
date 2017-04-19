const expect = require('expect.js')
const path = require('path')
const glob = require('glob')
const fs = require('fs-extra')
const _ = require('underscore')
const banks = require('../tasks/_read-banks')()
const CardInfo = require('../dist/card-info.core')
const rootPath = path.resolve(__dirname, '..')

describe('bank logo', () => {
  for (const bankData of banks) {
    const logoPathWithoutExt = path.resolve(rootPath, 'dist', 'banks-logos', bankData.alias)
    const logoPathPng = `${logoPathWithoutExt}.png`
    const logoPathSvg = `${logoPathWithoutExt}.svg`
    const logoPathRelative = path.relative(rootPath, `${logoPathWithoutExt}.(png|svg)`)
    it(`for ${bankData.alias} should exists in PNG or/and SVG format: ${logoPathRelative}`, () => {
      expect(fs.existsSync(logoPathSvg) || fs.existsSync(logoPathPng)).to.be.ok()
    })
  }

  const banksLogosPaths = glob.sync(path.resolve(rootPath, 'dist', 'banks-logos', '*'))
  for (const logoPath of banksLogosPaths) {
    const logoPathRelative = path.relative(rootPath, logoPath)
    const extname = path.extname(logoPath)
    it(`${logoPathRelative} should have ".png" or ".svg" extname`, () => {
      expect(['.png', '.svg']).to.contain(extname)
    })

    const basename = path.basename(logoPath, extname)
    it(`${logoPathRelative} should belongs to existing bank ${basename}`, () => {
      const bankData = _.find(banks, { alias: basename })
      expect(bankData).to.be.ok()
    })
  }
})

describe('brand logo', () => {
  for (const brandData of CardInfo._brands) {
    for (const extname of ['png', 'svg']) {
      for (const style of ['colored', 'white', 'black']) {
        const logoPath = path.resolve(rootPath, 'dist', 'brands-logos', brandData.alias + '-' + style + '.' + extname)
        const logoPathRelative = path.relative(rootPath, logoPath)
        it(`for ${brandData.alias} should exists in ${extname.toUpperCase()} format and ${style} style: ${logoPathRelative}`, () => {
          expect(fs.existsSync(logoPath)).to.be.ok()
        })
      }
    }
  }

  const brandsLogosPaths = glob.sync(path.resolve(rootPath, 'dist', 'brands-logos', '*'))
  for (const logoPath of brandsLogosPaths) {
    const logoPathRelative = path.relative(rootPath, logoPath)
    const extname = path.extname(logoPath)
    it(`${logoPathRelative} should have ".png" or ".svg" extname`, () => {
      expect(['.png', '.svg']).to.contain(extname)
    })

    const brandAlias = path.basename(logoPath, extname).split('-').slice(0, -1).join('-')
    it(`${logoPathRelative} should belongs to existing brand ${brandAlias}`, () => {
      const brandData = _.find(CardInfo._brands, { alias: brandAlias })
      expect(brandData).to.be.ok()
    })
  }
})
