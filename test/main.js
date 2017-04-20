var expect = require('expect.js')
var _ = require('underscore')
var CardInfo = require('../dist/card-info')
var validUrl = require('valid-url')

function isColorValid (color) {
  return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color)
}

function isUrlValid (url) {
  return !!validUrl.isWebUri.call(null, url)
}

function getBrand () {
  return _.find(CardInfo._brands, { alias: 'visa' })
}

function getBrandPrefix () {
  return '4'
}

function getBank () {
  return CardInfo._banks[_.keys(CardInfo._banks)[0]]
}

function getBankPrefix (bank) {
  bank = bank || getBank()
  for (var prefix in CardInfo._prefixes) {
    if (CardInfo._prefixes[prefix] === bank.alias) return prefix
  }
}

function getBankWithAndWithoutSvgLogoAndCardNumber () {
  var bankWithoutSvgLogo = _.find(CardInfo._banks, function (bank) {
    return !bank.logoSvg
  })
  var bankWithSvgLogo = _.find(CardInfo._banks, function (bank) {
    return bank.logoSvg
  })
  var bankWithoutSvgLogoPrefix = getBankPrefix(bankWithoutSvgLogo)
  var bankWithSvgLogoPrefix = getBankPrefix(bankWithSvgLogo)
  return {
    bankWithoutSvgLogo: bankWithoutSvgLogo,
    bankWithSvgLogo: bankWithSvgLogo,
    bankWithoutSvgLogoCardNumber: bankWithoutSvgLogoPrefix,
    bankWithSvgLogoCardNumber: bankWithSvgLogoPrefix
  }
}

describe('CardInfo', function () {
  describe('._defaultProps', function () {
    var keys = [
      'bankAlias',
      'bankName',
      'bankNameEn',
      'bankCountry',
      'bankUrl',
      'bankLogo',
      'bankLogoPng',
      'bankLogoSvg',
      'bankLogoStyle',
      'backgroundColor',
      'backgroundColors',
      'backgroundLightness',
      'backgroundGradient',
      'textColor',
      'brandAlias',
      'brandName',
      'brandLogo',
      'brandLogoPng',
      'brandLogoSvg',
      'codeName',
      'codeLength',
      'numberMask',
      'numberBlocks',
      'numberGaps',
      'numberLengths',
      'numberNice',
      'number',
      'numberSource',
      'options'
    ]
    it('should have only this keys: ' + keys.join(', '), function () {
      expect(CardInfo._defaultProps).to.only.have.keys(keys)
    })

    it('.backgroundColor should be a color', function () {
      expect(isColorValid(CardInfo._defaultProps.backgroundColor)).to.be.ok()
    })

    it('.backgroundColors should be an array', function () {
      expect(CardInfo._defaultProps.backgroundColors).to.be.an('array')
    })

    it('.backgroundColors should have at least two elements', function () {
      expect(CardInfo._defaultProps.backgroundColors.length).to.be.greaterThan(1)
    })

    it('.backgroundColors each element should be a color', function () {
      _.each(CardInfo._defaultProps.backgroundColors, function (color) {
        expect(isColorValid(color)).to.be.ok()
      })
    })

    it('.backgroundLightness should be "dark" or "light"', function () {
      expect(['dark', 'light']).to.contain(CardInfo._defaultProps.backgroundLightness)
    })

    it('.textColor should be a color', function () {
      expect(isColorValid(CardInfo._defaultProps.textColor)).to.be.ok()
    })

    it('.numberGaps should be an array', function () {
      expect(CardInfo._defaultProps.numberGaps).to.be.an('array')
    })

    it('.numberGaps should have at least two elements', function () {
      expect(CardInfo._defaultProps.numberGaps.length).to.be.greaterThan(1)
    })

    it('.numberGaps each element should be a number', function () {
      _.each(CardInfo._defaultProps.numberGaps, function (gapPos) {
        expect(gapPos).to.be.a('number')
      })
    })

    it('.numberLengths should be an array', function () {
      expect(CardInfo._defaultProps.numberLengths).to.be.an('array')
    })

    it('.numberLengths should have at least one element', function () {
      expect(CardInfo._defaultProps.numberLengths.length).to.be.greaterThan(0)
    })

    it('.numberLengths each element should be a number', function () {
      _.each(CardInfo._defaultProps.numberLengths, function (length) {
        expect(length).to.be.a('number')
      })
    })

    it('.options should be an empty object', function () {
      expect(CardInfo._defaultProps.options).to.eql({})
    })

    var keysNull = [
      'bankAlias',
      'bankName',
      'bankNameEn',
      'bankCountry',
      'bankUrl',
      'bankLogo',
      'bankLogoPng',
      'bankLogoSvg',
      'bankLogoStyle',
      'backgroundGradient',
      'brandAlias',
      'brandName',
      'brandLogo',
      'brandLogoPng',
      'brandLogoSvg',
      'codeName',
      'codeLength',
      'numberBlocks',
      'numberMask',
      'numberNice',
      'number',
      'numberSource'
    ]
    _.each(keysNull, function (key) {
      it('.' + key + ' should be null', function () {
        expect(CardInfo._defaultProps[key]).to.equal(null)
      })
    })
  })

  describe('.defaultOptions', function () {
    it('.banksLogosPath should be a string', function () {
      expect(CardInfo.defaultOptions.banksLogosPath).to.be.a('string')
    })

    it('.brandsLogosPath should be a string', function () {
      expect(CardInfo.defaultOptions.brandsLogosPath).to.be.a('string')
    })

    var brandLogoPolicies = ['auto', 'colored', 'mono', 'black', 'white']
    it('.brandLogoPolicy should be in ' + brandLogoPolicies.join(', '), function () {
      expect(brandLogoPolicies).to.be.contain(CardInfo.defaultOptions.brandLogoPolicy)
    })

    it('.preferredExt should be "svg" or "png"', function () {
      expect(['png', 'svg']).to.contain(CardInfo.defaultOptions.preferredExt)
    })

    it('.maskDigitSymbol should be a string', function () {
      expect(CardInfo.defaultOptions.maskDigitSymbol).to.be.a('string')
    })

    it('.maskDigitSymbol length should be 1', function () {
      expect(CardInfo.defaultOptions.maskDigitSymbol.length).to.be.equal(1)
    })

    it('.maskDelimiterSymbol should be a string', function () {
      expect(CardInfo.defaultOptions.maskDelimiterSymbol).to.be.a('string')
    })

    it('.maskDelimiterSymbol length should be 1', function () {
      expect(CardInfo.defaultOptions.maskDelimiterSymbol.length).to.be.equal(1)
    })

    it('.gradientDegrees should be a number', function () {
      expect(CardInfo.defaultOptions.gradientDegrees).to.be.a('number')
    })
  })

  describe('._banks', function () {
    if (typeof window === 'undefined') {
      it('should be same as banks in banks directory', function () {
        var banksWithPrefixes = require('../tasks/_read-banks')()
        var banksAndPrefixes = require('../tasks/_get-banks-and-prefixes')(banksWithPrefixes)
        expect(_.isEqual(CardInfo._banks, banksAndPrefixes.banks)).to.be.ok()
      })
    }

    it('should be an object', function () {
      expect(CardInfo._banks).to.be.an('object')
    })

    it('should be not empty', function () {
      expect(_.keys(CardInfo._banks).length).to.be.greaterThan(1)
    })

    _.each(CardInfo._banks, function (bank, alias) {
      describe('.' + alias, function () {
        it('.alias should be same as described key', function () {
          expect(alias).to.be.equal(bank.alias)
        })

        var keys = ['alias', 'country', 'name', 'nameEn', 'url', 'backgroundColor', 'backgroundColors', 'backgroundLightness', 'logoStyle', 'text']
        it('should contain all this properties: ' + keys.join(', '), function () {
          expect(bank).to.have.keys(keys)
        })

        it('.alias should contain only small letters and hyphens', function () {
          expect(bank.alias).to.match(/^[a-z0-9-]+$/)
        })

        var aliasPrefixes = ['ru-']
        it('.alias should start with ' + aliasPrefixes.join(' or '), function () {
          expect(aliasPrefixes).to.contain(alias.substring(0, 3))
        })

        it('.backgroundColor should be a color', function () {
          expect(isColorValid(bank.backgroundColor)).to.be.ok()
        })

        it('.backgroundColors should be an array', function () {
          expect(bank.backgroundColors).to.be.an('array')
        })

        it('.backgroundColors should have at least two elements', function () {
          expect(bank.backgroundColors.length).to.be.greaterThan(1)
        })

        it('.backgroundColors each element should be a color', function () {
          _.each(bank.backgroundColors, function (color) {
            expect(isColorValid(color)).to.be.ok()
          })
        })

        it('.text should be a color', function () {
          expect(isColorValid(bank.text)).to.be.ok()
        })

        it('.backgroundLightness should be "dark" or "light"', function () {
          expect(['dark', 'light']).to.contain(bank.backgroundLightness)
        })

        it('.logoStyle should be "colored", "black" or "white"', function () {
          expect(['colored', 'black', 'white']).to.contain(bank.logoStyle)
        })

        it('.url should be an URL', function () {
          expect(isUrlValid(bank.url)).to.be.ok()
        })

        var country = alias.split('-')[0]
        it('.country should be ' + country, function () {
          expect(bank.country).to.equal(country)
        })

        var logoPng = alias + '.png'
        it('.logoPng should be ' + logoPng, function () {
          expect(bank.logoPng).to.equal(logoPng)
        })

        var logoSvg = alias + '.svg'
        it('.logoSvg should be ' + logoSvg + ' if exists', function () {
          if (bank.logoSvg) expect(bank.logoSvg).to.equal(logoSvg)
        })
      })
    })
  })

  describe('._prefixes', function () {
    it('should be an object', function () {
      expect(CardInfo._prefixes).to.be.an('object')
    })

    it('should be not empty', function () {
      expect(_.keys(CardInfo._prefixes).length).to.be.greaterThan(1)
    })

    it('each prefix should be six digits string', function () {
      this.timeout(0)
      _.each(CardInfo._prefixes, function (bankAlias, prefix) {
        expect(prefix).to.match(/^\d{6}$/)
      })
    })

    it('each prefix should belongs to existing bank', function () {
      this.timeout(0)
      _.each(CardInfo._prefixes, function (bankAlias) {
        expect(CardInfo._banks[bankAlias]).to.be.ok()
      })
    })

    if (typeof window === 'undefined') {
      var banksWithPrefixes = require('../tasks/_read-banks')()
      var banksAndPrefixes = require('../tasks/_get-banks-and-prefixes')(banksWithPrefixes)

      it('should be same as prefixes of banks in banks directory', function () {
        expect(_.isEqual(CardInfo._prefixes, banksAndPrefixes.prefixes)).to.be.ok()
      })

      var allBanksPrefixes = _.flatten(_.values(_.mapObject(banksWithPrefixes, function (bank) {
        return bank.prefixes
      })))
      var allUniqBanksPrefixes = _.uniq(allBanksPrefixes)
      if (_.isEqual(allUniqBanksPrefixes, allBanksPrefixes)) {
        it('each prefix of each bank in banks directory should be unique', function () {
          return true
        })
      } else {
        var dupPrefixes = _.filter(allBanksPrefixes, function (value, index, iteratee) {
          return _.includes(iteratee, value, index + 1)
        })
        _.each(dupPrefixes, function (dupPrefix) {
          var badBanks = _.filter(banksWithPrefixes, function (bank) {
            return _.includes(bank.prefixes, dupPrefix)
          })
          var badBanksAliases = _.reduce(badBanks, function (memo, bank) {
            return memo.concat(bank.alias)
          }, [])
          it(dupPrefix + ' should belongs to only one bank', function () {
            throw new Error('Owners: ' + badBanksAliases.join(', '))
          })
        })
      }
    }
  })

  describe('._brands', function () {
    it('should be an array', function () {
      expect(CardInfo._brands).to.be.an('array')
    })

    it('should be not empty', function () {
      expect(CardInfo._brands.length).to.be.greaterThan(1)
    })

    it('should cover each prefix of each bank', function () {
      _.each(CardInfo._prefixes, function (bankAlias, prefix) {
        if (!CardInfo._getBrand(prefix)) throw new Error('No one brand covers ' + prefix + ' prefix of ' + bankAlias + ' bank')
      })
    })

    _.each(CardInfo._brands, function (brand) {
      describe(brand.alias, function () {
        it('.alias should contain only small letters and hyphens', function () {
          expect(brand.alias).to.match(/^[a-z-]+$/)
        })

        it('.name should be a string', function () {
          expect(brand.name).to.be.a('string')
        })

        it('.codeLength should be a number', function () {
          expect(brand.codeLength).to.be.a('number')
        })

        it('.gaps should be an array', function () {
          expect(brand.gaps).to.be.an('array')
        })

        it('.gaps should have at least two elements', function () {
          expect(brand.gaps.length).to.be.greaterThan(1)
        })

        it('.gaps each element should be a number', function () {
          _.each(brand.gaps, function (gapPos) {
            expect(gapPos).to.be.a('number')
          })
        })

        it('.lengths should be an array', function () {
          expect(brand.lengths).to.be.an('array')
        })

        it('.lengths should have at least one element', function () {
          expect(brand.lengths.length).to.be.greaterThan(0)
        })

        it('.lengths each element should be a number', function () {
          _.each(brand.lengths, function (length) {
            expect(length).to.be.a('number')
          })
        })

        it('.pattern should be a regexp', function () {
          expect(brand.pattern).to.be.an('regexp')
        })
      })
    })
  })

  describe('._assign()', function () {
    it('should extend an object with the attributes of another', function () {
      var obj1 = { a: 1 }
      var obj2 = { b: 2, x: 22 }
      var obj3 = { c: 3, x: 33 }
      CardInfo._assign(obj1, obj2, obj3)
      expect(obj1).to.eql({ a: 1, b: 2, x: 33, c: 3 })
    })

    it('and return it', function () {
      var obj1 = { a: 1 }
      var obj2 = { b: 2, x: 22 }
      var obj3 = { c: 3, x: 33 }
      var obj4 = CardInfo._assign(obj1, obj2, obj3)
      expect(obj4).to.equal(obj1)
    })
  })

  describe('._getNumber()', function () {
    it('should return numberSource converted to string with removed spaces', function () {
      expect(CardInfo._getNumber('a1')).to.equal('')
      expect(CardInfo._getNumber(null)).to.equal('')
      expect(CardInfo._getNumber(undefined)).to.equal('')
      expect(CardInfo._getNumber(NaN)).to.equal('')
      expect(CardInfo._getNumber(true)).to.equal('')
      expect(CardInfo._getNumber(false)).to.equal('')
      expect(CardInfo._getNumber([[]])).to.equal('')
      expect(CardInfo._getNumber([{}])).to.equal('')
      expect(CardInfo._getNumber([])).to.equal('')
    })

    it('should return "" if numberSource contain something except digits and spaces', function () {
      expect(CardInfo._getNumber('a1')).to.equal('')
      expect(CardInfo._getNumber(null)).to.equal('')
      expect(CardInfo._getNumber(undefined)).to.equal('')
      expect(CardInfo._getNumber(NaN)).to.equal('')
      expect(CardInfo._getNumber(true)).to.equal('')
      expect(CardInfo._getNumber(false)).to.equal('')
      expect(CardInfo._getNumber([[]])).to.equal('')
      expect(CardInfo._getNumber([{}])).to.equal('')
      expect(CardInfo._getNumber([])).to.equal('')
    })
  })

  describe('._getBank()', function () {
    it('should find bank by stringified card number', function () {
      expect(CardInfo._getBank(getBankPrefix())).to.equal(getBank())
      expect(CardInfo._getBank(getBankPrefix() + '0000000')).to.equal(getBank())
    })

    it('should return undefined if bank with this prefix does not exists', function () {
      expect(CardInfo._getBank('123456')).to.equal(undefined)
    })

    it('should return undefined if card number length less then six', function () {
      expect(CardInfo._getBank('12345')).to.equal(undefined)
    })
  })

  describe('._getBrand()', function () {
    it('should return brand by stringified card number', function () {
      expect(CardInfo._getBrand(getBrandPrefix())).to.equal(getBrand())
    })

    it('should return undefined if card number suitable for several brands', function () {
      expect(CardInfo._getBrand('5')).to.equal(undefined)
    })

    it('should return undefined if brand not found', function () {
      expect(CardInfo._getBrand('')).to.equal(undefined)
    })
  })

  describe('._getLogo()', function () {
    it('should return logo path by dirname and basename', function () {
      expect(CardInfo._getLogo('/path/', 'logo.png')).to.equal('/path/logo.png')
    })

    it('should return logo path by dirname, basename and extname', function () {
      expect(CardInfo._getLogo('/path/', 'logo', 'png')).to.equal('/path/logo.png')
    })

    it('should return null if basename is undefined', function () {
      expect(CardInfo._getLogo('/path/', undefined)).to.equal(null)
    })
  })

  describe('._getBrandLogoBasename()', function () {
    it('should return colored brand logo basename if policy is "colored"', function () {
      expect(CardInfo._getBrandLogoBasename('visa', 'colored', 'light', 'colored')).to.equal('visa-colored')
    })

    it('should return black brand logo basename if policy is "black"', function () {
      expect(CardInfo._getBrandLogoBasename('visa', 'black', 'light', 'colored')).to.equal('visa-black')
    })

    it('should return white brand logo basename if policy is "white"', function () {
      expect(CardInfo._getBrandLogoBasename('visa', 'white', 'light', 'colored')).to.equal('visa-white')
    })

    it('should return white brand logo basename if policy is "mono" and background is dark', function () {
      expect(CardInfo._getBrandLogoBasename('visa', 'mono', 'dark', 'colored')).to.equal('visa-white')
    })

    it('should return black brand logo basename if policy is "mono" and background is light', function () {
      expect(CardInfo._getBrandLogoBasename('visa', 'mono', 'light', 'colored')).to.equal('visa-black')
    })

    it('should return colored brand logo basename if policy is "auto" and logo style is colored', function () {
      expect(CardInfo._getBrandLogoBasename('visa', 'auto', 'dark', 'colored')).to.equal('visa-colored')
    })

    it('should return white brand logo basename if policy is "auto" and logo style is white', function () {
      expect(CardInfo._getBrandLogoBasename('visa', 'auto', 'dark', 'white')).to.equal('visa-white')
    })

    it('should return black brand logo basename if policy is "auto" and logo style is black', function () {
      expect(CardInfo._getBrandLogoBasename('visa', 'auto', 'dark', 'black')).to.equal('visa-black')
    })

    it('should return colored brand logo basename if policy is "auto" and logo style is null', function () {
      expect(CardInfo._getBrandLogoBasename('visa', 'auto', 'dark', null)).to.equal('visa-colored')
    })
  })

  describe('._getLogoByPreferredExt()', function () {
    it('should return logo by png logo path, svg logo path and preferred extension', function () {
      expect(CardInfo._getLogoByPreferredExt('logo.png', 'logo.svg', 'png')).to.equal('logo.png')
      expect(CardInfo._getLogoByPreferredExt('logo.png', 'logo.svg', 'svg')).to.equal('logo.svg')
    })

    it('should return one logo if another not defined', function () {
      expect(CardInfo._getLogoByPreferredExt('logo.png', undefined, 'png')).to.equal('logo.png')
      expect(CardInfo._getLogoByPreferredExt(undefined, 'logo.svg', 'svg')).to.equal('logo.svg')
      expect(CardInfo._getLogoByPreferredExt('logo.png', undefined, 'svg')).to.equal('logo.png')
      expect(CardInfo._getLogoByPreferredExt(undefined, 'logo.svg', 'png')).to.equal('logo.svg')
    })

    it('should return null if both logos undefined', function () {
      expect(CardInfo._getLogoByPreferredExt(undefined, undefined, 'png')).to.equal(null)
      expect(CardInfo._getLogoByPreferredExt(undefined, undefined, 'svg')).to.equal(null)
    })
  })

  describe('._getGradient()', function () {
    it('should return css gradient by colors array and degreeses', function () {
      expect(CardInfo._getGradient(['#000', '#fff'], 100)).to.equal('linear-gradient(100deg, #000, #fff)')
      expect(CardInfo._getGradient(['#000', '#aaaaaa', '#fff'], 100)).to.equal('linear-gradient(100deg, #000, #aaaaaa, #fff)')
    })
  })

  describe('._getBlocks()', function () {
    it('should return number blocks by avaliable lengths and gaps', function () {
      expect(CardInfo._getBlocks([4, 8, 12], [16])).to.eql([4, 4, 4, 4])
      expect(CardInfo._getBlocks([4, 8, 12], [16, 17])).to.eql([4, 4, 4, 5])
    })
  })

  describe('._getMask()', function () {
    it('should return mask by digit symbol, delimiter symbol, avaliable lengths and gaps', function () {
      expect(CardInfo._getMask('0', ' ', [4, 4, 4, 4])).to.equal('0000 0000 0000 0000')
      expect(CardInfo._getMask('X', '-', [4, 4, 4, 5])).to.equal('XXXX-XXXX-XXXX-XXXXX')
    })
  })

  describe('._getNumberNice()', function () {
    it('should return masked card number by stringified card number and gaps', function () {
      expect(CardInfo._getNumberNice('1234567890123456', [4, 8, 12])).to.equal('1234 5678 9012 3456')
      expect(CardInfo._getNumberNice('1234567890123456000000000000000', [4, 8, 12])).to.equal('1234 5678 9012 3456000000000000000')
      expect(CardInfo._getNumberNice('12345678', [4, 8, 12])).to.equal('1234 5678')
      expect(CardInfo._getNumberNice('12345', [4, 8, 12])).to.equal('1234 5')
      expect(CardInfo._getNumberNice('', [4, 8, 12])).to.equal('')
    })
  })

  describe('._addBanks()', function () {
    it('should add banks to CardInfo._banks', function () {
      var savedBanks = _.clone(CardInfo._banks)
      var newBanks = {
        'ru-bank1': { alias: 'ru-bank1' },
        'ru-bank2': { alias: 'ru-bank2' }
      }
      var expectedBanks = _.assign({}, CardInfo._banks, newBanks)
      CardInfo._addBanks(newBanks)
      expect(CardInfo._banks).to.eql(expectedBanks)
      CardInfo._banks = savedBanks
    })
  })

  describe('._addPrefixes()', function () {
    it('should add prefixes to CardInfo._prefixes', function () {
      var savedPrefixes = _.clone(CardInfo._prefixes)
      var newPrefixes = {
        '000001': 'ru-bank1',
        '000002': 'ru-bank2'
      }
      var expectedPrefixes = _.assign({}, CardInfo._prefixes, newPrefixes)
      CardInfo._addPrefixes(newPrefixes)
      expect(CardInfo._prefixes).to.eql(expectedPrefixes)
      CardInfo._prefixes = savedPrefixes
    })
  })

  describe('.addBanksAndPrefixes()', function () {
    it('should add banks and prefixes', function () {
      var savedBanks = _.clone(CardInfo._banks)
      var savedPrefixes = _.clone(CardInfo._prefixes)
      var newBanks = {
        'ru-bank1': { alias: 'ru-bank1' },
        'ru-bank2': { alias: 'ru-bank2' }
      }
      var newPrefixes = {
        '000001': 'ru-bank1',
        '000002': 'ru-bank2'
      }
      var newBanksAndPrefixes = {
        banks: newBanks,
        prefixes: newPrefixes
      }
      var expectedBanks = _.assign({}, CardInfo._banks, newBanks)
      var expectedPrefixes = _.assign({}, CardInfo._prefixes, newPrefixes)
      CardInfo.addBanksAndPrefixes(newBanksAndPrefixes)
      expect(CardInfo._banks).to.eql(expectedBanks)
      expect(CardInfo._prefixes).to.eql(expectedPrefixes)
      CardInfo._prefixes = savedPrefixes
      CardInfo._banks = savedBanks
    })
  })

  describe('.setDefaultOptions()', function () {
    it('should set default options', function () {
      var savedDefaultOptions = _.clone(CardInfo.defaultOptions)
      var newOptions = { maskDigitSymbol: 'X', maskDelimiterSymbol: '-' }
      var expectedDefaultOptions = _.assign({}, CardInfo.defaultOptions, newOptions)
      CardInfo.setDefaultOptions(newOptions)
      expect(CardInfo.defaultOptions).to.eql(expectedDefaultOptions)
      CardInfo.setDefaultOptions(savedDefaultOptions)
    })
  })

  describe('.getBanks()', function () {
    it('should return array of banks', function () {
      expect(CardInfo.getBanks()).to.be.an('array')
      expect(CardInfo.getBanks().length).to.equal(_.keys(CardInfo._banks).length)
    })
  })

  describe('.getBrands()', function () {
    it('should return array of brands', function () {
      expect(CardInfo.getBrands()).to.be.an('array')
      expect(CardInfo.getBrands().length).to.equal(CardInfo._brands.length)
      var keys = [
        'alias', 'name', 'codeName', 'codeLength', 'gaps', 'lengths', 'pattern', 'blocks', 'mask',
        'logoColoredPng', 'logoColoredSvg', 'logoColored', 'logoBlackPng', 'logoBlackSvg',
        'logoBlack', 'logoWhitePng', 'logoWhiteSvg', 'logoWhite'
      ]
      _.each(CardInfo.getBrands(), function (brand, bi) {
        expect(brand).to.only.have.keys(keys)
      })
    })
  })

  describe('#options', function () {
    it('should be equal to default options extended by options which was not sent to constructor', function () {
      var sendedOptions = { banksLogosPath: '/banks-logos/', preferredExt: 'png' }
      var expected = _.assign({}, CardInfo.defaultOptions, sendedOptions)
      expect((new CardInfo('', sendedOptions)).options).to.eql(expected)
    })

    it('should be equal to default options if options was not sent to constructor', function () {
      expect((new CardInfo('')).options).to.eql(CardInfo.defaultOptions)
    })
  })

  describe('#numberSource', function () {
    it('should be initial card number', function () {
      expect((new CardInfo('213123 124124 124')).numberSource).to.equal('213123 124124 124')
      expect((new CardInfo(234234)).numberSource).to.equal(234234)
    })
  })

  describe('#number', function () {
    it('should be stringified card number', function () {
      expect((new CardInfo('213123 124124 124')).number).to.equal(CardInfo._getNumber('213123 124124 124'))
      expect((new CardInfo(234234)).number).to.equal(CardInfo._getNumber(234234))
      expect((new CardInfo(NaN)).number).to.equal(CardInfo._getNumber(NaN))
    })
  })

  describe('#bankAlias', function () {
    it('should be alias of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).bankAlias).to.equal(getBank().alias)
    })

    it('should be default bank alias if bank not detected', function () {
      expect((new CardInfo('')).bankAlias).to.equal(CardInfo._defaultProps.bankAlias)
    })
  })

  describe('#bankName', function () {
    it('should be name of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).bankName).to.equal(getBank().name)
    })

    it('should be default bank name if bank not detected', function () {
      expect((new CardInfo('')).bankName).to.equal(CardInfo._defaultProps.bankName)
    })
  })

  describe('#bankNameEn', function () {
    it('should be english name of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).bankNameEn).to.equal(getBank().nameEn)
    })

    it('should be default bank english name if bank not detected', function () {
      expect((new CardInfo('')).bankNameEn).to.equal(CardInfo._defaultProps.bankNameEn)
    })
  })

  describe('#bankCountry', function () {
    it('should be country of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).bankCountry).to.equal(getBank().country)
    })

    it('should be default bank country if bank not detected', function () {
      expect((new CardInfo('')).bankCountry).to.equal(CardInfo._defaultProps.bankCountry)
    })
  })

  describe('#bankUrl', function () {
    it('should be url of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).bankUrl).to.equal(getBank().url)
    })

    it('should be default bank url if bank not detected', function () {
      expect((new CardInfo('')).bankUrl).to.equal(CardInfo._defaultProps.bankUrl)
    })
  })

  describe('#bankLogo', function () {
    it('should be logo path with preferred extension of detected bank', function () {
      var o = getBankWithAndWithoutSvgLogoAndCardNumber()
      expect((new CardInfo(o.bankWithSvgLogoCardNumber, { preferredExt: 'png', banksLogosPath: '' })).bankLogo).to.equal(o.bankWithSvgLogo.logoPng)
      expect((new CardInfo(o.bankWithSvgLogoCardNumber, { preferredExt: 'svg', banksLogosPath: '' })).bankLogo).to.equal(o.bankWithSvgLogo.logoSvg)
      expect((new CardInfo(o.bankWithoutSvgLogoCardNumber, { preferredExt: 'png', banksLogosPath: '' })).bankLogo).to.equal(o.bankWithoutSvgLogo.logoPng)
      expect((new CardInfo(o.bankWithoutSvgLogoCardNumber, { preferredExt: 'svg', banksLogosPath: '' })).bankLogo).to.equal(o.bankWithoutSvgLogo.logoPng)
    })

    it('should be default bank logo if bank not detected', function () {
      expect((new CardInfo('')).bankLogo).to.equal(CardInfo._defaultProps.bankLogo)
    })
  })

  describe('#bankLogoPng', function () {
    it('should be png logo path of detected bank', function () {
      expect((new CardInfo(getBankPrefix(), { banksLogosPath: '' })).bankLogoPng).to.equal(getBank().logoPng)
    })

    it('should be default bank png logo if bank not detected', function () {
      expect((new CardInfo('')).bankLogoPng).to.equal(CardInfo._defaultProps.bankLogoPng)
    })
  })

  describe('#bankLogoSvg', function () {
    var o = getBankWithAndWithoutSvgLogoAndCardNumber()
    it('should be svg logo path of detected bank', function () {
      expect((new CardInfo(o.bankWithSvgLogoCardNumber, { banksLogosPath: '' })).bankLogoSvg).to.equal(o.bankWithSvgLogo.logoSvg)
    })

    it('should be null if detected bank has not svg logo', function () {
      expect((new CardInfo(o.bankWithoutSvgLogoCardNumber, { banksLogosPath: '' })).bankLogoSvg).to.equal(null)
    })

    it('should be default bank svg logo if bank not detected', function () {
      expect((new CardInfo('')).bankLogoSvg).to.equal(CardInfo._defaultProps.bankLogoSvg)
    })
  })

  describe('#bankLogoStyle', function () {
    it('should be logo style of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).bankLogoStyle).to.equal(getBank().logoStyle)
    })

    it('should be default bank logo style if bank not detected', function () {
      expect((new CardInfo('')).bankLogoStyle).to.equal(CardInfo._defaultProps.bankLogoStyle)
    })
  })

  describe('#backgroundColor', function () {
    it('should be logo background color of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).backgroundColor).to.equal(getBank().backgroundColor)
    })

    it('should be default background color if bank not detected', function () {
      expect((new CardInfo('')).backgroundColor).to.equal(CardInfo._defaultProps.backgroundColor)
    })
  })

  describe('#backgroundColors', function () {
    it('should be background colors of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).backgroundColors).to.eql(getBank().backgroundColors)
    })

    it('should be default background colors if bank not detected', function () {
      expect((new CardInfo('')).backgroundColors).to.eql(CardInfo._defaultProps.backgroundColors)
    })
  })

  describe('#backgroundLightness', function () {
    it('should be backgroundLightness of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).backgroundLightness).to.equal(getBank().backgroundLightness)
    })

    it('should be default background backgroundLightness if bank not detected', function () {
      expect((new CardInfo('')).backgroundLightness).to.equal(CardInfo._defaultProps.backgroundLightness)
    })
  })

  describe('#backgroundGradient', function () {
    it('should be gradient created with background colors of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).backgroundGradient).to.equal(CardInfo._getGradient(getBank().backgroundColors, CardInfo.defaultOptions.gradientDegrees))
    })

    it('should be gradient created with default background colors if bank not detected', function () {
      expect((new CardInfo('')).backgroundGradient).to.equal(CardInfo._getGradient(CardInfo._defaultProps.backgroundColors, CardInfo.defaultOptions.gradientDegrees))
    })
  })

  describe('#textColor', function () {
    it('should be text color of detected bank', function () {
      expect((new CardInfo(getBankPrefix())).textColor).to.equal(getBank().text)
    })

    it('should be default text color if bank not detected', function () {
      expect((new CardInfo('')).textColor).to.equal(CardInfo._defaultProps.textColor)
    })
  })

  describe('#brandAlias', function () {
    it('should be alias of detected brand', function () {
      expect((new CardInfo(getBrandPrefix())).brandAlias).to.equal(getBrand().alias)
    })

    it('should be default brand alias if brand not detected', function () {
      expect((new CardInfo('')).brandAlias).to.equal(CardInfo._defaultProps.brandAlias)
    })
  })

  describe('#brandName', function () {
    it('should be name of detected brand', function () {
      expect((new CardInfo(getBrandPrefix())).brandName).to.equal(getBrand().name)
    })

    it('should be default brand name if brand not detected', function () {
      expect((new CardInfo('')).brandName).to.equal(CardInfo._defaultProps.brandName)
    })
  })

  describe('#brandLogo', function () {
    it('should be logo path with preferred extension of detected brand suited for brand logo policy', function () {
      var basename = CardInfo._getBrandLogoBasename(getBrand().alias, CardInfo.defaultOptions.brandLogoPolicy, CardInfo._defaultProps.backgroundLightness, CardInfo._defaultProps.logoStyle)
      var brandLogoPng = CardInfo._getLogo('', basename, 'png')
      var brandLogoSvg = CardInfo._getLogo('', basename, 'svg')
      expect((new CardInfo(getBrandPrefix(), { preferredExt: 'png', brandsLogosPath: '' })).brandLogo).to.equal(brandLogoPng)
      expect((new CardInfo(getBrandPrefix(), { preferredExt: 'svg', brandsLogosPath: '' })).brandLogo).to.equal(brandLogoSvg)
    })

    it('should be default brand logo if brand not detected', function () {
      expect((new CardInfo('')).brandLogo).to.equal(CardInfo._defaultProps.brandLogo)
    })
  })

  describe('#brandLogoPng', function () {
    it('should be png logo path of detected brand suited for brand logo policy', function () {
      var basename = CardInfo._getBrandLogoBasename(getBrand().alias, CardInfo.defaultOptions.brandLogoPolicy, CardInfo._defaultProps.backgroundLightness, CardInfo._defaultProps.logoStyle)
      var brandLogoPng = CardInfo._getLogo('', basename, 'png')
      expect((new CardInfo(getBrandPrefix(), { brandsLogosPath: '' })).brandLogoPng).to.equal(brandLogoPng)
    })

    it('should be default brand png logo if brand not detected', function () {
      expect((new CardInfo('')).brandLogoPng).to.equal(CardInfo._defaultProps.brandLogoPng)
    })
  })

  describe('#brandLogoSvg', function () {
    it('should be svg logo path of detected brand suited for brand logo policy', function () {
      var basename = CardInfo._getBrandLogoBasename(getBrand().alias, CardInfo.defaultOptions.brandLogoPolicy, CardInfo._defaultProps.backgroundLightness, CardInfo._defaultProps.logoStyle)
      var brandLogoSvg = CardInfo._getLogo('', basename, 'svg')
      expect((new CardInfo(getBrandPrefix(), { brandsLogosPath: '' })).brandLogoSvg).to.equal(brandLogoSvg)
    })

    it('should be default brand png logo if brand not detected', function () {
      expect((new CardInfo('')).brandLogoSvg).to.equal(CardInfo._defaultProps.brandLogoSvg)
    })
  })

  describe('#codeName', function () {
    it('should be code name of detected brand', function () {
      expect((new CardInfo(getBrandPrefix())).codeName).to.equal(getBrand().codeName)
    })

    it('should be default code name if brand not detected', function () {
      expect((new CardInfo('')).codeName).to.equal(CardInfo._defaultProps.codeName)
    })
  })

  describe('#codeLength', function () {
    it('should be code length of detected brand', function () {
      expect((new CardInfo(getBrandPrefix())).codeLength).to.equal(getBrand().codeLength)
    })

    it('should be default code length if brand not detected', function () {
      expect((new CardInfo('')).codeLength).to.equal(CardInfo._defaultProps.codeLength)
    })
  })

  describe('#numberLengths', function () {
    it('should be number lengths of detected brand', function () {
      expect((new CardInfo(getBrandPrefix())).numberLengths).to.eql(getBrand().lengths)
    })

    it('should be default number lengths if brand not detected', function () {
      expect((new CardInfo('')).numberLengths).to.eql(CardInfo._defaultProps.numberLengths)
    })
  })

  describe('#numberGaps', function () {
    it('should be number gaps of detected brand', function () {
      expect((new CardInfo(getBrandPrefix())).numberGaps).to.eql(getBrand().gaps)
    })

    it('should be default number gaps if brand not detected', function () {
      expect((new CardInfo('')).numberGaps).to.eql(CardInfo._defaultProps.numberGaps)
    })
  })

  describe('#numberBlocks', function () {
    it('should be number blocks created by detected brand lengths and gaps', function () {
      var expectedNumberBlocks = CardInfo._getBlocks(getBrand().gaps, getBrand().lengths)
      expect((new CardInfo(getBrandPrefix())).numberBlocks).to.eql(expectedNumberBlocks)
    })

    it('should be default if brand not detected', function () {
      var expectedNumberBlocks = CardInfo._getBlocks(CardInfo._defaultProps.numberGaps, CardInfo._defaultProps.numberLengths)
      expect((new CardInfo('')).numberBlocks).to.eql(expectedNumberBlocks)
    })
  })

  describe('#numberMask', function () {
    it('should be number mask created by detected brand lengths and gaps', function () {
      var expectedNumberMask = CardInfo._getMask(
        CardInfo.defaultOptions.maskDigitSymbol,
        CardInfo.defaultOptions.maskDelimiterSymbol,
        CardInfo._getBlocks(getBrand().gaps, getBrand().lengths)
      )
      expect((new CardInfo(getBrandPrefix())).numberMask).to.equal(expectedNumberMask)
    })

    it('should be default if brand not detected', function () {
      var expectedNumberMask = CardInfo._getMask(
        CardInfo.defaultOptions.maskDigitSymbol,
        CardInfo.defaultOptions.maskDelimiterSymbol,
        CardInfo._getBlocks(CardInfo._defaultProps.numberGaps, CardInfo._defaultProps.numberLengths)
      )
      expect((new CardInfo('')).numberMask).to.equal(expectedNumberMask)
    })
  })

  describe('#numberNice', function () {
    it('should be number masked by detected brand gaps', function () {
      var number = getBrandPrefix() + '0000000000000000000'
      var expectedNumberNice = CardInfo._getNumberNice(number, getBrand().gaps)
      expect((new CardInfo(number)).numberNice).to.equal(expectedNumberNice)
    })

    it('should be number masked by default number gaps', function () {
      var number = '0000000000000000000'
      var expectedNumberNice = CardInfo._getNumberNice(number, CardInfo._defaultProps.numberGaps)
      expect((new CardInfo(number)).numberNice).to.equal(expectedNumberNice)
    })
  })
})
