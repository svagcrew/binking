(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * card-info v1.2.4
 * Get bank logo, colors, brand and etc. by card number
 * https://github.com/iserdmi/card-info.git
 * by Sergey Dmitriev (http://srdm.io)
 */

;(function () {
  function CardInfo (numberSource, options) {
    CardInfo._assign(this, CardInfo._defaultProps)

    this.options = CardInfo._assign({}, CardInfo.defaultOptions, options || {})
    this.numberSource = arguments.length ? numberSource : ''
    this.number = CardInfo._getNumber(this.numberSource)

    var bankData = CardInfo._getBank(this.number)
    if (bankData) {
      this.bankAlias = bankData.alias
      this.bankName = bankData.name
      this.bankNameEn = bankData.nameEn
      this.bankCountry = bankData.country
      this.bankUrl = bankData.url
      this.bankLogoPng = CardInfo._getLogo(this.options.banksLogosPath, bankData.logoPng)
      this.bankLogoSvg = CardInfo._getLogo(this.options.banksLogosPath, bankData.logoSvg)
      this.bankLogo = CardInfo._getLogoByPreferredExt(this.bankLogoPng, this.bankLogoSvg, this.options.preferredExt)
      this.bankLogoStyle = bankData.logoStyle
      this.backgroundColor = bankData.backgroundColor
      this.backgroundColors = bankData.backgroundColors
      this.backgroundLightness = bankData.backgroundLightness
      this.textColor = bankData.text
    }

    this.backgroundGradient = CardInfo._getGradient(this.backgroundColors, this.options.gradientDegrees)

    var brandData = CardInfo._getBrand(this.number)
    if (brandData) {
      this.brandAlias = brandData.alias
      this.brandName = brandData.name
      var brandLogoBasename = CardInfo._getBrandLogoBasename(this.brandAlias, this.options.brandLogoPolicy, this.backgroundLightness, this.bankLogoStyle)
      this.brandLogoPng = CardInfo._getLogo(this.options.brandsLogosPath, brandLogoBasename, 'png')
      this.brandLogoSvg = CardInfo._getLogo(this.options.brandsLogosPath, brandLogoBasename, 'svg')
      this.brandLogo = CardInfo._getLogoByPreferredExt(this.brandLogoPng, this.brandLogoSvg, this.options.preferredExt)
      this.codeName = brandData.codeName
      this.codeLength = brandData.codeLength
      this.numberLengths = brandData.lengths
      this.numberGaps = brandData.gaps
    }

    this.numberBlocks = CardInfo._getBlocks(this.numberGaps, this.numberLengths)
    this.numberMask = CardInfo._getMask(this.options.maskDigitSymbol, this.options.maskDelimiterSymbol, this.numberBlocks)
    this.numberNice = CardInfo._getNumberNice(this.number, this.numberGaps)
  }

  CardInfo._defaultProps = {
    bankAlias: null,
    bankName: null,
    bankNameEn: null,
    bankCountry: null,
    bankUrl: null,
    bankLogo: null,
    bankLogoPng: null,
    bankLogoSvg: null,
    bankLogoStyle: null,
    backgroundColor: '#eeeeee',
    backgroundColors: ['#eeeeee', '#dddddd'],
    backgroundLightness: 'light',
    backgroundGradient: null,
    textColor: '#000',
    brandAlias: null,
    brandName: null,
    brandLogo: null,
    brandLogoPng: null,
    brandLogoSvg: null,
    codeName: null,
    codeLength: null,
    numberMask: null,
    numberGaps: [4, 8, 12],
    numberBlocks: null,
    numberLengths: [12, 13, 14, 15, 16, 17, 18, 19],
    numberNice: null,
    number: null,
    numberSource: null,
    options: {}
  }

  CardInfo.defaultOptions = {
    banksLogosPath: '/bower_components/card-info/dist/banks-logos/',
    brandsLogosPath: '/bower_components/card-info/dist/brands-logos/',
    brandLogoPolicy: 'auto',
    preferredExt: 'svg',
    maskDigitSymbol: '0',
    maskDelimiterSymbol: ' ',
    gradientDegrees: 135
  }

  CardInfo._banks = {}

  CardInfo._prefixes = {}

  CardInfo._brands = [
    {
      alias: 'visa',
      name: 'Visa',
      codeName: 'CVV',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16],
      pattern: /^4\d*$/
    },
    {
      alias: 'master-card',
      name: 'MasterCard',
      codeName: 'CVC',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16],
      pattern: /^(5[1-5]|222[1-9]|2[3-6]|27[0-1]|2720)\d*$/
    },
    {
      alias: 'american-express',
      name: 'American Express',
      codeName: 'CID',
      codeLength: 4,
      gaps: [4, 10],
      lengths: [15],
      pattern: /^3[47]\d*$/
    },
    {
      alias: 'diners-club',
      name: 'Diners Club',
      codeName: 'CVV',
      codeLength: 3,
      gaps: [4, 10],
      lengths: [14],
      pattern: /^3(0[0-5]|[689])\d*$/
    },
    {
      alias: 'discover',
      name: 'Discover',
      codeName: 'CID',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16, 19],
      pattern: /^(6011|65|64[4-9])\d*$/
    },
    {
      alias: 'jcb',
      name: 'JCB',
      codeName: 'CVV',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16],
      pattern: /^(2131|1800|35)\d*$/
    },
    {
      alias: 'unionpay',
      name: 'UnionPay',
      codeName: 'CVN',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16, 17, 18, 19],
      pattern: /^62[0-5]\d*$/
    },
    {
      alias: 'maestro',
      name: 'Maestro',
      codeName: 'CVC',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [12, 13, 14, 15, 16, 17, 18, 19],
      pattern: /^(5[0678]|6304|6390|6054|6271|67)\d*$/
    },
    {
      alias: 'mir',
      name: 'MIR',
      codeName: 'CVC',
      codeLength: 3,
      gaps: [4, 8, 12],
      lengths: [16],
      pattern: /^22\d*$/
    }
  ]

  CardInfo._assign = function () {
    var objTarget = arguments[0]
    for (var i = 1; i < arguments.length; i++) {
      var objSource = arguments[i]
      for (var key in objSource) {
        if (objSource.hasOwnProperty(key)) {
          if (objSource[key] instanceof Array) {
            objTarget[key] = CardInfo._assign([], objSource[key])
          } else {
            objTarget[key] = objSource[key]
          }
        }
      }
    }
    return objTarget
  }

  CardInfo._getNumber = function (numberSource) {
    var numberSourceString = numberSource + ''
    return /^[\d ]*$/.test(numberSourceString) ? numberSourceString.replace(/\D/g, '') : ''
  }

  CardInfo._getBank = function (number) {
    if (number.length < 6) return undefined
    var prefix = number.substr(0, 6)
    return this._prefixes[prefix]
      ? this._banks[this._prefixes[prefix]]
      : undefined
  }

  CardInfo._getBrand = function (number) {
    var brands = []
    for (var i = 0; i < this._brands.length; i++) {
      if (this._brands[i].pattern.test(number)) brands.push(this._brands[i])
    }
    if (brands.length === 1) return brands[0]
  }

  CardInfo._getLogo = function (dirname, basename, extname) {
    return basename ? dirname + (extname ? basename + '.' + extname : basename) : null
  }

  CardInfo._getBrandLogoBasename = function (brandAlias, brandLogoPolicy, backgroundLightness, bankLogoStyle) {
    switch (brandLogoPolicy) {
      case 'auto': return brandAlias + '-' + (bankLogoStyle || 'colored')
      case 'colored': return brandAlias + '-colored'
      case 'mono': return brandAlias + (backgroundLightness === 'light' ? '-black' : '-white')
      case 'black': return brandAlias + '-black'
      case 'white': return brandAlias + '-white'
    }
  }

  CardInfo._getLogoByPreferredExt = function (logoPng, logoSvg, preferredExt) {
    if (!logoPng && !logoSvg) return null
    if (!logoPng) return logoSvg
    if (!logoSvg) return logoPng
    return (logoPng.substr(logoPng.length - 3) === preferredExt)
      ? logoPng
      : logoSvg
  }

  CardInfo._getGradient = function (backgroundColors, gradientDegrees) {
    return 'linear-gradient(' + gradientDegrees + 'deg, ' + backgroundColors.join(', ') + ')'
  }

  CardInfo._getBlocks = function (numberGaps, numberLengths) {
    var numberLength = numberLengths[numberLengths.length - 1]
    var blocks = []
    for (var i = numberGaps.length - 1; i >= 0; i--) {
      var blockLength = numberLength - numberGaps[i]
      numberLength -= blockLength
      blocks.push(blockLength)
    }
    blocks.push(numberLength)
    return blocks.reverse()
  }

  CardInfo._getMask = function (maskDigitSymbol, maskDelimiterSymbol, numberBlocks) {
    var mask = ''
    for (var i = 0; i < numberBlocks.length; i++) {
      mask += (i ? maskDelimiterSymbol : '') + Array(numberBlocks[i] + 1).join(maskDigitSymbol)
    }
    return mask
  }

  CardInfo._getNumberNice = function (number, numberGaps) {
    var offsets = [0].concat(numberGaps).concat([number.length])
    var components = []
    for (var i = 0; offsets[i] < number.length; i++) {
      var start = offsets[i]
      var end = Math.min(offsets[i + 1], number.length)
      components.push(number.substring(start, end))
    }
    return components.join(' ')
  }

  CardInfo._addBanks = function (banks) {
    this._assign(this._banks, banks)
  }

  CardInfo._addPrefixes = function (prefixes) {
    this._assign(this._prefixes, prefixes)
  }

  CardInfo.addBanksAndPrefixes = function (banksAndPrefixes) {
    this._addBanks(banksAndPrefixes.banks)
    this._addPrefixes(banksAndPrefixes.prefixes)
  }

  CardInfo.getBanks = function (options) {
    options = CardInfo._assign({}, CardInfo.defaultOptions, options || {})
    var banks = []
    var exts = ['png', 'svg']
    var extsCapitalized = ['Png', 'Svg']
    for (var bi in this._banks) {
      if (this._banks.hasOwnProperty(bi)) {
        var bank = CardInfo._assign({}, this._banks[bi])
        for (var ei = 0; ei < exts.length; ei++) {
          var logoKey = 'logo' + extsCapitalized[ei]
          if (bank[logoKey]) bank[logoKey] = CardInfo._getLogo(options.banksLogosPath, bank[logoKey])
        }
        bank.backgroundGradient = CardInfo._getGradient(bank.backgroundColors, options.gradientDegrees)
        bank.logo = CardInfo._getLogoByPreferredExt(bank.logoPng, bank.logoSvg, options.preferredExt)
        banks.push(bank)
      }
    }
    return banks
  }

  CardInfo.getBrands = function (options) {
    options = CardInfo._assign({}, CardInfo.defaultOptions, options || {})
    var brands = []
    var styles = ['colored', 'black', 'white']
    var exts = ['png', 'svg']
    var stylesCapitalized = ['Colored', 'Black', 'White']
    var extsCapitalized = ['Png', 'Svg']
    for (var bi = 0; bi < this._brands.length; bi++) {
      var brand = CardInfo._assign({}, this._brands[bi])
      brand.blocks = CardInfo._getBlocks(brand.gaps, brand.lengths)
      brand.mask = CardInfo._getMask(options.maskDigitSymbol, options.maskDelimiterSymbol, brand.blocks)
      for (var si = 0; si < styles.length; si++) {
        var logoKey = 'logo' + stylesCapitalized[si]
        for (var ei = 0; ei < exts.length; ei++) {
          brand[logoKey + extsCapitalized[ei]] = CardInfo._getLogo(options.brandsLogosPath, brand.alias + '-' + styles[si], exts[ei])
        }
        brand[logoKey] = CardInfo._getLogoByPreferredExt(brand[logoKey + 'Png'], brand[logoKey + 'Svg'], options.preferredExt)
      }
      brands.push(brand)
    }
    return brands
  }

  CardInfo.setDefaultOptions = function (options) {
    this._assign(CardInfo.defaultOptions, options)
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = CardInfo
    }
    exports.CardInfo = CardInfo
  } else if (typeof window !== 'undefined') {
    window.CardInfo = CardInfo
  }
})()

;(function () {
  var banks = {
    "ru-absolut": {
      "name": "Абсолют Банк",
      "nameEn": "Absolut Bank",
      "url": "http://absolutbank.ru/",
      "backgroundColor": "#fdb89a",
      "backgroundColors": [
        "#fbd6c5",
        "#fdb89a"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#676766",
      "alias": "ru-absolut",
      "country": "ru",
      "logoPng": "ru-absolut.png"
    },
    "ru-akbars": {
      "name": "Ак Барс",
      "nameEn": "AK Bars",
      "url": "https://www.akbars.ru/",
      "backgroundColor": "#01973e",
      "backgroundColors": [
        "#01973e",
        "#04632b"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-akbars",
      "country": "ru",
      "logoPng": "ru-akbars.png"
    },
    "ru-alfa": {
      "name": "Альфа-Банк",
      "nameEn": "Alfa-Bank",
      "url": "https://alfabank.ru/",
      "backgroundColor": "#ef3124",
      "backgroundColors": [
        "#ef3124",
        "#d6180b"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-alfa",
      "country": "ru",
      "logoPng": "ru-alfa.png",
      "logoSvg": "ru-alfa.svg"
    },
    "ru-atb": {
      "name": "Азиатско-Тихоокеанский Банк",
      "nameEn": "Азиатско-Тихоокеанский Банк",
      "url": "https://www.atb.su/",
      "backgroundColor": "#eeeeee",
      "backgroundColors": [
        "#eeeeee",
        "#dea184"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#373a36",
      "alias": "ru-atb",
      "country": "ru",
      "logoPng": "ru-atb.png",
      "logoSvg": "ru-atb.svg"
    },
    "ru-avangard": {
      "name": "Авангард",
      "nameEn": "Avangard",
      "url": "https://www.avangard.ru/",
      "backgroundColor": "#095b34",
      "backgroundColors": [
        "#0f8e52",
        "#095b34"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-avangard",
      "country": "ru",
      "logoPng": "ru-avangard.png"
    },
    "ru-binbank": {
      "name": "Бинбанк",
      "nameEn": "B&N Bank Public",
      "url": "https://www.binbank.ru/",
      "backgroundColor": "#cdeafd",
      "backgroundColors": [
        "#cdeafd",
        "#9cc0d9"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#004c81",
      "alias": "ru-binbank",
      "country": "ru",
      "logoPng": "ru-binbank.png",
      "logoSvg": "ru-binbank.svg"
    },
    "ru-ceb": {
      "name": "Кредит Европа Банк",
      "nameEn": "Credit Europe Bank",
      "url": "https://www.crediteurope.ru/",
      "backgroundColor": "#e0eaf7",
      "backgroundColors": [
        "#e0eaf7",
        "#f7dfdf"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#1c297b",
      "alias": "ru-ceb",
      "country": "ru",
      "logoPng": "ru-ceb.png",
      "logoSvg": "ru-ceb.svg"
    },
    "ru-cetelem": {
      "name": "Сетелем Банк",
      "nameEn": "Cetelem Bank",
      "url": "https://www.cetelem.ru/",
      "backgroundColor": "#ceecb7",
      "backgroundColors": [
        "#ceecb7",
        "#8bbb75"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#167158",
      "alias": "ru-cetelem",
      "country": "ru",
      "logoPng": "ru-cetelem.png",
      "logoSvg": "ru-cetelem.svg"
    },
    "ru-citi": {
      "name": "Ситибанк",
      "nameEn": "Citibank",
      "url": "https://www.citibank.ru/",
      "backgroundColor": "#008bd0",
      "backgroundColors": [
        "#00bcf2",
        "#004e90"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-citi",
      "country": "ru",
      "logoPng": "ru-citi.png",
      "logoSvg": "ru-citi.svg"
    },
    "ru-globex": {
      "name": "Глобэкс",
      "nameEn": "Globexbank",
      "url": "http://www.globexbank.ru/",
      "backgroundColor": "#9bdaff",
      "backgroundColors": [
        "#9bdaff",
        "#ffd2a2"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#072761",
      "alias": "ru-globex",
      "country": "ru",
      "logoPng": "ru-globex.png"
    },
    "ru-gpb": {
      "name": "Газпромбанк",
      "nameEn": "Gazprombank",
      "url": "http://www.gazprombank.ru/",
      "backgroundColor": "#02356c",
      "backgroundColors": [
        "#044b98",
        "#02356c"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-gpb",
      "country": "ru",
      "logoPng": "ru-gpb.png",
      "logoSvg": "ru-gpb.svg"
    },
    "ru-hcf": {
      "name": "Хоум Кредит Банк",
      "nameEn": "HCF Bank",
      "url": "http://homecredit.ru/",
      "backgroundColor": "#e41701",
      "backgroundColors": [
        "#e41701",
        "#bd1908"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-hcf",
      "country": "ru",
      "logoPng": "ru-hcf.png",
      "logoSvg": "ru-hcf.svg"
    },
    "ru-jugra": {
      "name": "Югра",
      "nameEn": "Jugra",
      "url": "http://www.jugra.ru/",
      "backgroundColor": "#d6ffe6",
      "backgroundColors": [
        "#d6ffe6",
        "#fff1e4"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#088237",
      "alias": "ru-jugra",
      "country": "ru",
      "logoPng": "ru-jugra.png"
    },
    "ru-mib": {
      "name": "Московский Индустриальный Банк",
      "nameEn": "Mosсow Industrial Bank",
      "url": "http://www.minbank.ru/",
      "backgroundColor": "#8f0e0f",
      "backgroundColors": [
        "#ce4647",
        "#8f0e0f"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-mib",
      "country": "ru",
      "logoPng": "ru-mib.png"
    },
    "ru-mkb": {
      "name": "Московский Кредитный Банк",
      "nameEn": "Credit Bank of Moscow",
      "url": "https://mkb.ru/",
      "backgroundColor": "#eeeeee",
      "backgroundColors": [
        "#eeeeee",
        "#f9dee8"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#ae0039",
      "alias": "ru-mkb",
      "country": "ru",
      "logoPng": "ru-mkb.png"
    },
    "ru-mob": {
      "name": "Московский Областной Банк",
      "nameEn": "Mosoblbank",
      "url": "http://www.mosoblbank.ru/",
      "backgroundColor": "#dd3c3d",
      "backgroundColors": [
        "#e14041",
        "#8e2222"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-mob",
      "country": "ru",
      "logoPng": "ru-mob.png"
    },
    "ru-mts": {
      "name": "МТС Банк",
      "nameEn": "MTS Bank",
      "url": "http://www.mtsbank.ru/",
      "backgroundColor": "#de1612",
      "backgroundColors": [
        "#ff0000",
        "#ba0e0a"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-mts",
      "country": "ru",
      "logoPng": "ru-mts.png",
      "logoSvg": "ru-mts.svg"
    },
    "ru-novikom": {
      "name": "Новикомбанк",
      "nameEn": "Novikombank",
      "url": "http://www.novikom.ru/",
      "backgroundColor": "#00529b",
      "backgroundColors": [
        "#00529b",
        "#0a4477"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-novikom",
      "country": "ru",
      "logoPng": "ru-novikom.png",
      "logoSvg": "ru-novikom.svg"
    },
    "ru-open": {
      "name": "ФК Открытие",
      "nameEn": "Otkritie FC",
      "url": "https://www.open.ru/",
      "backgroundColor": "#00b3e1",
      "backgroundColors": [
        "#29c9f3",
        "#00b3e1"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-open",
      "country": "ru",
      "logoPng": "ru-open.png",
      "logoSvg": "ru-open.svg"
    },
    "ru-otp": {
      "name": "ОТП Банк",
      "nameEn": "OTP Bank",
      "url": "https://www.otpbank.ru/",
      "backgroundColor": "#acff90",
      "backgroundColors": [
        "#acff90",
        "#9edabf"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#006437",
      "alias": "ru-otp",
      "country": "ru",
      "logoPng": "ru-otp.png",
      "logoSvg": "ru-otp.svg"
    },
    "ru-pochta": {
      "name": "Почта Банк",
      "nameEn": "Pochtabank",
      "url": "https://www.pochtabank.ru/",
      "backgroundColor": "#efefef",
      "backgroundColors": [
        "#efefef",
        "#dbe1ff"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#001689",
      "alias": "ru-pochta",
      "country": "ru",
      "logoPng": "ru-pochta.png",
      "logoSvg": "ru-pochta.svg"
    },
    "ru-psb": {
      "name": "Промсвязьбанк",
      "nameEn": "Promsvyazbank",
      "url": "http://www.psbank.ru/",
      "backgroundColor": "#c5cfef",
      "backgroundColors": [
        "#f7d1b5",
        "#c5cfef"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#274193",
      "alias": "ru-psb",
      "country": "ru",
      "logoPng": "ru-psb.png",
      "logoSvg": "ru-psb.svg"
    },
    "ru-raiffeisen": {
      "name": "Райффайзенбанк",
      "nameEn": "Raiffeisenbank bank",
      "url": "https://www.raiffeisen.ru/",
      "backgroundColor": "#efe6a2",
      "backgroundColors": [
        "#eeeeee",
        "#efe6a2"
      ],
      "backgroundLightness": "light",
      "logoStyle": "black",
      "text": "#000",
      "alias": "ru-raiffeisen",
      "country": "ru",
      "logoPng": "ru-raiffeisen.png",
      "logoSvg": "ru-raiffeisen.svg"
    },
    "ru-reb": {
      "name": "РосЕвроБанк",
      "nameEn": "Rosevrobank",
      "url": "http://www.rosevrobank.ru/",
      "backgroundColor": "#4b1650",
      "backgroundColors": [
        "#8b2d8e",
        "#4b1650"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-reb",
      "country": "ru",
      "logoPng": "ru-reb.png"
    },
    "ru-ren": {
      "name": "Ренессанс Кредит",
      "nameEn": "Renaissance Capital",
      "url": "https://rencredit.ru/",
      "backgroundColor": "#ffe6f1",
      "backgroundColors": [
        "#ffe6f1",
        "#f9fff1"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#439539",
      "alias": "ru-ren",
      "country": "ru",
      "logoPng": "ru-ren.png"
    },
    "ru-rgs": {
      "name": "Росгосстрах Банк",
      "nameEn": "Rosgosstrakh Bank",
      "url": "https://www.rgsbank.ru/",
      "backgroundColor": "#b31b2c",
      "backgroundColors": [
        "#b31b2c",
        "#6f030f"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "colored",
      "text": "#ffe2b8",
      "alias": "ru-rgs",
      "country": "ru",
      "logoPng": "ru-rgs.png",
      "logoSvg": "ru-rgs.svg"
    },
    "ru-rosbank": {
      "name": "Росбанк",
      "nameEn": "Rosbank bank",
      "url": "http://www.rosbank.ru/",
      "backgroundColor": "#d3b9ba",
      "backgroundColors": [
        "#d3b9ba",
        "#b1898b"
      ],
      "backgroundLightness": "light",
      "logoStyle": "black",
      "text": "#000",
      "alias": "ru-rosbank",
      "country": "ru",
      "logoPng": "ru-rosbank.png",
      "logoSvg": "ru-rosbank.svg"
    },
    "ru-roscap": {
      "name": "Российский Капитал",
      "nameEn": "Rossiysky Capital",
      "url": "http://www.roscap.ru/",
      "backgroundColor": "#ffdcc1",
      "backgroundColors": [
        "#ffdcc1",
        "#ffced0"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#000",
      "alias": "ru-roscap",
      "country": "ru",
      "logoPng": "ru-roscap.png"
    },
    "ru-rossiya": {
      "name": "Россия",
      "nameEn": "Rossiya",
      "url": "http://www.abr.ru/",
      "backgroundColor": "#eeeeee",
      "backgroundColors": [
        "#eeeeee",
        "#98c2dd"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#07476e",
      "alias": "ru-rossiya",
      "country": "ru",
      "logoPng": "ru-rossiya.png"
    },
    "ru-rsb": {
      "name": "Русский Стандарт",
      "nameEn": "Russian Standard Bank",
      "url": "https://www.rsb.ru/",
      "backgroundColor": "#414042",
      "backgroundColors": [
        "#6a656f",
        "#414042"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-rsb",
      "country": "ru",
      "logoPng": "ru-rsb.png",
      "logoSvg": "ru-rsb.svg"
    },
    "ru-rshb": {
      "name": "Россельхозбанк",
      "nameEn": "Rosselkhozbank",
      "url": "http://www.rshb.ru/",
      "backgroundColor": "#007f2b",
      "backgroundColors": [
        "#007f2b",
        "#005026"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#ffcd00",
      "alias": "ru-rshb",
      "country": "ru",
      "logoPng": "ru-rshb.png",
      "logoSvg": "ru-rshb.svg"
    },
    "ru-sberbank": {
      "name": "Сбербанк России",
      "nameEn": "Sberbank",
      "url": "https://www.sberbank.ru/",
      "backgroundColor": "#1a9f29",
      "backgroundColors": [
        "#1a9f29",
        "#0d7518"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-sberbank",
      "country": "ru",
      "logoPng": "ru-sberbank.png",
      "logoSvg": "ru-sberbank.svg"
    },
    "ru-skb": {
      "name": "СКБ-Банк",
      "nameEn": "SKB-Bank",
      "url": "http://www.skbbank.ru/",
      "backgroundColor": "#006b5a",
      "backgroundColors": [
        "#31a899",
        "#006b5a"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-skb",
      "country": "ru",
      "logoPng": "ru-skb.png"
    },
    "ru-smp": {
      "name": "СМП Банк",
      "nameEn": "SMP Bank",
      "url": "http://smpbank.ru/",
      "backgroundColor": "#9fe5ff",
      "backgroundColors": [
        "#9fe5ff",
        "#5ea6d6"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#005288",
      "alias": "ru-smp",
      "country": "ru",
      "logoPng": "ru-smp.png",
      "logoSvg": "ru-smp.svg"
    },
    "ru-sovkom": {
      "name": "Совкомбанк",
      "nameEn": "Sovcombank bank",
      "url": "https://sovcombank.ru/",
      "backgroundColor": "#c9e4f6",
      "backgroundColors": [
        "#c9e4f6",
        "#f5fafd"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#004281",
      "alias": "ru-sovkom",
      "country": "ru",
      "logoPng": "ru-sovkom.png"
    },
    "ru-spb": {
      "name": "Банк «Санкт-Петербург»",
      "nameEn": "Bank Saint Petersburg",
      "url": "https://www.bspb.ru/",
      "backgroundColor": "#ffcfcf",
      "backgroundColors": [
        "#ffcfcf",
        "#d2553f"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#000",
      "alias": "ru-spb",
      "country": "ru",
      "logoPng": "ru-spb.png"
    },
    "ru-sviaz": {
      "name": "Связь-Банк",
      "nameEn": "Sviaz-Bank",
      "url": "https://www.sviaz-bank.ru/",
      "backgroundColor": "#d2e0ec",
      "backgroundColors": [
        "#d2e0ec",
        "#caecd8"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#165a9a",
      "alias": "ru-sviaz",
      "country": "ru",
      "logoPng": "ru-sviaz.png"
    },
    "ru-tcb": {
      "name": "Транскапиталбанк",
      "nameEn": "Transcapitalbank",
      "url": "https://www.tkbbank.ru/",
      "backgroundColor": "#8cf5f4",
      "backgroundColors": [
        "#8cf5f4",
        "#ffe6bf"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#005599",
      "alias": "ru-tcb",
      "country": "ru",
      "logoPng": "ru-tcb.png"
    },
    "ru-tinkoff": {
      "name": "Тинькофф Банк",
      "nameEn": "Tinkoff Bank",
      "url": "https://www.tinkoff.ru/",
      "backgroundColor": "#333",
      "backgroundColors": [
        "#444",
        "#222"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-tinkoff",
      "country": "ru",
      "logoPng": "ru-tinkoff.png",
      "logoSvg": "ru-tinkoff.svg"
    },
    "ru-trust": {
      "name": "Траст",
      "nameEn": "Trust",
      "url": "http://www.trust.ru/",
      "backgroundColor": "#231f20",
      "backgroundColors": [
        "#403739",
        "#231f20"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-trust",
      "country": "ru",
      "logoPng": "ru-trust.png"
    },
    "ru-ubrd": {
      "name": "Уральский Банк Реконструкции и Развития",
      "nameEn": "UBRD",
      "url": "http://www.ubrr.ru/",
      "backgroundColor": "#ffd9e4",
      "backgroundColors": [
        "#ffd9e4",
        "#b6d1e3"
      ],
      "backgroundLightness": "light",
      "logoStyle": "black",
      "text": "#000",
      "alias": "ru-ubrd",
      "country": "ru",
      "logoPng": "ru-ubrd.png"
    },
    "ru-ucb": {
      "name": "ЮниКредит Банк",
      "nameEn": "UniCredit Bank",
      "url": "https://www.unicreditbank.ru/",
      "backgroundColor": "#250c0c",
      "backgroundColors": [
        "#402727",
        "#250c0c"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-ucb",
      "country": "ru",
      "logoPng": "ru-ucb.png",
      "logoSvg": "ru-ucb.svg"
    },
    "ru-uralsib": {
      "name": "Банк Уралсиб",
      "nameEn": "Uralsib",
      "url": "https://www.uralsib.ru/",
      "backgroundColor": "#2c4257",
      "backgroundColors": [
        "#6289aa",
        "#2c4257"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-uralsib",
      "country": "ru",
      "logoPng": "ru-uralsib.png",
      "logoSvg": "ru-uralsib.svg"
    },
    "ru-vbrr": {
      "name": "Всероссийский Банк Развития Регионов",
      "nameEn": "Russian Regional Development Bank",
      "url": "https://www.vbrr.ru/",
      "backgroundColor": "#173e6d",
      "backgroundColors": [
        "#4a5e75",
        "#173e6d"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-vbrr",
      "country": "ru",
      "logoPng": "ru-vbrr.png",
      "logoSvg": "ru-vbrr.svg"
    },
    "ru-veb": {
      "name": "Восточный Экспресс Банк",
      "nameEn": "Eastern Express Bank",
      "url": "https://www.vostbank.ru/",
      "backgroundColor": "#004e96",
      "backgroundColors": [
        "#004e96",
        "#ee3224"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-veb",
      "country": "ru",
      "logoPng": "ru-veb.png",
      "logoSvg": "ru-veb.svg"
    },
    "ru-vozrozhdenie": {
      "name": "Возрождение",
      "nameEn": "Bank Vozrozhdenie",
      "url": "http://www.vbank.ru/",
      "backgroundColor": "#cedae6",
      "backgroundColors": [
        "#cedae6",
        "#a4abb3"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#13427b",
      "alias": "ru-vozrozhdenie",
      "country": "ru",
      "logoPng": "ru-vozrozhdenie.png",
      "logoSvg": "ru-vozrozhdenie.svg"
    },
    "ru-vtb": {
      "name": "ВТБ Банк Москвы",
      "nameEn": "VTB Bank",
      "url": "http://www.vtb.ru/",
      "backgroundColor": "#1d2d70",
      "backgroundColors": [
        "#264489",
        "#1d2d70"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-vtb",
      "country": "ru",
      "logoPng": "ru-vtb.png",
      "logoSvg": "ru-vtb.svg"
    },
    "ru-vtb24": {
      "name": "ВТБ 24",
      "nameEn": "VTB 24",
      "url": "https://www.vtb24.ru/",
      "backgroundColor": "#c4cde4",
      "backgroundColors": [
        "#c4cde4",
        "#9fabcc",
        "#dca9ad"
      ],
      "backgroundLightness": "light",
      "logoStyle": "colored",
      "text": "#0a2972",
      "alias": "ru-vtb24",
      "country": "ru",
      "logoPng": "ru-vtb24.png"
    },
    "ru-zenit": {
      "name": "Зенит",
      "nameEn": "Zenit",
      "url": "https://www.zenit.ru/",
      "backgroundColor": "#008c99",
      "backgroundColors": [
        "#3fc2ce",
        "#008c99"
      ],
      "backgroundLightness": "dark",
      "logoStyle": "white",
      "text": "#fff",
      "alias": "ru-zenit",
      "country": "ru",
      "logoPng": "ru-zenit.png",
      "logoSvg": "ru-zenit.svg"
    }
  }
  var prefixes = {
    "220001": "ru-gpb",
    "220003": "ru-psb",
    "220006": "ru-sviaz",
    "220008": "ru-rossiya",
    "220020": "ru-mib",
    "220022": "ru-binbank",
    "220023": "ru-avangard",
    "220030": "ru-raiffeisen",
    "220488": "ru-smp",
    "360769": "ru-rsb",
    "375117": "ru-rsb",
    "400079": "ru-akbars",
    "400171": "ru-reb",
    "400244": "ru-uralsib",
    "400812": "ru-rosbank",
    "400814": "ru-rosbank",
    "400866": "ru-rosbank",
    "401173": "ru-open",
    "402107": "ru-vtb",
    "402177": "ru-raiffeisen",
    "402178": "ru-raiffeisen",
    "402179": "ru-raiffeisen",
    "402311": "ru-otp",
    "402312": "ru-otp",
    "402313": "ru-otp",
    "402326": "ru-mib",
    "402327": "ru-mib",
    "402328": "ru-mib",
    "402333": "ru-sberbank",
    "402429": "ru-globex",
    "402457": "ru-novikom",
    "402507": "ru-psb",
    "402532": "ru-sovkom",
    "402533": "ru-sovkom",
    "402534": "ru-sovkom",
    "402549": "ru-mib",
    "402877": "ru-tcb",
    "402909": "ru-novikom",
    "402910": "ru-novikom",
    "402911": "ru-novikom",
    "402948": "ru-binbank",
    "402949": "ru-binbank",
    "403184": "ru-vozrozhdenie",
    "403218": "ru-roscap",
    "403324": "ru-globex",
    "403780": "ru-mkb",
    "403894": "ru-binbank",
    "403896": "ru-avangard",
    "403897": "ru-avangard",
    "403898": "ru-avangard",
    "404111": "ru-uralsib",
    "404114": "ru-avangard",
    "404136": "ru-gpb",
    "404204": "ru-mts",
    "404224": "ru-mts",
    "404266": "ru-mts",
    "404267": "ru-mts",
    "404268": "ru-mts",
    "404269": "ru-mts",
    "404270": "ru-gpb",
    "404586": "ru-open",
    "404807": "ru-raiffeisen",
    "404862": "ru-rosbank",
    "404863": "ru-rosbank",
    "404885": "ru-raiffeisen",
    "404890": "ru-rosbank",
    "404892": "ru-rosbank",
    "404906": "ru-psb",
    "405225": "ru-binbank",
    "405226": "ru-binbank",
    "405436": "ru-rosbank",
    "405658": "ru-open",
    "405665": "ru-roscap",
    "405666": "ru-roscap",
    "405667": "ru-roscap",
    "405669": "ru-roscap",
    "405870": "ru-open",
    "405990": "ru-pochta",
    "405991": "ru-pochta",
    "405992": "ru-pochta",
    "405993": "ru-pochta",
    "406140": "ru-vbrr",
    "406141": "ru-vbrr",
    "406356": "ru-mts",
    "406364": "ru-hcf",
    "406372": "ru-absolut",
    "406744": "ru-vtb24",
    "406767": "ru-rosbank",
    "406777": "ru-jugra",
    "406778": "ru-jugra",
    "406779": "ru-jugra",
    "406780": "ru-jugra",
    "406781": "ru-jugra",
    "406977": "ru-vtb24",
    "407178": "ru-open",
    "407564": "ru-rosbank",
    "408373": "ru-ceb",
    "408396": "ru-alfa",
    "408397": "ru-alfa",
    "409356": "ru-open",
    "409357": "ru-open",
    "409358": "ru-open",
    "409398": "ru-vtb24",
    "409681": "ru-otp",
    "409682": "ru-uralsib",
    "409794": "ru-binbank",
    "410085": "ru-binbank",
    "410086": "ru-binbank",
    "410213": "ru-uralsib",
    "410323": "ru-trust",
    "410584": "ru-alfa",
    "410695": "ru-skb",
    "410696": "ru-skb",
    "410730": "ru-vozrozhdenie",
    "410731": "ru-vozrozhdenie",
    "411641": "ru-binbank",
    "411647": "ru-ceb",
    "411648": "ru-ceb",
    "411649": "ru-ceb",
    "411669": "ru-mob",
    "411670": "ru-mob",
    "411671": "ru-mob",
    "411676": "ru-spb",
    "411790": "ru-rsb",
    "411791": "ru-psb",
    "411900": "ru-trust",
    "411945": "ru-roscap",
    "412434": "ru-zenit",
    "412519": "ru-rosbank",
    "412746": "ru-binbank",
    "412776": "ru-citi",
    "413047": "ru-ucb",
    "413052": "ru-vozrozhdenie",
    "413203": "ru-vbrr",
    "413204": "ru-vbrr",
    "413205": "ru-vbrr",
    "413877": "ru-skb",
    "413878": "ru-skb",
    "413879": "ru-skb",
    "414035": "ru-vozrozhdenie",
    "414076": "ru-open",
    "414379": "ru-rosbank",
    "414563": "ru-roscap",
    "414656": "ru-zenit",
    "414657": "ru-zenit",
    "414658": "ru-zenit",
    "414659": "ru-zenit",
    "415025": "ru-ubrd",
    "415400": "ru-alfa",
    "415428": "ru-alfa",
    "415429": "ru-alfa",
    "415430": "ru-raiffeisen",
    "415481": "ru-alfa",
    "415482": "ru-alfa",
    "415822": "ru-reb",
    "416132": "ru-absolut",
    "416700": "ru-binbank",
    "416701": "ru-binbank",
    "416702": "ru-binbank",
    "416703": "ru-binbank",
    "416790": "ru-binbank",
    "416791": "ru-binbank",
    "416792": "ru-binbank",
    "416920": "ru-ceb",
    "416927": "ru-vtb",
    "416928": "ru-vtb",
    "416982": "ru-rgs",
    "416983": "ru-rgs",
    "416984": "ru-rgs",
    "417250": "ru-rsb",
    "417251": "ru-rsb",
    "417252": "ru-rsb",
    "417253": "ru-rsb",
    "417254": "ru-rsb",
    "417291": "ru-rsb",
    "417398": "ru-sberbank",
    "417689": "ru-binbank",
    "418260": "ru-vtb",
    "418261": "ru-vtb",
    "418262": "ru-vtb",
    "418362": "ru-sovkom",
    "418363": "ru-sovkom",
    "418364": "ru-sovkom",
    "418384": "ru-rshb",
    "418385": "ru-rshb",
    "418386": "ru-rshb",
    "418387": "ru-rshb",
    "418388": "ru-rshb",
    "418831": "ru-vtb24",
    "418906": "ru-reb",
    "418907": "ru-reb",
    "418908": "ru-reb",
    "418909": "ru-reb",
    "419149": "ru-atb",
    "419150": "ru-atb",
    "419151": "ru-atb",
    "419152": "ru-atb",
    "419153": "ru-atb",
    "419163": "ru-avangard",
    "419164": "ru-avangard",
    "419292": "ru-mkb",
    "419293": "ru-citi",
    "419349": "ru-citi",
    "419370": "ru-uralsib",
    "419519": "ru-binbank",
    "419539": "ru-alfa",
    "419540": "ru-alfa",
    "419636": "ru-otp",
    "419718": "ru-rsb",
    "419804": "ru-uralsib",
    "419805": "ru-uralsib",
    "419810": "ru-uralsib",
    "419905": "ru-rossiya",
    "420336": "ru-absolut",
    "420337": "ru-absolut",
    "420705": "ru-raiffeisen",
    "421179": "ru-citi",
    "421394": "ru-rosbank",
    "421398": "ru-gpb",
    "421637": "ru-sovkom",
    "421647": "ru-sovkom",
    "421648": "ru-rosbank",
    "421651": "ru-binbank",
    "421919": "ru-absolut",
    "422096": "ru-sovkom",
    "422097": "ru-sovkom",
    "422098": "ru-binbank",
    "422104": "ru-binbank",
    "422105": "ru-binbank",
    "422287": "ru-raiffeisen",
    "422372": "ru-uralsib",
    "422608": "ru-rshb",
    "422838": "ru-vozrozhdenie",
    "422839": "ru-vozrozhdenie",
    "423078": "ru-sberbank",
    "423169": "ru-rosbank",
    "423197": "ru-spb",
    "423218": "ru-vozrozhdenie",
    "423569": "ru-absolut",
    "424204": "ru-uralsib",
    "424205": "ru-uralsib",
    "424206": "ru-uralsib",
    "424207": "ru-uralsib",
    "424290": "ru-uralsib",
    "424291": "ru-uralsib",
    "424436": "ru-akbars",
    "424437": "ru-akbars",
    "424438": "ru-akbars",
    "424439": "ru-akbars",
    "424440": "ru-akbars",
    "424473": "ru-uralsib",
    "424474": "ru-uralsib",
    "424475": "ru-uralsib",
    "424476": "ru-uralsib",
    "424553": "ru-trust",
    "424554": "ru-trust",
    "424555": "ru-trust",
    "424561": "ru-psb",
    "424562": "ru-psb",
    "424563": "ru-psb",
    "424901": "ru-sovkom",
    "424917": "ru-gpb",
    "424944": "ru-sovkom",
    "424974": "ru-gpb",
    "424975": "ru-gpb",
    "424976": "ru-gpb",
    "425153": "ru-rosbank",
    "425534": "ru-veb",
    "425535": "ru-veb",
    "425553": "ru-veb",
    "425620": "ru-raiffeisen",
    "425693": "ru-smp",
    "425694": "ru-smp",
    "425695": "ru-smp",
    "425696": "ru-smp",
    "425874": "ru-binbank",
    "425884": "ru-raiffeisen",
    "425885": "ru-raiffeisen",
    "426101": "ru-alfa",
    "426102": "ru-alfa",
    "426113": "ru-alfa",
    "426114": "ru-alfa",
    "426201": "ru-trust",
    "426334": "ru-trust",
    "426335": "ru-trust",
    "426390": "ru-uralsib",
    "426396": "ru-uralsib",
    "426803": "ru-psb",
    "426804": "ru-psb",
    "426809": "ru-rossiya",
    "426810": "ru-rossiya",
    "426811": "ru-rossiya",
    "426812": "ru-rossiya",
    "426813": "ru-rossiya",
    "426814": "ru-rossiya",
    "426815": "ru-rossiya",
    "426890": "ru-gpb",
    "427229": "ru-vtb24",
    "427230": "ru-vtb24",
    "427326": "ru-gpb",
    "427400": "ru-sberbank",
    "427401": "ru-sberbank",
    "427402": "ru-sberbank",
    "427403": "ru-sberbank",
    "427404": "ru-sberbank",
    "427405": "ru-sberbank",
    "427406": "ru-sberbank",
    "427407": "ru-sberbank",
    "427408": "ru-sberbank",
    "427409": "ru-sberbank",
    "427410": "ru-sberbank",
    "427411": "ru-sberbank",
    "427412": "ru-sberbank",
    "427413": "ru-sberbank",
    "427414": "ru-sberbank",
    "427415": "ru-sberbank",
    "427416": "ru-sberbank",
    "427417": "ru-sberbank",
    "427418": "ru-sberbank",
    "427419": "ru-sberbank",
    "427420": "ru-sberbank",
    "427421": "ru-sberbank",
    "427422": "ru-sberbank",
    "427423": "ru-sberbank",
    "427424": "ru-sberbank",
    "427425": "ru-sberbank",
    "427426": "ru-sberbank",
    "427427": "ru-sberbank",
    "427428": "ru-sberbank",
    "427429": "ru-sberbank",
    "427430": "ru-sberbank",
    "427431": "ru-sberbank",
    "427432": "ru-sberbank",
    "427433": "ru-sberbank",
    "427434": "ru-sberbank",
    "427435": "ru-sberbank",
    "427436": "ru-sberbank",
    "427437": "ru-sberbank",
    "427438": "ru-sberbank",
    "427439": "ru-sberbank",
    "427440": "ru-sberbank",
    "427441": "ru-sberbank",
    "427442": "ru-sberbank",
    "427443": "ru-sberbank",
    "427444": "ru-sberbank",
    "427445": "ru-sberbank",
    "427446": "ru-sberbank",
    "427447": "ru-sberbank",
    "427448": "ru-sberbank",
    "427449": "ru-sberbank",
    "427450": "ru-sberbank",
    "427451": "ru-sberbank",
    "427452": "ru-sberbank",
    "427453": "ru-sberbank",
    "427454": "ru-sberbank",
    "427455": "ru-sberbank",
    "427456": "ru-sberbank",
    "427457": "ru-sberbank",
    "427458": "ru-sberbank",
    "427459": "ru-sberbank",
    "427460": "ru-sberbank",
    "427461": "ru-sberbank",
    "427462": "ru-sberbank",
    "427463": "ru-sberbank",
    "427464": "ru-sberbank",
    "427465": "ru-sberbank",
    "427466": "ru-sberbank",
    "427467": "ru-sberbank",
    "427468": "ru-sberbank",
    "427469": "ru-sberbank",
    "427470": "ru-sberbank",
    "427471": "ru-sberbank",
    "427472": "ru-sberbank",
    "427473": "ru-sberbank",
    "427474": "ru-sberbank",
    "427475": "ru-sberbank",
    "427476": "ru-sberbank",
    "427477": "ru-sberbank",
    "427491": "ru-sberbank",
    "427499": "ru-sberbank",
    "427600": "ru-sberbank",
    "427601": "ru-sberbank",
    "427602": "ru-sberbank",
    "427603": "ru-sberbank",
    "427604": "ru-sberbank",
    "427605": "ru-sberbank",
    "427606": "ru-sberbank",
    "427607": "ru-sberbank",
    "427608": "ru-sberbank",
    "427609": "ru-sberbank",
    "427610": "ru-sberbank",
    "427611": "ru-sberbank",
    "427612": "ru-sberbank",
    "427613": "ru-sberbank",
    "427614": "ru-sberbank",
    "427615": "ru-sberbank",
    "427616": "ru-sberbank",
    "427617": "ru-sberbank",
    "427618": "ru-sberbank",
    "427619": "ru-sberbank",
    "427620": "ru-sberbank",
    "427621": "ru-sberbank",
    "427622": "ru-sberbank",
    "427623": "ru-sberbank",
    "427624": "ru-sberbank",
    "427625": "ru-sberbank",
    "427626": "ru-sberbank",
    "427627": "ru-sberbank",
    "427628": "ru-sberbank",
    "427629": "ru-sberbank",
    "427630": "ru-sberbank",
    "427631": "ru-sberbank",
    "427632": "ru-sberbank",
    "427633": "ru-sberbank",
    "427634": "ru-sberbank",
    "427635": "ru-sberbank",
    "427636": "ru-sberbank",
    "427637": "ru-sberbank",
    "427638": "ru-sberbank",
    "427639": "ru-sberbank",
    "427640": "ru-sberbank",
    "427641": "ru-sberbank",
    "427642": "ru-sberbank",
    "427643": "ru-sberbank",
    "427644": "ru-sberbank",
    "427645": "ru-sberbank",
    "427646": "ru-sberbank",
    "427647": "ru-sberbank",
    "427648": "ru-sberbank",
    "427649": "ru-sberbank",
    "427650": "ru-sberbank",
    "427651": "ru-sberbank",
    "427652": "ru-sberbank",
    "427653": "ru-sberbank",
    "427654": "ru-sberbank",
    "427655": "ru-sberbank",
    "427656": "ru-sberbank",
    "427657": "ru-sberbank",
    "427658": "ru-sberbank",
    "427659": "ru-sberbank",
    "427660": "ru-sberbank",
    "427661": "ru-sberbank",
    "427662": "ru-sberbank",
    "427663": "ru-sberbank",
    "427664": "ru-sberbank",
    "427665": "ru-sberbank",
    "427666": "ru-sberbank",
    "427667": "ru-sberbank",
    "427668": "ru-sberbank",
    "427669": "ru-sberbank",
    "427670": "ru-sberbank",
    "427671": "ru-sberbank",
    "427672": "ru-sberbank",
    "427673": "ru-sberbank",
    "427674": "ru-sberbank",
    "427675": "ru-sberbank",
    "427676": "ru-sberbank",
    "427677": "ru-sberbank",
    "427678": "ru-sberbank",
    "427679": "ru-sberbank",
    "427680": "ru-sberbank",
    "427681": "ru-sberbank",
    "427682": "ru-sberbank",
    "427683": "ru-sberbank",
    "427684": "ru-sberbank",
    "427685": "ru-sberbank",
    "427686": "ru-sberbank",
    "427687": "ru-sberbank",
    "427688": "ru-sberbank",
    "427689": "ru-sberbank",
    "427690": "ru-sberbank",
    "427692": "ru-sberbank",
    "427693": "ru-sberbank",
    "427694": "ru-sberbank",
    "427695": "ru-sberbank",
    "427696": "ru-sberbank",
    "427697": "ru-sberbank",
    "427699": "ru-sberbank",
    "427714": "ru-alfa",
    "427715": "ru-rosbank",
    "427725": "ru-binbank",
    "427760": "ru-citi",
    "427761": "ru-citi",
    "427806": "ru-roscap",
    "427807": "ru-roscap",
    "427808": "ru-roscap",
    "427827": "ru-uralsib",
    "427828": "ru-uralsib",
    "427853": "ru-sovkom",
    "427900": "ru-sberbank",
    "427901": "ru-sberbank",
    "427902": "ru-sberbank",
    "427903": "ru-sberbank",
    "427904": "ru-sberbank",
    "427905": "ru-sberbank",
    "427906": "ru-sberbank",
    "427907": "ru-sberbank",
    "427908": "ru-sberbank",
    "427909": "ru-sberbank",
    "427910": "ru-sberbank",
    "427911": "ru-sberbank",
    "427912": "ru-sberbank",
    "427913": "ru-sberbank",
    "427914": "ru-sberbank",
    "427915": "ru-sberbank",
    "427916": "ru-sberbank",
    "427917": "ru-sberbank",
    "427918": "ru-sberbank",
    "427919": "ru-sberbank",
    "427920": "ru-sberbank",
    "427921": "ru-sberbank",
    "427922": "ru-sberbank",
    "427923": "ru-sberbank",
    "427924": "ru-sberbank",
    "427925": "ru-sberbank",
    "427926": "ru-sberbank",
    "427927": "ru-sberbank",
    "427928": "ru-sberbank",
    "427929": "ru-sberbank",
    "427930": "ru-sberbank",
    "427931": "ru-sberbank",
    "427932": "ru-sberbank",
    "427933": "ru-sberbank",
    "427934": "ru-sberbank",
    "427935": "ru-sberbank",
    "427936": "ru-sberbank",
    "427937": "ru-sberbank",
    "427938": "ru-sberbank",
    "427939": "ru-sberbank",
    "427940": "ru-sberbank",
    "427941": "ru-sberbank",
    "427942": "ru-sberbank",
    "427943": "ru-sberbank",
    "427944": "ru-sberbank",
    "427945": "ru-sberbank",
    "427946": "ru-sberbank",
    "427947": "ru-sberbank",
    "427948": "ru-sberbank",
    "427949": "ru-sberbank",
    "427950": "ru-sberbank",
    "427951": "ru-sberbank",
    "427952": "ru-sberbank",
    "427953": "ru-sberbank",
    "427954": "ru-sberbank",
    "427955": "ru-sberbank",
    "427956": "ru-sberbank",
    "427957": "ru-sberbank",
    "427958": "ru-sberbank",
    "427959": "ru-sberbank",
    "427960": "ru-sberbank",
    "427961": "ru-sberbank",
    "427962": "ru-sberbank",
    "427963": "ru-sberbank",
    "427964": "ru-sberbank",
    "427965": "ru-sberbank",
    "427966": "ru-sberbank",
    "427967": "ru-sberbank",
    "427968": "ru-sberbank",
    "427969": "ru-sberbank",
    "427970": "ru-sberbank",
    "427971": "ru-sberbank",
    "427972": "ru-sberbank",
    "427973": "ru-sberbank",
    "427974": "ru-sberbank",
    "427975": "ru-sberbank",
    "427976": "ru-sberbank",
    "427977": "ru-sberbank",
    "427978": "ru-sberbank",
    "427979": "ru-sberbank",
    "427980": "ru-sberbank",
    "427981": "ru-sberbank",
    "427982": "ru-sberbank",
    "427983": "ru-sberbank",
    "427984": "ru-sberbank",
    "427985": "ru-sberbank",
    "427986": "ru-sberbank",
    "427987": "ru-sberbank",
    "427988": "ru-sberbank",
    "427989": "ru-sberbank",
    "427990": "ru-sberbank",
    "427991": "ru-sberbank",
    "427992": "ru-sberbank",
    "427993": "ru-sberbank",
    "427994": "ru-sberbank",
    "427995": "ru-sberbank",
    "427996": "ru-sberbank",
    "427997": "ru-sberbank",
    "427998": "ru-sberbank",
    "427999": "ru-sberbank",
    "428252": "ru-absolut",
    "428253": "ru-absolut",
    "428254": "ru-absolut",
    "428266": "ru-zenit",
    "428666": "ru-atb",
    "428804": "ru-alfa",
    "428905": "ru-alfa",
    "428906": "ru-alfa",
    "428925": "ru-spb",
    "429015": "ru-veb",
    "429016": "ru-veb",
    "429037": "ru-open",
    "429038": "ru-open",
    "429039": "ru-open",
    "429040": "ru-open",
    "429096": "ru-open",
    "429196": "ru-uralsib",
    "429197": "ru-uralsib",
    "429565": "ru-vtb24",
    "429749": "ru-vtb24",
    "429796": "ru-zenit",
    "429797": "ru-zenit",
    "429798": "ru-zenit",
    "429811": "ru-uralsib",
    "430081": "ru-rosbank",
    "430088": "ru-rosbank",
    "430180": "ru-ubrd",
    "430181": "ru-ubrd",
    "430289": "ru-sviaz",
    "430299": "ru-gpb",
    "430323": "ru-ucb",
    "430439": "ru-ubrd",
    "430708": "ru-rossiya",
    "430709": "ru-rossiya",
    "431112": "ru-uralsib",
    "431113": "ru-uralsib",
    "431114": "ru-uralsib",
    "431165": "ru-open",
    "431166": "ru-open",
    "431359": "ru-rgs",
    "431416": "ru-alfa",
    "431417": "ru-alfa",
    "431727": "ru-alfa",
    "431854": "ru-ren",
    "431855": "ru-ren",
    "431856": "ru-ren",
    "431857": "ru-ren",
    "431890": "ru-ren",
    "432050": "ru-globex",
    "432058": "ru-skb",
    "432158": "ru-ceb",
    "432169": "ru-uralsib",
    "432259": "ru-uralsib",
    "432260": "ru-uralsib",
    "432417": "ru-open",
    "432498": "ru-raiffeisen",
    "432560": "ru-ucb",
    "432638": "ru-rosbank",
    "432947": "ru-otp",
    "432948": "ru-otp",
    "432949": "ru-otp",
    "433011": "ru-uralsib",
    "433102": "ru-vozrozhdenie",
    "433300": "ru-ucb",
    "433316": "ru-gpb",
    "433336": "ru-ucb",
    "434135": "ru-alfa",
    "434146": "ru-open",
    "434147": "ru-open",
    "434148": "ru-open",
    "434149": "ru-uralsib",
    "435139": "ru-ubrd",
    "435986": "ru-rshb",
    "436100": "ru-rshb",
    "436104": "ru-rshb",
    "436398": "ru-novikom",
    "436865": "ru-otp",
    "437348": "ru-rsb",
    "437349": "ru-spb",
    "437524": "ru-skb",
    "437540": "ru-trust",
    "437541": "ru-trust",
    "437772": "ru-tinkoff",
    "437773": "ru-tinkoff",
    "437784": "ru-tinkoff",
    "438046": "ru-citi",
    "438143": "ru-alfa",
    "438254": "ru-vozrozhdenie",
    "438933": "ru-rosbank",
    "438970": "ru-rosbank",
    "438971": "ru-rosbank",
    "439000": "ru-alfa",
    "439054": "ru-sviaz",
    "439055": "ru-sviaz",
    "439056": "ru-sviaz",
    "439057": "ru-sviaz",
    "439077": "ru-alfa",
    "439243": "ru-globex",
    "439244": "ru-globex",
    "439245": "ru-globex",
    "439246": "ru-globex",
    "439250": "ru-globex",
    "439251": "ru-globex",
    "440237": "ru-alfa",
    "440399": "ru-vozrozhdenie",
    "440503": "ru-rosbank",
    "440504": "ru-rosbank",
    "440505": "ru-rosbank",
    "440540": "ru-rosbank",
    "440541": "ru-rosbank",
    "440610": "ru-uralsib",
    "440664": "ru-uralsib",
    "440665": "ru-uralsib",
    "440666": "ru-uralsib",
    "440668": "ru-uralsib",
    "440680": "ru-uralsib",
    "440682": "ru-uralsib",
    "440683": "ru-uralsib",
    "440689": "ru-uralsib",
    "440690": "ru-uralsib",
    "440849": "ru-rosbank",
    "440850": "ru-rosbank",
    "441108": "ru-globex",
    "441273": "ru-vbrr",
    "441318": "ru-sviaz",
    "442466": "ru-uralsib",
    "443222": "ru-mkb",
    "443223": "ru-mkb",
    "443271": "ru-mkb",
    "443272": "ru-mkb",
    "443273": "ru-mkb",
    "443274": "ru-mkb",
    "443275": "ru-roscap",
    "443306": "ru-absolut",
    "443307": "ru-absolut",
    "443308": "ru-absolut",
    "443309": "ru-absolut",
    "443884": "ru-veb",
    "443885": "ru-veb",
    "443886": "ru-veb",
    "443887": "ru-veb",
    "443888": "ru-veb",
    "444002": "ru-binbank",
    "444023": "ru-binbank",
    "444024": "ru-binbank",
    "444025": "ru-binbank",
    "444094": "ru-veb",
    "444238": "ru-smp",
    "444239": "ru-smp",
    "444240": "ru-smp",
    "444241": "ru-smp",
    "444429": "ru-rsb",
    "445433": "ru-hcf",
    "445434": "ru-hcf",
    "445435": "ru-hcf",
    "445436": "ru-hcf",
    "445977": "ru-raiffeisen",
    "446050": "ru-psb",
    "446065": "ru-open",
    "446098": "ru-hcf",
    "446320": "ru-veb",
    "446674": "ru-vtb",
    "446915": "ru-hcf",
    "446916": "ru-raiffeisen",
    "446917": "ru-raiffeisen",
    "446950": "ru-tcb",
    "447362": "ru-binbank",
    "447363": "ru-binbank",
    "447516": "ru-trust",
    "447603": "ru-raiffeisen",
    "447624": "ru-raiffeisen",
    "447817": "ru-psb",
    "447818": "ru-psb",
    "447824": "ru-psb",
    "448331": "ru-vtb24",
    "448343": "ru-vtb24",
    "448344": "ru-vtb24",
    "448346": "ru-vtb24",
    "448369": "ru-vtb24",
    "449572": "ru-hcf",
    "450251": "ru-rosbank",
    "451382": "ru-psb",
    "452235": "ru-rossiya",
    "452236": "ru-rossiya",
    "453558": "ru-uralsib",
    "453559": "ru-uralsib",
    "453560": "ru-uralsib",
    "453561": "ru-uralsib",
    "456515": "ru-trust",
    "456516": "ru-trust",
    "456587": "ru-ceb",
    "456588": "ru-ceb",
    "457647": "ru-rsb",
    "457802": "ru-mts",
    "457816": "ru-open",
    "457817": "ru-open",
    "457818": "ru-open",
    "457819": "ru-open",
    "458218": "ru-binbank",
    "458279": "ru-alfa",
    "458280": "ru-alfa",
    "458281": "ru-alfa",
    "458410": "ru-alfa",
    "458411": "ru-alfa",
    "458443": "ru-alfa",
    "458450": "ru-alfa",
    "458473": "ru-atb",
    "458488": "ru-atb",
    "458489": "ru-atb",
    "458490": "ru-atb",
    "458493": "ru-open",
    "458559": "ru-novikom",
    "458722": "ru-rossiya",
    "458723": "ru-rossiya",
    "458731": "ru-absolut",
    "459226": "ru-skb",
    "459230": "ru-otp",
    "459290": "ru-uralsib",
    "459328": "ru-roscap",
    "459937": "ru-rosbank",
    "460493": "ru-rosbank",
    "462013": "ru-mts",
    "462235": "ru-vtb24",
    "462729": "ru-raiffeisen",
    "462730": "ru-raiffeisen",
    "462758": "ru-raiffeisen",
    "462776": "ru-ucb",
    "462779": "ru-raiffeisen",
    "464405": "ru-vozrozhdenie",
    "464485": "ru-trust",
    "464636": "ru-akbars",
    "464787": "ru-vtb24",
    "464827": "ru-absolut",
    "464828": "ru-absolut",
    "464842": "ru-vtb24",
    "465203": "ru-binbank",
    "465204": "ru-binbank",
    "465205": "ru-binbank",
    "465227": "ru-alfa",
    "465578": "ru-raiffeisen",
    "465882": "ru-gpb",
    "466047": "ru-uralsib",
    "466048": "ru-uralsib",
    "466049": "ru-uralsib",
    "466050": "ru-uralsib",
    "466163": "ru-ren",
    "466164": "ru-ren",
    "466174": "ru-ren",
    "466500": "ru-roscap",
    "466505": "ru-roscap",
    "466511": "ru-roscap",
    "466512": "ru-roscap",
    "466513": "ru-roscap",
    "466514": "ru-roscap",
    "467033": "ru-trust",
    "467058": "ru-vtb24",
    "467485": "ru-open",
    "467486": "ru-open",
    "467487": "ru-open",
    "467564": "ru-sviaz",
    "467810": "ru-uralsib",
    "467811": "ru-uralsib",
    "467812": "ru-uralsib",
    "467933": "ru-roscap",
    "468596": "ru-smp",
    "469339": "ru-binbank",
    "469360": "ru-citi",
    "469362": "ru-ucb",
    "469376": "ru-globex",
    "469670": "ru-smp",
    "470127": "ru-tinkoff",
    "470342": "ru-uralsib",
    "470434": "ru-zenit",
    "470673": "ru-avangard",
    "470674": "ru-avangard",
    "470675": "ru-avangard",
    "471225": "ru-rgs",
    "471226": "ru-ubrd",
    "471358": "ru-mkb",
    "471436": "ru-novikom",
    "471439": "ru-uralsib",
    "471440": "ru-uralsib",
    "471441": "ru-uralsib",
    "471487": "ru-vtb24",
    "471499": "ru-uralsib",
    "472235": "ru-zenit",
    "472252": "ru-reb",
    "472313": "ru-vtb",
    "472345": "ru-psb",
    "472346": "ru-psb",
    "472347": "ru-psb",
    "472348": "ru-psb",
    "472445": "ru-hcf",
    "472446": "ru-ucb",
    "472480": "ru-mib",
    "472489": "ru-rgs",
    "472879": "ru-skb",
    "472933": "ru-veb",
    "472934": "ru-veb",
    "473841": "ru-rgs",
    "473849": "ru-citi",
    "473850": "ru-citi",
    "473853": "ru-rosbank",
    "473854": "ru-rosbank",
    "473855": "ru-rosbank",
    "473869": "ru-tcb",
    "474218": "ru-rosbank",
    "475098": "ru-sviaz",
    "475791": "ru-alfa",
    "476036": "ru-raiffeisen",
    "476206": "ru-psb",
    "476207": "ru-psb",
    "476208": "ru-psb",
    "476280": "ru-rossiya",
    "476804": "ru-veb",
    "476827": "ru-rosbank",
    "476946": "ru-rossiya",
    "477714": "ru-alfa",
    "477908": "ru-rosbank",
    "477932": "ru-alfa",
    "477960": "ru-alfa",
    "477964": "ru-alfa",
    "477986": "ru-rosbank",
    "478264": "ru-rosbank",
    "478265": "ru-rosbank",
    "478266": "ru-rosbank",
    "478273": "ru-avangard",
    "478387": "ru-atb",
    "478474": "ru-tcb",
    "478475": "ru-tcb",
    "478476": "ru-tcb",
    "478741": "ru-raiffeisen",
    "478752": "ru-alfa",
    "479004": "ru-alfa",
    "479087": "ru-alfa",
    "479713": "ru-spb",
    "479768": "ru-spb",
    "479769": "ru-spb",
    "479770": "ru-spb",
    "479771": "ru-spb",
    "479772": "ru-spb",
    "479773": "ru-spb",
    "479788": "ru-spb",
    "480232": "ru-zenit",
    "480623": "ru-alfa",
    "480938": "ru-mib",
    "481776": "ru-sberbank",
    "481779": "ru-sberbank",
    "481781": "ru-sberbank",
    "482413": "ru-psb",
    "483175": "ru-rsb",
    "483176": "ru-rsb",
    "483177": "ru-rsb",
    "483973": "ru-uralsib",
    "483974": "ru-uralsib",
    "483975": "ru-uralsib",
    "483976": "ru-uralsib",
    "483977": "ru-uralsib",
    "483979": "ru-uralsib",
    "483980": "ru-uralsib",
    "484800": "ru-open",
    "485071": "ru-rossiya",
    "485463": "ru-sberbank",
    "485467": "ru-citi",
    "485608": "ru-ucb",
    "485649": "ru-open",
    "486031": "ru-trust",
    "486065": "ru-rsb",
    "486322": "ru-mob",
    "486666": "ru-citi",
    "487415": "ru-gpb",
    "487416": "ru-gpb",
    "487417": "ru-gpb",
    "488951": "ru-skb",
    "489042": "ru-ucb",
    "489099": "ru-ucb",
    "489169": "ru-uralsib",
    "489186": "ru-reb",
    "489195": "ru-vtb",
    "489196": "ru-vtb",
    "489327": "ru-vtb24",
    "489347": "ru-vtb24",
    "489348": "ru-vtb24",
    "489349": "ru-vtb24",
    "489350": "ru-vtb24",
    "489354": "ru-gpb",
    "490736": "ru-vozrozhdenie",
    "490815": "ru-uralsib",
    "490816": "ru-raiffeisen",
    "490818": "ru-ucb",
    "490855": "ru-ucb",
    "490986": "ru-trust",
    "493475": "ru-trust",
    "494343": "ru-trust",
    "498629": "ru-vtb24",
    "498868": "ru-vozrozhdenie",
    "499932": "ru-rosbank",
    "499966": "ru-rosbank",
    "508406": "ru-raiffeisen",
    "510047": "ru-rsb",
    "510060": "ru-vtb",
    "510069": "ru-raiffeisen",
    "510070": "ru-raiffeisen",
    "510074": "ru-ucb",
    "510082": "ru-roscap",
    "510092": "ru-rsb",
    "510098": "ru-rosbank",
    "510125": "ru-roscap",
    "510126": "ru-alfa",
    "510144": "ru-vtb24",
    "510154": "ru-mib",
    "510162": "ru-roscap",
    "510166": "ru-roscap",
    "510172": "ru-uralsib",
    "510173": "ru-roscap",
    "510411": "ru-uralsib",
    "510412": "ru-uralsib",
    "510424": "ru-uralsib",
    "510429": "ru-uralsib",
    "510436": "ru-uralsib",
    "510444": "ru-uralsib",
    "510453": "ru-rosbank",
    "510464": "ru-zenit",
    "510469": "ru-zenit",
    "510483": "ru-uralsib",
    "510494": "ru-uralsib",
    "510495": "ru-vtb",
    "510499": "ru-uralsib",
    "510508": "ru-uralsib",
    "510511": "ru-mib",
    "511741": "ru-uralsib",
    "512003": "ru-rosbank",
    "512051": "ru-roscap",
    "512082": "ru-roscap",
    "512273": "ru-ceb",
    "512298": "ru-uralsib",
    "512347": "ru-roscap",
    "512378": "ru-vtb",
    "512394": "ru-uralsib",
    "512419": "ru-uralsib",
    "512424": "ru-uralsib",
    "512442": "ru-roscap",
    "512444": "ru-ren",
    "512449": "ru-zenit",
    "512450": "ru-vtb",
    "512478": "ru-rgs",
    "512510": "ru-uralsib",
    "512594": "ru-roscap",
    "512626": "ru-roscap",
    "512636": "ru-uralsib",
    "512641": "ru-roscap",
    "512643": "ru-roscap",
    "512741": "ru-uralsib",
    "512756": "ru-rosbank",
    "512762": "ru-citi",
    "512771": "ru-rosbank",
    "512777": "ru-uralsib",
    "512788": "ru-uralsib",
    "512808": "ru-rosbank",
    "512821": "ru-roscap",
    "513022": "ru-rosbank",
    "513222": "ru-uralsib",
    "513459": "ru-roscap",
    "513691": "ru-rsb",
    "513768": "ru-roscap",
    "513769": "ru-roscap",
    "514014": "ru-roscap",
    "514017": "ru-open",
    "514082": "ru-gpb",
    "514515": "ru-uralsib",
    "514529": "ru-rosbank",
    "514930": "ru-rosbank",
    "515243": "ru-open",
    "515548": "ru-sberbank",
    "515587": "ru-mib",
    "515605": "ru-rosbank",
    "515681": "ru-jugra",
    "515739": "ru-mib",
    "515760": "ru-zenit",
    "515764": "ru-smp",
    "515770": "ru-mkb",
    "515774": "ru-otp",
    "515777": "ru-uralsib",
    "515785": "ru-binbank",
    "515792": "ru-uralsib",
    "515840": "ru-uralsib",
    "515842": "ru-sberbank",
    "515844": "ru-uralsib",
    "515848": "ru-psb",
    "515854": "ru-citi",
    "515861": "ru-uralsib",
    "515862": "ru-roscap",
    "515876": "ru-raiffeisen",
    "515887": "ru-uralsib",
    "515899": "ru-open",
    "515900": "ru-uralsib",
    "516009": "ru-otp",
    "516025": "ru-uralsib",
    "516116": "ru-ren",
    "516150": "ru-ren",
    "516161": "ru-uralsib",
    "516206": "ru-uralsib",
    "516333": "ru-zenit",
    "516354": "ru-open",
    "516356": "ru-mib",
    "516358": "ru-zenit",
    "516372": "ru-zenit",
    "516387": "ru-open",
    "516444": "ru-hcf",
    "516445": "ru-uralsib",
    "516448": "ru-uralsib",
    "516454": "ru-gpb",
    "516456": "ru-zenit",
    "516473": "ru-psb",
    "516570": "ru-vtb",
    "516587": "ru-vtb",
    "516906": "ru-trust",
    "517202": "ru-otp",
    "517375": "ru-gpb",
    "517508": "ru-open",
    "517538": "ru-rosbank",
    "517583": "ru-rosbank",
    "517593": "ru-gpb",
    "517667": "ru-zenit",
    "517803": "ru-roscap",
    "517807": "ru-roscap",
    "517822": "ru-rosbank",
    "517955": "ru-mts",
    "518025": "ru-uralsib",
    "518038": "ru-rosbank",
    "518048": "ru-uralsib",
    "518079": "ru-rosbank",
    "518095": "ru-uralsib",
    "518223": "ru-uralsib",
    "518228": "ru-gpb",
    "518275": "ru-uralsib",
    "518316": "ru-uralsib",
    "518318": "ru-uralsib",
    "518331": "ru-roscap",
    "518365": "ru-roscap",
    "518372": "ru-uralsib",
    "518373": "ru-gpb",
    "518392": "ru-uralsib",
    "518406": "ru-rosbank",
    "518449": "ru-uralsib",
    "518499": "ru-uralsib",
    "518505": "ru-vtb",
    "518522": "ru-uralsib",
    "518533": "ru-uralsib",
    "518580": "ru-rosbank",
    "518586": "ru-binbank",
    "518591": "ru-vtb24",
    "518598": "ru-roscap",
    "518607": "ru-uralsib",
    "518621": "ru-uralsib",
    "518640": "ru-vtb24",
    "518642": "ru-rosbank",
    "518647": "ru-zenit",
    "518681": "ru-avangard",
    "518683": "ru-uralsib",
    "518704": "ru-gpb",
    "518714": "ru-rosbank",
    "518727": "ru-uralsib",
    "518753": "ru-trust",
    "518774": "ru-reb",
    "518781": "ru-reb",
    "518788": "ru-binbank",
    "518795": "ru-roscap",
    "518805": "ru-uralsib",
    "518816": "ru-gpb",
    "518820": "ru-smp",
    "518827": "ru-sviaz",
    "518864": "ru-rosbank",
    "518874": "ru-uralsib",
    "518876": "ru-binbank",
    "518882": "ru-rosbank",
    "518884": "ru-smp",
    "518885": "ru-trust",
    "518889": "ru-rosbank",
    "518901": "ru-tinkoff",
    "518902": "ru-gpb",
    "518909": "ru-uralsib",
    "518911": "ru-uralsib",
    "518916": "ru-roscap",
    "518946": "ru-psb",
    "518970": "ru-psb",
    "518971": "ru-sviaz",
    "518977": "ru-psb",
    "518981": "ru-psb",
    "518996": "ru-ucb",
    "518997": "ru-ucb",
    "519304": "ru-vtb24",
    "519327": "ru-roscap",
    "519333": "ru-vozrozhdenie",
    "519346": "ru-uralsib",
    "519350": "ru-roscap",
    "519747": "ru-alfa",
    "519778": "ru-alfa",
    "519998": "ru-vtb24",
    "520006": "ru-uralsib",
    "520035": "ru-uralsib",
    "520036": "ru-rosbank",
    "520047": "ru-rosbank",
    "520085": "ru-psb",
    "520088": "ru-psb",
    "520093": "ru-roscap",
    "520113": "ru-mib",
    "520305": "ru-citi",
    "520306": "ru-citi",
    "520328": "ru-binbank",
    "520348": "ru-roscap",
    "520350": "ru-zenit",
    "520373": "ru-citi",
    "520377": "ru-citi",
    "520633": "ru-sberbank",
    "520666": "ru-roscap",
    "520685": "ru-roscap",
    "520902": "ru-rosbank",
    "520905": "ru-ren",
    "520920": "ru-smp",
    "520935": "ru-akbars",
    "520957": "ru-citi",
    "520985": "ru-akbars",
    "520993": "ru-citi",
    "520996": "ru-uralsib",
    "521124": "ru-psb",
    "521144": "ru-ceb",
    "521155": "ru-gpb",
    "521159": "ru-mts",
    "521172": "ru-rgs",
    "521178": "ru-alfa",
    "521194": "ru-zenit",
    "521310": "ru-rgs",
    "521324": "ru-tinkoff",
    "521326": "ru-smp",
    "521330": "ru-otp",
    "521374": "ru-rosbank",
    "521379": "ru-uralsib",
    "521381": "ru-uralsib",
    "521508": "ru-rosbank",
    "521528": "ru-mob",
    "521589": "ru-zenit",
    "521658": "ru-uralsib",
    "521779": "ru-uralsib",
    "521801": "ru-mkb",
    "521820": "ru-uralsib",
    "521830": "ru-ceb",
    "521847": "ru-uralsib",
    "521879": "ru-uralsib",
    "522016": "ru-binbank",
    "522022": "ru-uralsib",
    "522042": "ru-roscap",
    "522083": "ru-uralsib",
    "522117": "ru-open",
    "522193": "ru-gpb",
    "522199": "ru-hcf",
    "522212": "ru-uralsib",
    "522223": "ru-avangard",
    "522224": "ru-avangard",
    "522230": "ru-uralsib",
    "522455": "ru-rsb",
    "522456": "ru-zenit",
    "522458": "ru-ucb",
    "522470": "ru-otp",
    "522477": "ru-gpb",
    "522511": "ru-rosbank",
    "522513": "ru-rosbank",
    "522588": "ru-rsb",
    "522592": "ru-cetelem",
    "522598": "ru-vtb24",
    "522705": "ru-rosbank",
    "522711": "ru-rosbank",
    "522826": "ru-gpb",
    "522828": "ru-alfa",
    "522833": "ru-roscap",
    "522851": "ru-zenit",
    "522858": "ru-spb",
    "522860": "ru-sberbank",
    "522862": "ru-roscap",
    "522881": "ru-sovkom",
    "522965": "ru-uralsib",
    "522970": "ru-uralsib",
    "522988": "ru-gpb",
    "522989": "ru-gpb",
    "523281": "ru-uralsib",
    "523436": "ru-roscap",
    "523546": "ru-roscap",
    "523558": "ru-roscap",
    "523559": "ru-roscap",
    "523688": "ru-psb",
    "523701": "ru-alfa",
    "523755": "ru-zenit",
    "523787": "ru-rosbank",
    "524001": "ru-rosbank",
    "524004": "ru-uralsib",
    "524381": "ru-rsb",
    "524390": "ru-uralsib",
    "524448": "ru-rshb",
    "524468": "ru-tinkoff",
    "524477": "ru-vtb",
    "524602": "ru-mts",
    "524614": "ru-rosbank",
    "524620": "ru-citi",
    "524655": "ru-mkb",
    "524665": "ru-ceb",
    "524776": "ru-uralsib",
    "524818": "ru-uralsib",
    "524829": "ru-sberbank",
    "524835": "ru-hcf",
    "524838": "ru-open",
    "524853": "ru-mib",
    "524856": "ru-roscap",
    "524861": "ru-rosbank",
    "524862": "ru-binbank",
    "524943": "ru-mob",
    "525236": "ru-uralsib",
    "525245": "ru-rosbank",
    "525247": "ru-rosbank",
    "525248": "ru-uralsib",
    "525443": "ru-uralsib",
    "525446": "ru-rshb",
    "525494": "ru-psb",
    "525689": "ru-citi",
    "525696": "ru-uralsib",
    "525714": "ru-uralsib",
    "525719": "ru-open",
    "525735": "ru-roscap",
    "525740": "ru-gpb",
    "525741": "ru-rosbank",
    "525744": "ru-binbank",
    "525751": "ru-uralsib",
    "525758": "ru-roscap",
    "525767": "ru-roscap",
    "525768": "ru-roscap",
    "525776": "ru-roscap",
    "525778": "ru-rosbank",
    "525781": "ru-roscap",
    "525784": "ru-gpb",
    "525794": "ru-rosbank",
    "525833": "ru-gpb",
    "525932": "ru-trust",
    "525933": "ru-hcf",
    "526090": "ru-roscap",
    "526280": "ru-psb",
    "526393": "ru-roscap",
    "526462": "ru-rosbank",
    "526469": "ru-vozrozhdenie",
    "526483": "ru-gpb",
    "526532": "ru-vtb",
    "526589": "ru-vtb24",
    "526818": "ru-rgs",
    "526839": "ru-otp",
    "526857": "ru-uralsib",
    "526891": "ru-zenit",
    "526940": "ru-roscap",
    "526981": "ru-rosbank",
    "526984": "ru-rosbank",
    "526992": "ru-uralsib",
    "527001": "ru-uralsib",
    "527023": "ru-mob",
    "527196": "ru-uralsib",
    "527348": "ru-sviaz",
    "527393": "ru-rosbank",
    "527415": "ru-roscap",
    "527444": "ru-gpb",
    "527450": "ru-binbank",
    "527574": "ru-uralsib",
    "527576": "ru-sberbank",
    "527594": "ru-citi",
    "527622": "ru-roscap",
    "527640": "ru-rosbank",
    "527643": "ru-rosbank",
    "527658": "ru-uralsib",
    "527663": "ru-rosbank",
    "527785": "ru-vtb",
    "527792": "ru-mib",
    "527798": "ru-vtb",
    "527883": "ru-vtb24",
    "528014": "ru-uralsib",
    "528015": "ru-rosbank",
    "528016": "ru-roscap",
    "528053": "ru-raiffeisen",
    "528068": "ru-uralsib",
    "528090": "ru-rosbank",
    "528154": "ru-vtb24",
    "528249": "ru-vbrr",
    "528270": "ru-rosbank",
    "528588": "ru-akbars",
    "528593": "ru-roscap",
    "528701": "ru-psb",
    "528704": "ru-uralsib",
    "528808": "ru-raiffeisen",
    "528809": "ru-raiffeisen",
    "528819": "ru-rosbank",
    "528933": "ru-rosbank",
    "529025": "ru-vtb24",
    "529071": "ru-roscap",
    "529100": "ru-rosbank",
    "529101": "ru-rosbank",
    "529160": "ru-psb",
    "529170": "ru-sovkom",
    "529208": "ru-zenit",
    "529247": "ru-rosbank",
    "529260": "ru-open",
    "529273": "ru-uralsib",
    "529278": "ru-gpb",
    "529293": "ru-uralsib",
    "529295": "ru-smp",
    "529426": "ru-roscap",
    "529436": "ru-uralsib",
    "529437": "ru-rosbank",
    "529446": "ru-roscap",
    "529448": "ru-roscap",
    "529450": "ru-uralsib",
    "529461": "ru-uralsib",
    "529488": "ru-gpb",
    "529497": "ru-roscap",
    "529813": "ru-rosbank",
    "529860": "ru-uralsib",
    "529862": "ru-rosbank",
    "529889": "ru-sviaz",
    "529938": "ru-vtb24",
    "529968": "ru-otp",
    "530035": "ru-uralsib",
    "530036": "ru-smp",
    "530078": "ru-roscap",
    "530114": "ru-gpb",
    "530142": "ru-uralsib",
    "530143": "ru-uralsib",
    "530145": "ru-uralsib",
    "530171": "ru-sviaz",
    "530172": "ru-ucb",
    "530183": "ru-open",
    "530184": "ru-vtb24",
    "530215": "ru-rosbank",
    "530229": "ru-vtb",
    "530266": "ru-citi",
    "530279": "ru-uralsib",
    "530403": "ru-open",
    "530412": "ru-rosbank",
    "530413": "ru-atb",
    "530416": "ru-rosbank",
    "530441": "ru-psb",
    "530445": "ru-sovkom",
    "530526": "ru-uralsib",
    "530527": "ru-absolut",
    "530595": "ru-roscap",
    "530758": "ru-uralsib",
    "530800": "ru-rosbank",
    "530827": "ru-alfa",
    "530867": "ru-raiffeisen",
    "530900": "ru-spb",
    "530979": "ru-uralsib",
    "530993": "ru-gpb",
    "531034": "ru-ceb",
    "531038": "ru-uralsib",
    "531073": "ru-uralsib",
    "531207": "ru-uralsib",
    "531222": "ru-rosbank",
    "531233": "ru-vtb24",
    "531236": "ru-ucb",
    "531237": "ru-alfa",
    "531305": "ru-gpb",
    "531310": "ru-sberbank",
    "531315": "ru-ren",
    "531316": "ru-avangard",
    "531318": "ru-trust",
    "531327": "ru-hcf",
    "531332": "ru-sviaz",
    "531344": "ru-ucb",
    "531351": "ru-binbank",
    "531425": "ru-binbank",
    "531428": "ru-otp",
    "531452": "ru-vtb",
    "531534": "ru-psb",
    "531562": "ru-roscap",
    "531652": "ru-roscap",
    "531657": "ru-uralsib",
    "531674": "ru-open",
    "531809": "ru-citi",
    "531853": "ru-binbank",
    "531858": "ru-uralsib",
    "531943": "ru-psb",
    "532058": "ru-rosbank",
    "532130": "ru-open",
    "532184": "ru-mkb",
    "532186": "ru-spb",
    "532301": "ru-open",
    "532310": "ru-roscap",
    "532315": "ru-ceb",
    "532320": "ru-uralsib",
    "532326": "ru-cetelem",
    "532328": "ru-uralsib",
    "532334": "ru-roscap",
    "532336": "ru-rosbank",
    "532356": "ru-vbrr",
    "532436": "ru-roscap",
    "532441": "ru-roscap",
    "532461": "ru-zenit",
    "532463": "ru-zenit",
    "532472": "ru-uralsib",
    "532475": "ru-uralsib",
    "532583": "ru-uralsib",
    "532684": "ru-gpb",
    "532809": "ru-rosbank",
    "532835": "ru-binbank",
    "532917": "ru-roscap",
    "532921": "ru-roscap",
    "532947": "ru-atb",
    "532974": "ru-citi",
    "533151": "ru-binbank",
    "533166": "ru-uralsib",
    "533201": "ru-citi",
    "533205": "ru-sberbank",
    "533206": "ru-avangard",
    "533213": "ru-mts",
    "533214": "ru-zenit",
    "533327": "ru-gpb",
    "533469": "ru-rsb",
    "533594": "ru-raiffeisen",
    "533595": "ru-sovkom",
    "533611": "ru-uralsib",
    "533614": "ru-binbank",
    "533616": "ru-raiffeisen",
    "533668": "ru-roscap",
    "533669": "ru-sberbank",
    "533681": "ru-citi",
    "533684": "ru-rosbank",
    "533685": "ru-otp",
    "533689": "ru-rsb",
    "533725": "ru-roscap",
    "533736": "ru-mts",
    "533794": "ru-roscap",
    "533795": "ru-rosbank",
    "533925": "ru-rosbank",
    "533954": "ru-zenit",
    "534128": "ru-uralsib",
    "534130": "ru-gpb",
    "534132": "ru-uralsib",
    "534134": "ru-roscap",
    "534136": "ru-uralsib",
    "534148": "ru-uralsib",
    "534156": "ru-uralsib",
    "534162": "ru-rshb",
    "534171": "ru-gpb",
    "534183": "ru-roscap",
    "534194": "ru-uralsib",
    "534196": "ru-gpb",
    "534251": "ru-rosbank",
    "534254": "ru-vozrozhdenie",
    "534266": "ru-rsb",
    "534293": "ru-rosbank",
    "534296": "ru-uralsib",
    "534297": "ru-rosbank",
    "534449": "ru-rosbank",
    "534462": "ru-psb",
    "534469": "ru-open",
    "534493": "ru-vtb",
    "534495": "ru-psb",
    "534577": "ru-rosbank",
    "534601": "ru-vtb",
    "534645": "ru-rosbank",
    "534661": "ru-open",
    "534669": "ru-open",
    "534921": "ru-rosbank",
    "534927": "ru-uralsib",
    "535023": "ru-psb",
    "535027": "ru-open",
    "535058": "ru-psb",
    "535082": "ru-vtb24",
    "535108": "ru-open",
    "535946": "ru-avangard",
    "536095": "ru-open",
    "536114": "ru-trust",
    "536176": "ru-uralsib",
    "536186": "ru-uralsib",
    "536370": "ru-roscap",
    "536392": "ru-raiffeisen",
    "536400": "ru-uralsib",
    "536409": "ru-rshb",
    "536443": "ru-roscap",
    "536454": "ru-uralsib",
    "536464": "ru-roscap",
    "536466": "ru-mib",
    "536500": "ru-hcf",
    "536511": "ru-hcf",
    "536554": "ru-roscap",
    "536569": "ru-rosbank",
    "536672": "ru-mts",
    "536829": "ru-vtb24",
    "536960": "ru-uralsib",
    "536995": "ru-gpb",
    "537627": "ru-gpb",
    "537643": "ru-alfa",
    "537705": "ru-uralsib",
    "537709": "ru-uralsib",
    "537713": "ru-roscap",
    "537715": "ru-uralsib",
    "537730": "ru-uralsib",
    "537734": "ru-uralsib",
    "537737": "ru-roscap",
    "537770": "ru-jugra",
    "537965": "ru-raiffeisen",
    "538010": "ru-rshb",
    "538395": "ru-roscap",
    "538397": "ru-uralsib",
    "538800": "ru-uralsib",
    "538828": "ru-roscap",
    "538998": "ru-uralsib",
    "539036": "ru-binbank",
    "539037": "ru-uralsib",
    "539102": "ru-rosbank",
    "539114": "ru-ceb",
    "539600": "ru-binbank",
    "539607": "ru-zenit",
    "539613": "ru-zenit",
    "539617": "ru-uralsib",
    "539621": "ru-psb",
    "539673": "ru-avangard",
    "539704": "ru-psb",
    "539710": "ru-uralsib",
    "539721": "ru-binbank",
    "539726": "ru-citi",
    "539839": "ru-gpb",
    "539850": "ru-zenit",
    "539852": "ru-uralsib",
    "539861": "ru-psb",
    "539864": "ru-roscap",
    "539865": "ru-roscap",
    "539869": "ru-roscap",
    "539898": "ru-zenit",
    "540014": "ru-roscap",
    "540035": "ru-rosbank",
    "540053": "ru-rosbank",
    "540111": "ru-uralsib",
    "540149": "ru-rosbank",
    "540169": "ru-vtb24",
    "540194": "ru-binbank",
    "540229": "ru-rosbank",
    "540308": "ru-roscap",
    "540400": "ru-uralsib",
    "540455": "ru-binbank",
    "540602": "ru-roscap",
    "540616": "ru-mts",
    "540642": "ru-binbank",
    "540664": "ru-gpb",
    "540674": "ru-gpb",
    "540687": "ru-uralsib",
    "540708": "ru-uralsib",
    "540768": "ru-uralsib",
    "540788": "ru-citi",
    "540794": "ru-uralsib",
    "540834": "ru-uralsib",
    "540923": "ru-uralsib",
    "540927": "ru-roscap",
    "541031": "ru-rosbank",
    "541152": "ru-binbank",
    "541269": "ru-psb",
    "541279": "ru-uralsib",
    "541294": "ru-binbank",
    "541354": "ru-uralsib",
    "541435": "ru-mts",
    "541450": "ru-ceb",
    "541456": "ru-uralsib",
    "541503": "ru-psb",
    "541600": "ru-spb",
    "541632": "ru-uralsib",
    "541754": "ru-zenit",
    "541778": "ru-zenit",
    "541789": "ru-uralsib",
    "541895": "ru-roscap",
    "541903": "ru-rosbank",
    "541904": "ru-rosbank",
    "541920": "ru-uralsib",
    "541975": "ru-roscap",
    "541983": "ru-uralsib",
    "541997": "ru-absolut",
    "542033": "ru-mkb",
    "542048": "ru-rsb",
    "542058": "ru-rosbank",
    "542112": "ru-uralsib",
    "542246": "ru-uralsib",
    "542247": "ru-roscap",
    "542255": "ru-gpb",
    "542289": "ru-open",
    "542340": "ru-psb",
    "542475": "ru-open",
    "542501": "ru-open",
    "542504": "ru-binbank",
    "542577": "ru-sberbank",
    "542581": "ru-roscap",
    "542600": "ru-roscap",
    "542654": "ru-atb",
    "542751": "ru-vbrr",
    "542772": "ru-raiffeisen",
    "542932": "ru-roscap",
    "542963": "ru-rosbank",
    "543015": "ru-uralsib",
    "543019": "ru-open",
    "543038": "ru-binbank",
    "543101": "ru-spb",
    "543127": "ru-rosbank",
    "543211": "ru-mkb",
    "543236": "ru-zenit",
    "543354": "ru-uralsib",
    "543366": "ru-binbank",
    "543367": "ru-roscap",
    "543435": "ru-uralsib",
    "543618": "ru-roscap",
    "543664": "ru-roscap",
    "543672": "ru-gpb",
    "543724": "ru-gpb",
    "543728": "ru-roscap",
    "543749": "ru-uralsib",
    "543762": "ru-gpb",
    "543763": "ru-sberbank",
    "543807": "ru-uralsib",
    "543874": "ru-psb",
    "543942": "ru-sberbank",
    "544025": "ru-zenit",
    "544026": "ru-gpb",
    "544069": "ru-roscap",
    "544092": "ru-open",
    "544117": "ru-binbank",
    "544123": "ru-mts",
    "544175": "ru-roscap",
    "544195": "ru-uralsib",
    "544212": "ru-roscap",
    "544218": "ru-open",
    "544237": "ru-raiffeisen",
    "544263": "ru-rosbank",
    "544270": "ru-roscap",
    "544272": "ru-uralsib",
    "544326": "ru-uralsib",
    "544331": "ru-sberbank",
    "544343": "ru-open",
    "544367": "ru-uralsib",
    "544369": "ru-uralsib",
    "544417": "ru-uralsib",
    "544429": "ru-rsb",
    "544439": "ru-uralsib",
    "544462": "ru-uralsib",
    "544491": "ru-rosbank",
    "544499": "ru-open",
    "544552": "ru-uralsib",
    "544561": "ru-gpb",
    "544573": "ru-open",
    "544754": "ru-roscap",
    "544800": "ru-psb",
    "544852": "ru-zenit",
    "544885": "ru-roscap",
    "544886": "ru-atb",
    "544905": "ru-rosbank",
    "544962": "ru-open",
    "545037": "ru-sberbank",
    "545101": "ru-gpb",
    "545115": "ru-raiffeisen",
    "545117": "ru-zenit",
    "545151": "ru-rosbank",
    "545152": "ru-sberbank",
    "545160": "ru-rsb",
    "545182": "ru-citi",
    "545200": "ru-uralsib",
    "545204": "ru-rosbank",
    "545214": "ru-otp",
    "545224": "ru-vtb24",
    "545266": "ru-uralsib",
    "545272": "ru-uralsib",
    "545350": "ru-psb",
    "545362": "ru-roscap",
    "545364": "ru-rosbank",
    "545379": "ru-rosbank",
    "545472": "ru-uralsib",
    "545490": "ru-roscap",
    "545511": "ru-roscap",
    "545529": "ru-rosbank",
    "545539": "ru-uralsib",
    "545540": "ru-uralsib",
    "545547": "ru-rosbank",
    "545572": "ru-rosbank",
    "545575": "ru-rosbank",
    "545592": "ru-uralsib",
    "545638": "ru-uralsib",
    "545655": "ru-uralsib",
    "545701": "ru-uralsib",
    "545742": "ru-uralsib",
    "545744": "ru-uralsib",
    "545761": "ru-uralsib",
    "545762": "ru-hcf",
    "545778": "ru-uralsib",
    "545789": "ru-uralsib",
    "545792": "ru-uralsib",
    "545799": "ru-uralsib",
    "545807": "ru-gpb",
    "545817": "ru-uralsib",
    "545840": "ru-sberbank",
    "545868": "ru-uralsib",
    "545896": "ru-zenit",
    "545916": "ru-uralsib",
    "545929": "ru-zenit",
    "546031": "ru-sberbank",
    "546339": "ru-uralsib",
    "546340": "ru-uralsib",
    "546468": "ru-uralsib",
    "546551": "ru-uralsib",
    "546593": "ru-uralsib",
    "546662": "ru-uralsib",
    "546679": "ru-uralsib",
    "546718": "ru-uralsib",
    "546766": "ru-psb",
    "546842": "ru-uralsib",
    "546844": "ru-uralsib",
    "546850": "ru-sovkom",
    "546901": "ru-sberbank",
    "546902": "ru-sberbank",
    "546903": "ru-sberbank",
    "546904": "ru-sberbank",
    "546905": "ru-sberbank",
    "546906": "ru-sberbank",
    "546907": "ru-sberbank",
    "546908": "ru-sberbank",
    "546909": "ru-sberbank",
    "546910": "ru-sberbank",
    "546911": "ru-sberbank",
    "546912": "ru-sberbank",
    "546913": "ru-sberbank",
    "546916": "ru-sberbank",
    "546917": "ru-sberbank",
    "546918": "ru-sberbank",
    "546920": "ru-sberbank",
    "546922": "ru-sberbank",
    "546925": "ru-sberbank",
    "546926": "ru-sberbank",
    "546927": "ru-sberbank",
    "546928": "ru-sberbank",
    "546929": "ru-sberbank",
    "546930": "ru-sberbank",
    "546931": "ru-sberbank",
    "546932": "ru-sberbank",
    "546933": "ru-sberbank",
    "546935": "ru-sberbank",
    "546936": "ru-sberbank",
    "546937": "ru-sberbank",
    "546938": "ru-sberbank",
    "546939": "ru-sberbank",
    "546940": "ru-sberbank",
    "546941": "ru-sberbank",
    "546942": "ru-sberbank",
    "546943": "ru-sberbank",
    "546944": "ru-sberbank",
    "546945": "ru-sberbank",
    "546946": "ru-sberbank",
    "546947": "ru-sberbank",
    "546948": "ru-sberbank",
    "546949": "ru-sberbank",
    "546950": "ru-sberbank",
    "546951": "ru-sberbank",
    "546952": "ru-sberbank",
    "546953": "ru-sberbank",
    "546954": "ru-sberbank",
    "546955": "ru-sberbank",
    "546956": "ru-sberbank",
    "546959": "ru-sberbank",
    "546960": "ru-sberbank",
    "546961": "ru-sberbank",
    "546962": "ru-sberbank",
    "546963": "ru-sberbank",
    "546964": "ru-sberbank",
    "546966": "ru-sberbank",
    "546967": "ru-sberbank",
    "546968": "ru-sberbank",
    "546969": "ru-sberbank",
    "546970": "ru-sberbank",
    "546972": "ru-sberbank",
    "546974": "ru-sberbank",
    "546975": "ru-sberbank",
    "546976": "ru-sberbank",
    "546977": "ru-sberbank",
    "546996": "ru-roscap",
    "546998": "ru-sberbank",
    "546999": "ru-sberbank",
    "547070": "ru-rosbank",
    "547151": "ru-roscap",
    "547228": "ru-uralsib",
    "547243": "ru-binbank",
    "547253": "ru-uralsib",
    "547257": "ru-uralsib",
    "547258": "ru-uralsib",
    "547262": "ru-rsb",
    "547298": "ru-uralsib",
    "547300": "ru-uralsib",
    "547306": "ru-uralsib",
    "547314": "ru-uralsib",
    "547319": "ru-uralsib",
    "547324": "ru-uralsib",
    "547329": "ru-psb",
    "547348": "ru-gpb",
    "547377": "ru-binbank",
    "547421": "ru-uralsib",
    "547447": "ru-uralsib",
    "547449": "ru-open",
    "547470": "ru-rosbank",
    "547490": "ru-citi",
    "547547": "ru-uralsib",
    "547550": "ru-ceb",
    "547563": "ru-uralsib",
    "547576": "ru-uralsib",
    "547580": "ru-uralsib",
    "547601": "ru-rshb",
    "547610": "ru-roscap",
    "547613": "ru-raiffeisen",
    "547616": "ru-open",
    "547665": "ru-uralsib",
    "547681": "ru-rosbank",
    "547699": "ru-uralsib",
    "547705": "ru-rosbank",
    "547728": "ru-ucb",
    "547743": "ru-vozrozhdenie",
    "547761": "ru-uralsib",
    "547796": "ru-uralsib",
    "547801": "ru-binbank",
    "547851": "ru-uralsib",
    "547859": "ru-roscap",
    "547901": "ru-sberbank",
    "547902": "ru-sberbank",
    "547905": "ru-sberbank",
    "547906": "ru-sberbank",
    "547907": "ru-sberbank",
    "547910": "ru-sberbank",
    "547911": "ru-sberbank",
    "547912": "ru-sberbank",
    "547913": "ru-sberbank",
    "547920": "ru-sberbank",
    "547922": "ru-sberbank",
    "547925": "ru-sberbank",
    "547926": "ru-sberbank",
    "547927": "ru-sberbank",
    "547928": "ru-sberbank",
    "547930": "ru-sberbank",
    "547931": "ru-sberbank",
    "547932": "ru-sberbank",
    "547935": "ru-sberbank",
    "547936": "ru-sberbank",
    "547937": "ru-sberbank",
    "547938": "ru-sberbank",
    "547940": "ru-sberbank",
    "547942": "ru-sberbank",
    "547943": "ru-sberbank",
    "547944": "ru-sberbank",
    "547945": "ru-sberbank",
    "547947": "ru-sberbank",
    "547948": "ru-sberbank",
    "547949": "ru-sberbank",
    "547950": "ru-sberbank",
    "547951": "ru-sberbank",
    "547952": "ru-sberbank",
    "547953": "ru-sberbank",
    "547954": "ru-sberbank",
    "547955": "ru-sberbank",
    "547956": "ru-sberbank",
    "547959": "ru-sberbank",
    "547960": "ru-sberbank",
    "547961": "ru-sberbank",
    "547962": "ru-sberbank",
    "547964": "ru-sberbank",
    "547966": "ru-sberbank",
    "547969": "ru-sberbank",
    "547972": "ru-sberbank",
    "547976": "ru-sberbank",
    "547998": "ru-sberbank",
    "547999": "ru-sberbank",
    "548027": "ru-gpb",
    "548035": "ru-mts",
    "548062": "ru-roscap",
    "548072": "ru-roscap",
    "548073": "ru-roscap",
    "548092": "ru-binbank",
    "548137": "ru-uralsib",
    "548138": "ru-uralsib",
    "548164": "ru-raiffeisen",
    "548172": "ru-psb",
    "548173": "ru-roscap",
    "548177": "ru-uralsib",
    "548186": "ru-roscap",
    "548204": "ru-roscap",
    "548205": "ru-uralsib",
    "548214": "ru-uralsib",
    "548225": "ru-rosbank",
    "548235": "ru-rsb",
    "548246": "ru-uralsib",
    "548249": "ru-uralsib",
    "548265": "ru-binbank",
    "548266": "ru-uralsib",
    "548268": "ru-uralsib",
    "548269": "ru-psb",
    "548270": "ru-binbank",
    "548272": "ru-uralsib",
    "548291": "ru-uralsib",
    "548294": "ru-uralsib",
    "548301": "ru-roscap",
    "548308": "ru-vozrozhdenie",
    "548309": "ru-vozrozhdenie",
    "548326": "ru-uralsib",
    "548328": "ru-roscap",
    "548335": "ru-roscap",
    "548351": "ru-mib",
    "548386": "ru-skb",
    "548387": "ru-tinkoff",
    "548393": "ru-uralsib",
    "548401": "ru-sberbank",
    "548402": "ru-sberbank",
    "548403": "ru-sberbank",
    "548404": "ru-roscap",
    "548405": "ru-sberbank",
    "548406": "ru-sberbank",
    "548407": "ru-sberbank",
    "548409": "ru-rosbank",
    "548410": "ru-sberbank",
    "548411": "ru-sberbank",
    "548412": "ru-sberbank",
    "548413": "ru-sberbank",
    "548416": "ru-sberbank",
    "548420": "ru-sberbank",
    "548422": "ru-sberbank",
    "548425": "ru-sberbank",
    "548426": "ru-sberbank",
    "548427": "ru-sberbank",
    "548428": "ru-sberbank",
    "548429": "ru-psb",
    "548430": "ru-sberbank",
    "548431": "ru-sberbank",
    "548432": "ru-sberbank",
    "548435": "ru-sberbank",
    "548436": "ru-sberbank",
    "548438": "ru-sberbank",
    "548440": "ru-sberbank",
    "548442": "ru-sberbank",
    "548443": "ru-sberbank",
    "548444": "ru-sberbank",
    "548445": "ru-sberbank",
    "548447": "ru-sberbank",
    "548448": "ru-sberbank",
    "548449": "ru-sberbank",
    "548450": "ru-sberbank",
    "548451": "ru-sberbank",
    "548452": "ru-sberbank",
    "548453": "ru-uralsib",
    "548454": "ru-sberbank",
    "548455": "ru-sberbank",
    "548456": "ru-sberbank",
    "548459": "ru-sberbank",
    "548460": "ru-sberbank",
    "548461": "ru-sberbank",
    "548462": "ru-sberbank",
    "548463": "ru-sberbank",
    "548464": "ru-sberbank",
    "548466": "ru-sberbank",
    "548468": "ru-sberbank",
    "548469": "ru-sberbank",
    "548470": "ru-sberbank",
    "548472": "ru-sberbank",
    "548476": "ru-sberbank",
    "548477": "ru-sberbank",
    "548484": "ru-open",
    "548490": "ru-roscap",
    "548498": "ru-sberbank",
    "548499": "ru-sberbank",
    "548504": "ru-uralsib",
    "548511": "ru-uralsib",
    "548554": "ru-roscap",
    "548571": "ru-uralsib",
    "548588": "ru-uralsib",
    "548601": "ru-alfa",
    "548655": "ru-alfa",
    "548673": "ru-alfa",
    "548674": "ru-alfa",
    "548704": "ru-uralsib",
    "548706": "ru-uralsib",
    "548713": "ru-uralsib",
    "548745": "ru-hcf",
    "548752": "ru-uralsib",
    "548753": "ru-roscap",
    "548754": "ru-roscap",
    "548755": "ru-roscap",
    "548767": "ru-zenit",
    "548768": "ru-zenit",
    "548771": "ru-zenit",
    "548777": "ru-roscap",
    "548783": "ru-roscap",
    "548784": "ru-roscap",
    "548785": "ru-roscap",
    "548791": "ru-roscap",
    "548796": "ru-rosbank",
    "548899": "ru-uralsib",
    "548921": "ru-rosbank",
    "548934": "ru-uralsib",
    "548996": "ru-uralsib",
    "548997": "ru-uralsib",
    "548999": "ru-gpb",
    "549000": "ru-gpb",
    "549014": "ru-uralsib",
    "549015": "ru-uralsib",
    "549024": "ru-open",
    "549025": "ru-open",
    "549068": "ru-rosbank",
    "549071": "ru-skb",
    "549074": "ru-roscap",
    "549081": "ru-rosbank",
    "549098": "ru-gpb",
    "549223": "ru-vtb24",
    "549229": "ru-uralsib",
    "549251": "ru-uralsib",
    "549255": "ru-uralsib",
    "549256": "ru-uralsib",
    "549257": "ru-uralsib",
    "549258": "ru-roscap",
    "549264": "ru-uralsib",
    "549268": "ru-rosbank",
    "549270": "ru-vtb24",
    "549274": "ru-uralsib",
    "549283": "ru-uralsib",
    "549285": "ru-uralsib",
    "549302": "ru-ucb",
    "549303": "ru-uralsib",
    "549306": "ru-uralsib",
    "549307": "ru-uralsib",
    "549314": "ru-roscap",
    "549347": "ru-uralsib",
    "549349": "ru-binbank",
    "549376": "ru-spb",
    "549401": "ru-uralsib",
    "549411": "ru-zenit",
    "549424": "ru-uralsib",
    "549425": "ru-psb",
    "549439": "ru-psb",
    "549447": "ru-uralsib",
    "549454": "ru-uralsib",
    "549470": "ru-roscap",
    "549475": "ru-rosbank",
    "549478": "ru-rosbank",
    "549483": "ru-uralsib",
    "549512": "ru-binbank",
    "549522": "ru-uralsib",
    "549523": "ru-binbank",
    "549524": "ru-psb",
    "549574": "ru-roscap",
    "549597": "ru-roscap",
    "549600": "ru-gpb",
    "549614": "ru-gpb",
    "549647": "ru-uralsib",
    "549654": "ru-uralsib",
    "549715": "ru-rshb",
    "549716": "ru-uralsib",
    "549822": "ru-rosbank",
    "549829": "ru-rosbank",
    "549830": "ru-uralsib",
    "549848": "ru-open",
    "549855": "ru-rosbank",
    "549865": "ru-rosbank",
    "549870": "ru-mib",
    "549873": "ru-uralsib",
    "549881": "ru-uralsib",
    "549882": "ru-zenit",
    "549887": "ru-roscap",
    "549888": "ru-zenit",
    "549935": "ru-roscap",
    "549965": "ru-jugra",
    "549966": "ru-jugra",
    "549969": "ru-roscap",
    "550006": "ru-uralsib",
    "550025": "ru-binbank",
    "550064": "ru-rosbank",
    "550070": "ru-roscap",
    "550143": "ru-rosbank",
    "550165": "ru-rosbank",
    "550210": "ru-rosbank",
    "550219": "ru-zenit",
    "550235": "ru-roscap",
    "550251": "ru-sberbank",
    "550446": "ru-open",
    "550467": "ru-rosbank",
    "550468": "ru-uralsib",
    "550484": "ru-raiffeisen",
    "550547": "ru-rosbank",
    "550583": "ru-mts",
    "551950": "ru-roscap",
    "551960": "ru-tinkoff",
    "551979": "ru-rosbank",
    "551985": "ru-rosbank",
    "551989": "ru-rosbank",
    "551993": "ru-rosbank",
    "551996": "ru-rosbank",
    "552055": "ru-gpb",
    "552151": "ru-rosbank",
    "552175": "ru-alfa",
    "552186": "ru-alfa",
    "552549": "ru-roscap",
    "552573": "ru-citi",
    "552574": "ru-citi",
    "552603": "ru-roscap",
    "552613": "ru-reb",
    "552618": "ru-mts",
    "552680": "ru-mkb",
    "552702": "ru-gpb",
    "552708": "ru-open",
    "552729": "ru-ren",
    "552845": "ru-uralsib",
    "552866": "ru-binbank",
    "552958": "ru-akbars",
    "553000": "ru-uralsib",
    "553069": "ru-rosbank",
    "553128": "ru-rosbank",
    "553420": "ru-tinkoff",
    "553496": "ru-raiffeisen",
    "553581": "ru-uralsib",
    "553584": "ru-uralsib",
    "553690": "ru-rosbank",
    "553909": "ru-rosbank",
    "553964": "ru-rosbank",
    "554279": "ru-psb",
    "554317": "ru-rosbank",
    "554324": "ru-rosbank",
    "554326": "ru-rosbank",
    "554364": "ru-roscap",
    "554365": "ru-roscap",
    "554372": "ru-binbank",
    "554373": "ru-binbank",
    "554384": "ru-vtb",
    "554386": "ru-vtb24",
    "554393": "ru-vtb24",
    "554524": "ru-smp",
    "554546": "ru-uralsib",
    "554549": "ru-rosbank",
    "554562": "ru-uralsib",
    "554581": "ru-uralsib",
    "554607": "ru-uralsib",
    "554615": "ru-uralsib",
    "554651": "ru-uralsib",
    "554713": "ru-rosbank",
    "554733": "ru-rosbank",
    "554759": "ru-psb",
    "554761": "ru-rosbank",
    "554780": "ru-zenit",
    "554781": "ru-psb",
    "554782": "ru-rosbank",
    "554844": "ru-rosbank",
    "555057": "ru-citi",
    "555058": "ru-citi",
    "555079": "ru-rosbank",
    "555156": "ru-alfa",
    "555921": "ru-alfa",
    "555928": "ru-alfa",
    "555933": "ru-alfa",
    "555947": "ru-alfa",
    "555949": "ru-alfa",
    "555957": "ru-alfa",
    "556052": "ru-gpb",
    "556056": "ru-sviaz",
    "556057": "ru-uralsib",
    "557029": "ru-zenit",
    "557030": "ru-zenit",
    "557036": "ru-uralsib",
    "557056": "ru-ceb",
    "557057": "ru-ceb",
    "557071": "ru-mib",
    "557072": "ru-mib",
    "557073": "ru-binbank",
    "557106": "ru-uralsib",
    "557107": "ru-uralsib",
    "557646": "ru-rosbank",
    "557724": "ru-rosbank",
    "557734": "ru-hcf",
    "557737": "ru-ren",
    "557808": "ru-trust",
    "557809": "ru-trust",
    "557841": "ru-rosbank",
    "557842": "ru-rosbank",
    "557848": "ru-rosbank",
    "557849": "ru-rosbank",
    "557942": "ru-zenit",
    "557944": "ru-zenit",
    "557946": "ru-open",
    "557948": "ru-open",
    "557959": "ru-roscap",
    "557960": "ru-zenit",
    "557969": "ru-roscap",
    "557970": "ru-uralsib",
    "557976": "ru-binbank",
    "557977": "ru-rosbank",
    "557980": "ru-rosbank",
    "557981": "ru-psb",
    "557986": "ru-mib",
    "558254": "ru-psb",
    "558258": "ru-rosbank",
    "558268": "ru-psb",
    "558273": "ru-raiffeisen",
    "558274": "ru-rosbank",
    "558275": "ru-uralsib",
    "558296": "ru-rosbank",
    "558298": "ru-trust",
    "558326": "ru-uralsib",
    "558334": "ru-alfa",
    "558354": "ru-uralsib",
    "558355": "ru-gpb",
    "558356": "ru-uralsib",
    "558374": "ru-uralsib",
    "558385": "ru-jugra",
    "558391": "ru-uralsib",
    "558416": "ru-rosbank",
    "558462": "ru-mib",
    "558463": "ru-uralsib",
    "558480": "ru-rosbank",
    "558488": "ru-roscap",
    "558504": "ru-rosbank",
    "558516": "ru-psb",
    "558518": "ru-vtb24",
    "558535": "ru-avangard",
    "558536": "ru-raiffeisen",
    "558605": "ru-rosbank",
    "558620": "ru-open",
    "558622": "ru-raiffeisen",
    "558625": "ru-binbank",
    "558636": "ru-binbank",
    "558651": "ru-uralsib",
    "558664": "ru-uralsib",
    "558672": "ru-psb",
    "558673": "ru-rosbank",
    "558690": "ru-uralsib",
    "558696": "ru-zenit",
    "558713": "ru-vbrr",
    "559066": "ru-vtb",
    "559255": "ru-gpb",
    "559264": "ru-open",
    "559448": "ru-rosbank",
    "559456": "ru-mib",
    "559476": "ru-rosbank",
    "559488": "ru-rosbank",
    "559596": "ru-rosbank",
    "559598": "ru-rosbank",
    "559615": "ru-rosbank",
    "559645": "ru-zenit",
    "559811": "ru-rosbank",
    "559813": "ru-ceb",
    "559814": "ru-rosbank",
    "559899": "ru-rosbank",
    "559901": "ru-sberbank",
    "559969": "ru-rosbank",
    "559992": "ru-gpb",
    "605461": "ru-sberbank",
    "605462": "ru-uralsib",
    "627119": "ru-alfa",
    "639002": "ru-sberbank",
    "670505": "ru-roscap",
    "670508": "ru-psb",
    "670512": "ru-zenit",
    "670518": "ru-open",
    "670521": "ru-roscap",
    "670550": "ru-rosbank",
    "670555": "ru-atb",
    "670556": "ru-roscap",
    "670557": "ru-rosbank",
    "670560": "ru-rosbank",
    "670567": "ru-rosbank",
    "670575": "ru-rosbank",
    "670583": "ru-psb",
    "670587": "ru-open",
    "670594": "ru-roscap",
    "670601": "ru-roscap",
    "670602": "ru-roscap",
    "670605": "ru-roscap",
    "670607": "ru-rosbank",
    "670611": "ru-psb",
    "670614": "ru-zenit",
    "670623": "ru-roscap",
    "670624": "ru-roscap",
    "670625": "ru-roscap",
    "670628": "ru-roscap",
    "670633": "ru-roscap",
    "670637": "ru-skb",
    "670638": "ru-roscap",
    "670646": "ru-rosbank",
    "670647": "ru-rosbank",
    "670652": "ru-rosbank",
    "670654": "ru-psb",
    "670661": "ru-psb",
    "670663": "ru-roscap",
    "670671": "ru-roscap",
    "670674": "ru-rosbank",
    "670676": "ru-roscap",
    "670694": "ru-rosbank",
    "670818": "ru-roscap",
    "670819": "ru-rosbank",
    "670828": "ru-rosbank",
    "670846": "ru-roscap",
    "670849": "ru-rosbank",
    "670851": "ru-rosbank",
    "670852": "ru-mob",
    "670869": "ru-rosbank",
    "670893": "ru-roscap",
    "670981": "ru-roscap",
    "670992": "ru-uralsib",
    "670995": "ru-uralsib",
    "670996": "ru-rosbank",
    "671106": "ru-uralsib",
    "671109": "ru-vtb",
    "671111": "ru-vtb",
    "671122": "ru-gpb",
    "671123": "ru-zenit",
    "671136": "ru-uralsib",
    "671137": "ru-rosbank",
    "671148": "ru-vtb",
    "671172": "ru-vtb",
    "676195": "ru-sberbank",
    "676196": "ru-sberbank",
    "676230": "ru-alfa",
    "676231": "ru-open",
    "676245": "ru-jugra",
    "676280": "ru-sberbank",
    "676333": "ru-raiffeisen",
    "676347": "ru-rosbank",
    "676371": "ru-roscap",
    "676397": "ru-vozrozhdenie",
    "676428": "ru-binbank",
    "676444": "ru-psb",
    "676445": "ru-roscap",
    "676450": "ru-rosbank",
    "676454": "ru-gpb",
    "676463": "ru-avangard",
    "676501": "ru-rosbank",
    "676523": "ru-zenit",
    "676528": "ru-uralsib",
    "676533": "ru-rosbank",
    "676565": "ru-rsb",
    "676586": "ru-ceb",
    "676625": "ru-raiffeisen",
    "676642": "ru-trust",
    "676664": "ru-rosbank",
    "676668": "ru-rosbank",
    "676672": "ru-ucb",
    "676697": "ru-open",
    "676800": "ru-vtb24",
    "676802": "ru-vtb24",
    "676803": "ru-vtb24",
    "676805": "ru-vtb24",
    "676845": "ru-vtb24",
    "676851": "ru-vtb24",
    "676859": "ru-roscap",
    "676860": "ru-vtb24",
    "676861": "ru-vtb24",
    "676881": "ru-reb",
    "676884": "ru-mts",
    "676888": "ru-vtb24",
    "676893": "ru-vtb24",
    "676896": "ru-vtb24",
    "676934": "ru-binbank",
    "676939": "ru-vtb24",
    "676946": "ru-rosbank",
    "676947": "ru-binbank",
    "676967": "ru-mkb",
    "676974": "ru-vtb24",
    "676979": "ru-roscap",
    "676984": "ru-uralsib",
    "676989": "ru-roscap",
    "676990": "ru-gpb",
    "676998": "ru-binbank",
    "677018": "ru-roscap",
    "677040": "ru-ren",
    "677058": "ru-binbank",
    "677076": "ru-rosbank",
    "677084": "ru-zenit",
    "677088": "ru-akbars",
    "677110": "ru-gpb",
    "677112": "ru-rosbank",
    "677128": "ru-sberbank",
    "677136": "ru-roscap",
    "677146": "ru-roscap",
    "677151": "ru-vtb",
    "677175": "ru-smp",
    "677189": "ru-rgs",
    "677194": "ru-vtb24",
    "677222": "ru-rosbank",
    "677223": "ru-roscap",
    "677228": "ru-roscap",
    "677229": "ru-roscap",
    "677234": "ru-rosbank",
    "677235": "ru-rosbank",
    "677240": "ru-rosbank",
    "677245": "ru-rosbank",
    "677257": "ru-roscap",
    "677260": "ru-zenit",
    "677261": "ru-uralsib",
    "677263": "ru-psb",
    "677267": "ru-roscap",
    "677271": "ru-vtb24",
    "677272": "ru-roscap",
    "677275": "ru-binbank",
    "677276": "ru-binbank",
    "677285": "ru-roscap",
    "677288": "ru-roscap",
    "677289": "ru-roscap",
    "677302": "ru-roscap",
    "677303": "ru-rosbank",
    "677305": "ru-roscap",
    "677309": "ru-rosbank",
    "677314": "ru-rosbank",
    "677315": "ru-rosbank",
    "677318": "ru-roscap",
    "677319": "ru-roscap",
    "677327": "ru-zenit",
    "677329": "ru-zenit",
    "677335": "ru-roscap",
    "677336": "ru-roscap",
    "677338": "ru-roscap",
    "677342": "ru-rosbank",
    "677343": "ru-rosbank",
    "677345": "ru-rosbank",
    "677349": "ru-roscap",
    "677358": "ru-binbank",
    "677359": "ru-rosbank",
    "677360": "ru-rosbank",
    "677363": "ru-trust",
    "677366": "ru-smp",
    "677367": "ru-sviaz",
    "677370": "ru-psb",
    "677371": "ru-psb",
    "677372": "ru-psb",
    "677374": "ru-roscap",
    "677375": "ru-rosbank",
    "677376": "ru-rosbank",
    "677380": "ru-zenit",
    "677382": "ru-uralsib",
    "677388": "ru-zenit",
    "677389": "ru-zenit",
    "677391": "ru-rsb",
    "677401": "ru-rosbank",
    "677405": "ru-psb",
    "677406": "ru-binbank",
    "677408": "ru-uralsib",
    "677424": "ru-roscap",
    "677428": "ru-roscap",
    "677430": "ru-uralsib",
    "677431": "ru-uralsib",
    "677444": "ru-roscap",
    "677456": "ru-roscap",
    "677457": "ru-roscap",
    "677458": "ru-zenit",
    "677459": "ru-zenit",
    "677461": "ru-psb",
    "677462": "ru-psb",
    "677466": "ru-roscap",
    "677467": "ru-rosbank",
    "677468": "ru-rosbank",
    "677470": "ru-vtb24",
    "677471": "ru-vtb24",
    "677484": "ru-gpb",
    "677493": "ru-zenit",
    "677496": "ru-mob",
    "677497": "ru-zenit",
    "677501": "ru-roscap",
    "677505": "ru-binbank",
    "677506": "ru-psb",
    "677507": "ru-rosbank",
    "677510": "ru-zenit",
    "677514": "ru-zenit",
    "677518": "ru-smp",
    "677578": "ru-roscap",
    "677579": "ru-rosbank",
    "677585": "ru-gpb",
    "677597": "ru-rosbank",
    "677600": "ru-roscap",
    "677611": "ru-roscap",
    "677617": "ru-rosbank",
    "677646": "ru-roscap",
    "677649": "ru-vbrr",
    "677655": "ru-roscap",
    "677656": "ru-roscap",
    "677659": "ru-zenit",
    "677660": "ru-zenit",
    "677684": "ru-mts",
    "677688": "ru-roscap",
    "677694": "ru-roscap",
    "677714": "ru-roscap",
    "677721": "ru-rosbank",
    "679074": "ru-uralsib"
  }
  if (typeof exports !== 'undefined') {
    exports.CardInfo._banks = banks
    exports.CardInfo._prefixes = prefixes
  } else if (typeof window !== 'undefined') {
    window.CardInfo._banks = banks
    window.CardInfo._prefixes = prefixes
  }
}())

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
(function (Buffer){
(function (global, module) {

  var exports = module.exports;

  /**
   * Exports.
   */

  module.exports = expect;
  expect.Assertion = Assertion;

  /**
   * Exports version.
   */

  expect.version = '0.3.1';

  /**
   * Possible assertion flags.
   */

  var flags = {
      not: ['to', 'be', 'have', 'include', 'only']
    , to: ['be', 'have', 'include', 'only', 'not']
    , only: ['have']
    , have: ['own']
    , be: ['an']
  };

  function expect (obj) {
    return new Assertion(obj);
  }

  /**
   * Constructor
   *
   * @api private
   */

  function Assertion (obj, flag, parent) {
    this.obj = obj;
    this.flags = {};

    if (undefined != parent) {
      this.flags[flag] = true;

      for (var i in parent.flags) {
        if (parent.flags.hasOwnProperty(i)) {
          this.flags[i] = true;
        }
      }
    }

    var $flags = flag ? flags[flag] : keys(flags)
      , self = this;

    if ($flags) {
      for (var i = 0, l = $flags.length; i < l; i++) {
        // avoid recursion
        if (this.flags[$flags[i]]) continue;

        var name = $flags[i]
          , assertion = new Assertion(this.obj, name, this)

        if ('function' == typeof Assertion.prototype[name]) {
          // clone the function, make sure we dont touch the prot reference
          var old = this[name];
          this[name] = function () {
            return old.apply(self, arguments);
          };

          for (var fn in Assertion.prototype) {
            if (Assertion.prototype.hasOwnProperty(fn) && fn != name) {
              this[name][fn] = bind(assertion[fn], assertion);
            }
          }
        } else {
          this[name] = assertion;
        }
      }
    }
  }

  /**
   * Performs an assertion
   *
   * @api private
   */

  Assertion.prototype.assert = function (truth, msg, error, expected) {
    var msg = this.flags.not ? error : msg
      , ok = this.flags.not ? !truth : truth
      , err;

    if (!ok) {
      err = new Error(msg.call(this));
      if (arguments.length > 3) {
        err.actual = this.obj;
        err.expected = expected;
        err.showDiff = true;
      }
      throw err;
    }

    this.and = new Assertion(this.obj);
  };

  /**
   * Check if the value is truthy
   *
   * @api public
   */

  Assertion.prototype.ok = function () {
    this.assert(
        !!this.obj
      , function(){ return 'expected ' + i(this.obj) + ' to be truthy' }
      , function(){ return 'expected ' + i(this.obj) + ' to be falsy' });
  };

  /**
   * Creates an anonymous function which calls fn with arguments.
   *
   * @api public
   */

  Assertion.prototype.withArgs = function() {
    expect(this.obj).to.be.a('function');
    var fn = this.obj;
    var args = Array.prototype.slice.call(arguments);
    return expect(function() { fn.apply(null, args); });
  };

  /**
   * Assert that the function throws.
   *
   * @param {Function|RegExp} callback, or regexp to match error string against
   * @api public
   */

  Assertion.prototype.throwError =
  Assertion.prototype.throwException = function (fn) {
    expect(this.obj).to.be.a('function');

    var thrown = false
      , not = this.flags.not;

    try {
      this.obj();
    } catch (e) {
      if (isRegExp(fn)) {
        var subject = 'string' == typeof e ? e : e.message;
        if (not) {
          expect(subject).to.not.match(fn);
        } else {
          expect(subject).to.match(fn);
        }
      } else if ('function' == typeof fn) {
        fn(e);
      }
      thrown = true;
    }

    if (isRegExp(fn) && not) {
      // in the presence of a matcher, ensure the `not` only applies to
      // the matching.
      this.flags.not = false;
    }

    var name = this.obj.name || 'fn';
    this.assert(
        thrown
      , function(){ return 'expected ' + name + ' to throw an exception' }
      , function(){ return 'expected ' + name + ' not to throw an exception' });
  };

  /**
   * Checks if the array is empty.
   *
   * @api public
   */

  Assertion.prototype.empty = function () {
    var expectation;

    if ('object' == typeof this.obj && null !== this.obj && !isArray(this.obj)) {
      if ('number' == typeof this.obj.length) {
        expectation = !this.obj.length;
      } else {
        expectation = !keys(this.obj).length;
      }
    } else {
      if ('string' != typeof this.obj) {
        expect(this.obj).to.be.an('object');
      }

      expect(this.obj).to.have.property('length');
      expectation = !this.obj.length;
    }

    this.assert(
        expectation
      , function(){ return 'expected ' + i(this.obj) + ' to be empty' }
      , function(){ return 'expected ' + i(this.obj) + ' to not be empty' });
    return this;
  };

  /**
   * Checks if the obj exactly equals another.
   *
   * @api public
   */

  Assertion.prototype.be =
  Assertion.prototype.equal = function (obj) {
    this.assert(
        obj === this.obj
      , function(){ return 'expected ' + i(this.obj) + ' to equal ' + i(obj) }
      , function(){ return 'expected ' + i(this.obj) + ' to not equal ' + i(obj) });
    return this;
  };

  /**
   * Checks if the obj sortof equals another.
   *
   * @api public
   */

  Assertion.prototype.eql = function (obj) {
    this.assert(
        expect.eql(this.obj, obj)
      , function(){ return 'expected ' + i(this.obj) + ' to sort of equal ' + i(obj) }
      , function(){ return 'expected ' + i(this.obj) + ' to sort of not equal ' + i(obj) }
      , obj);
    return this;
  };

  /**
   * Assert within start to finish (inclusive).
   *
   * @param {Number} start
   * @param {Number} finish
   * @api public
   */

  Assertion.prototype.within = function (start, finish) {
    var range = start + '..' + finish;
    this.assert(
        this.obj >= start && this.obj <= finish
      , function(){ return 'expected ' + i(this.obj) + ' to be within ' + range }
      , function(){ return 'expected ' + i(this.obj) + ' to not be within ' + range });
    return this;
  };

  /**
   * Assert typeof / instance of
   *
   * @api public
   */

  Assertion.prototype.a =
  Assertion.prototype.an = function (type) {
    if ('string' == typeof type) {
      // proper english in error msg
      var n = /^[aeiou]/.test(type) ? 'n' : '';

      // typeof with support for 'array'
      this.assert(
          'array' == type ? isArray(this.obj) :
            'regexp' == type ? isRegExp(this.obj) :
              'object' == type
                ? 'object' == typeof this.obj && null !== this.obj
                : type == typeof this.obj
        , function(){ return 'expected ' + i(this.obj) + ' to be a' + n + ' ' + type }
        , function(){ return 'expected ' + i(this.obj) + ' not to be a' + n + ' ' + type });
    } else {
      // instanceof
      var name = type.name || 'supplied constructor';
      this.assert(
          this.obj instanceof type
        , function(){ return 'expected ' + i(this.obj) + ' to be an instance of ' + name }
        , function(){ return 'expected ' + i(this.obj) + ' not to be an instance of ' + name });
    }

    return this;
  };

  /**
   * Assert numeric value above _n_.
   *
   * @param {Number} n
   * @api public
   */

  Assertion.prototype.greaterThan =
  Assertion.prototype.above = function (n) {
    this.assert(
        this.obj > n
      , function(){ return 'expected ' + i(this.obj) + ' to be above ' + n }
      , function(){ return 'expected ' + i(this.obj) + ' to be below ' + n });
    return this;
  };

  /**
   * Assert numeric value below _n_.
   *
   * @param {Number} n
   * @api public
   */

  Assertion.prototype.lessThan =
  Assertion.prototype.below = function (n) {
    this.assert(
        this.obj < n
      , function(){ return 'expected ' + i(this.obj) + ' to be below ' + n }
      , function(){ return 'expected ' + i(this.obj) + ' to be above ' + n });
    return this;
  };

  /**
   * Assert string value matches _regexp_.
   *
   * @param {RegExp} regexp
   * @api public
   */

  Assertion.prototype.match = function (regexp) {
    this.assert(
        regexp.exec(this.obj)
      , function(){ return 'expected ' + i(this.obj) + ' to match ' + regexp }
      , function(){ return 'expected ' + i(this.obj) + ' not to match ' + regexp });
    return this;
  };

  /**
   * Assert property "length" exists and has value of _n_.
   *
   * @param {Number} n
   * @api public
   */

  Assertion.prototype.length = function (n) {
    expect(this.obj).to.have.property('length');
    var len = this.obj.length;
    this.assert(
        n == len
      , function(){ return 'expected ' + i(this.obj) + ' to have a length of ' + n + ' but got ' + len }
      , function(){ return 'expected ' + i(this.obj) + ' to not have a length of ' + len });
    return this;
  };

  /**
   * Assert property _name_ exists, with optional _val_.
   *
   * @param {String} name
   * @param {Mixed} val
   * @api public
   */

  Assertion.prototype.property = function (name, val) {
    if (this.flags.own) {
      this.assert(
          Object.prototype.hasOwnProperty.call(this.obj, name)
        , function(){ return 'expected ' + i(this.obj) + ' to have own property ' + i(name) }
        , function(){ return 'expected ' + i(this.obj) + ' to not have own property ' + i(name) });
      return this;
    }

    if (this.flags.not && undefined !== val) {
      if (undefined === this.obj[name]) {
        throw new Error(i(this.obj) + ' has no property ' + i(name));
      }
    } else {
      var hasProp;
      try {
        hasProp = name in this.obj
      } catch (e) {
        hasProp = undefined !== this.obj[name]
      }

      this.assert(
          hasProp
        , function(){ return 'expected ' + i(this.obj) + ' to have a property ' + i(name) }
        , function(){ return 'expected ' + i(this.obj) + ' to not have a property ' + i(name) });
    }

    if (undefined !== val) {
      this.assert(
          val === this.obj[name]
        , function(){ return 'expected ' + i(this.obj) + ' to have a property ' + i(name)
          + ' of ' + i(val) + ', but got ' + i(this.obj[name]) }
        , function(){ return 'expected ' + i(this.obj) + ' to not have a property ' + i(name)
          + ' of ' + i(val) });
    }

    this.obj = this.obj[name];
    return this;
  };

  /**
   * Assert that the array contains _obj_ or string contains _obj_.
   *
   * @param {Mixed} obj|string
   * @api public
   */

  Assertion.prototype.string =
  Assertion.prototype.contain = function (obj) {
    if ('string' == typeof this.obj) {
      this.assert(
          ~this.obj.indexOf(obj)
        , function(){ return 'expected ' + i(this.obj) + ' to contain ' + i(obj) }
        , function(){ return 'expected ' + i(this.obj) + ' to not contain ' + i(obj) });
    } else {
      this.assert(
          ~indexOf(this.obj, obj)
        , function(){ return 'expected ' + i(this.obj) + ' to contain ' + i(obj) }
        , function(){ return 'expected ' + i(this.obj) + ' to not contain ' + i(obj) });
    }
    return this;
  };

  /**
   * Assert exact keys or inclusion of keys by using
   * the `.own` modifier.
   *
   * @param {Array|String ...} keys
   * @api public
   */

  Assertion.prototype.key =
  Assertion.prototype.keys = function ($keys) {
    var str
      , ok = true;

    $keys = isArray($keys)
      ? $keys
      : Array.prototype.slice.call(arguments);

    if (!$keys.length) throw new Error('keys required');

    var actual = keys(this.obj)
      , len = $keys.length;

    // Inclusion
    ok = every($keys, function (key) {
      return ~indexOf(actual, key);
    });

    // Strict
    if (!this.flags.not && this.flags.only) {
      ok = ok && $keys.length == actual.length;
    }

    // Key string
    if (len > 1) {
      $keys = map($keys, function (key) {
        return i(key);
      });
      var last = $keys.pop();
      str = $keys.join(', ') + ', and ' + last;
    } else {
      str = i($keys[0]);
    }

    // Form
    str = (len > 1 ? 'keys ' : 'key ') + str;

    // Have / include
    str = (!this.flags.only ? 'include ' : 'only have ') + str;

    // Assertion
    this.assert(
        ok
      , function(){ return 'expected ' + i(this.obj) + ' to ' + str }
      , function(){ return 'expected ' + i(this.obj) + ' to not ' + str });

    return this;
  };

  /**
   * Assert a failure.
   *
   * @param {String ...} custom message
   * @api public
   */
  Assertion.prototype.fail = function (msg) {
    var error = function() { return msg || "explicit failure"; }
    this.assert(false, error, error);
    return this;
  };

  /**
   * Function bind implementation.
   */

  function bind (fn, scope) {
    return function () {
      return fn.apply(scope, arguments);
    }
  }

  /**
   * Array every compatibility
   *
   * @see bit.ly/5Fq1N2
   * @api public
   */

  function every (arr, fn, thisObj) {
    var scope = thisObj || global;
    for (var i = 0, j = arr.length; i < j; ++i) {
      if (!fn.call(scope, arr[i], i, arr)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Array indexOf compatibility.
   *
   * @see bit.ly/a5Dxa2
   * @api public
   */

  function indexOf (arr, o, i) {
    if (Array.prototype.indexOf) {
      return Array.prototype.indexOf.call(arr, o, i);
    }

    if (arr.length === undefined) {
      return -1;
    }

    for (var j = arr.length, i = i < 0 ? i + j < 0 ? 0 : i + j : i || 0
        ; i < j && arr[i] !== o; i++);

    return j <= i ? -1 : i;
  }

  // https://gist.github.com/1044128/
  var getOuterHTML = function(element) {
    if ('outerHTML' in element) return element.outerHTML;
    var ns = "http://www.w3.org/1999/xhtml";
    var container = document.createElementNS(ns, '_');
    var xmlSerializer = new XMLSerializer();
    var html;
    if (document.xmlVersion) {
      return xmlSerializer.serializeToString(element);
    } else {
      container.appendChild(element.cloneNode(false));
      html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
      container.innerHTML = '';
      return html;
    }
  };

  // Returns true if object is a DOM element.
  var isDOMElement = function (object) {
    if (typeof HTMLElement === 'object') {
      return object instanceof HTMLElement;
    } else {
      return object &&
        typeof object === 'object' &&
        object.nodeType === 1 &&
        typeof object.nodeName === 'string';
    }
  };

  /**
   * Inspects an object.
   *
   * @see taken from node.js `util` module (copyright Joyent, MIT license)
   * @api private
   */

  function i (obj, showHidden, depth) {
    var seen = [];

    function stylize (str) {
      return str;
    }

    function format (value, recurseTimes) {
      // Provide a hook for user-specified inspect functions.
      // Check that value is an object with an inspect function on it
      if (value && typeof value.inspect === 'function' &&
          // Filter out the util module, it's inspect function is special
          value !== exports &&
          // Also filter out any prototype objects using the circular check.
          !(value.constructor && value.constructor.prototype === value)) {
        return value.inspect(recurseTimes);
      }

      // Primitive types cannot have properties
      switch (typeof value) {
        case 'undefined':
          return stylize('undefined', 'undefined');

        case 'string':
          var simple = '\'' + json.stringify(value).replace(/^"|"$/g, '')
                                                   .replace(/'/g, "\\'")
                                                   .replace(/\\"/g, '"') + '\'';
          return stylize(simple, 'string');

        case 'number':
          return stylize('' + value, 'number');

        case 'boolean':
          return stylize('' + value, 'boolean');
      }
      // For some reason typeof null is "object", so special case here.
      if (value === null) {
        return stylize('null', 'null');
      }

      if (isDOMElement(value)) {
        return getOuterHTML(value);
      }

      // Look up the keys of the object.
      var visible_keys = keys(value);
      var $keys = showHidden ? Object.getOwnPropertyNames(value) : visible_keys;

      // Functions without properties can be shortcutted.
      if (typeof value === 'function' && $keys.length === 0) {
        if (isRegExp(value)) {
          return stylize('' + value, 'regexp');
        } else {
          var name = value.name ? ': ' + value.name : '';
          return stylize('[Function' + name + ']', 'special');
        }
      }

      // Dates without properties can be shortcutted
      if (isDate(value) && $keys.length === 0) {
        return stylize(value.toUTCString(), 'date');
      }
      
      // Error objects can be shortcutted
      if (value instanceof Error) {
        return stylize("["+value.toString()+"]", 'Error');
      }

      var base, type, braces;
      // Determine the object type
      if (isArray(value)) {
        type = 'Array';
        braces = ['[', ']'];
      } else {
        type = 'Object';
        braces = ['{', '}'];
      }

      // Make functions say that they are functions
      if (typeof value === 'function') {
        var n = value.name ? ': ' + value.name : '';
        base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
      } else {
        base = '';
      }

      // Make dates with properties first say the date
      if (isDate(value)) {
        base = ' ' + value.toUTCString();
      }

      if ($keys.length === 0) {
        return braces[0] + base + braces[1];
      }

      if (recurseTimes < 0) {
        if (isRegExp(value)) {
          return stylize('' + value, 'regexp');
        } else {
          return stylize('[Object]', 'special');
        }
      }

      seen.push(value);

      var output = map($keys, function (key) {
        var name, str;
        if (value.__lookupGetter__) {
          if (value.__lookupGetter__(key)) {
            if (value.__lookupSetter__(key)) {
              str = stylize('[Getter/Setter]', 'special');
            } else {
              str = stylize('[Getter]', 'special');
            }
          } else {
            if (value.__lookupSetter__(key)) {
              str = stylize('[Setter]', 'special');
            }
          }
        }
        if (indexOf(visible_keys, key) < 0) {
          name = '[' + key + ']';
        }
        if (!str) {
          if (indexOf(seen, value[key]) < 0) {
            if (recurseTimes === null) {
              str = format(value[key]);
            } else {
              str = format(value[key], recurseTimes - 1);
            }
            if (str.indexOf('\n') > -1) {
              if (isArray(value)) {
                str = map(str.split('\n'), function (line) {
                  return '  ' + line;
                }).join('\n').substr(2);
              } else {
                str = '\n' + map(str.split('\n'), function (line) {
                  return '   ' + line;
                }).join('\n');
              }
            }
          } else {
            str = stylize('[Circular]', 'special');
          }
        }
        if (typeof name === 'undefined') {
          if (type === 'Array' && key.match(/^\d+$/)) {
            return str;
          }
          name = json.stringify('' + key);
          if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
            name = name.substr(1, name.length - 2);
            name = stylize(name, 'name');
          } else {
            name = name.replace(/'/g, "\\'")
                       .replace(/\\"/g, '"')
                       .replace(/(^"|"$)/g, "'");
            name = stylize(name, 'string');
          }
        }

        return name + ': ' + str;
      });

      seen.pop();

      var numLinesEst = 0;
      var length = reduce(output, function (prev, cur) {
        numLinesEst++;
        if (indexOf(cur, '\n') >= 0) numLinesEst++;
        return prev + cur.length + 1;
      }, 0);

      if (length > 50) {
        output = braces[0] +
                 (base === '' ? '' : base + '\n ') +
                 ' ' +
                 output.join(',\n  ') +
                 ' ' +
                 braces[1];

      } else {
        output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
      }

      return output;
    }
    return format(obj, (typeof depth === 'undefined' ? 2 : depth));
  }

  expect.stringify = i;

  function isArray (ar) {
    return Object.prototype.toString.call(ar) === '[object Array]';
  }

  function isRegExp(re) {
    var s;
    try {
      s = '' + re;
    } catch (e) {
      return false;
    }

    return re instanceof RegExp || // easy case
           // duck-type for context-switching evalcx case
           typeof(re) === 'function' &&
           re.constructor.name === 'RegExp' &&
           re.compile &&
           re.test &&
           re.exec &&
           s.match(/^\/.*\/[gim]{0,3}$/);
  }

  function isDate(d) {
    return d instanceof Date;
  }

  function keys (obj) {
    if (Object.keys) {
      return Object.keys(obj);
    }

    var keys = [];

    for (var i in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, i)) {
        keys.push(i);
      }
    }

    return keys;
  }

  function map (arr, mapper, that) {
    if (Array.prototype.map) {
      return Array.prototype.map.call(arr, mapper, that);
    }

    var other= new Array(arr.length);

    for (var i= 0, n = arr.length; i<n; i++)
      if (i in arr)
        other[i] = mapper.call(that, arr[i], i, arr);

    return other;
  }

  function reduce (arr, fun) {
    if (Array.prototype.reduce) {
      return Array.prototype.reduce.apply(
          arr
        , Array.prototype.slice.call(arguments, 1)
      );
    }

    var len = +this.length;

    if (typeof fun !== "function")
      throw new TypeError();

    // no value to return if no initial value and an empty array
    if (len === 0 && arguments.length === 1)
      throw new TypeError();

    var i = 0;
    if (arguments.length >= 2) {
      var rv = arguments[1];
    } else {
      do {
        if (i in this) {
          rv = this[i++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++i >= len)
          throw new TypeError();
      } while (true);
    }

    for (; i < len; i++) {
      if (i in this)
        rv = fun.call(null, rv, this[i], i, this);
    }

    return rv;
  }

  /**
   * Asserts deep equality
   *
   * @see taken from node.js `assert` module (copyright Joyent, MIT license)
   * @api private
   */

  expect.eql = function eql(actual, expected) {
    // 7.1. All identical values are equivalent, as determined by ===.
    if (actual === expected) {
      return true;
    } else if ('undefined' != typeof Buffer
      && Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
      if (actual.length != expected.length) return false;

      for (var i = 0; i < actual.length; i++) {
        if (actual[i] !== expected[i]) return false;
      }

      return true;

      // 7.2. If the expected value is a Date object, the actual value is
      // equivalent if it is also a Date object that refers to the same time.
    } else if (actual instanceof Date && expected instanceof Date) {
      return actual.getTime() === expected.getTime();

      // 7.3. Other pairs that do not both pass typeof value == "object",
      // equivalence is determined by ==.
    } else if (typeof actual != 'object' && typeof expected != 'object') {
      return actual == expected;
    // If both are regular expression use the special `regExpEquiv` method
    // to determine equivalence.
    } else if (isRegExp(actual) && isRegExp(expected)) {
      return regExpEquiv(actual, expected);
    // 7.4. For all other Object pairs, including Array objects, equivalence is
    // determined by having the same number of owned properties (as verified
    // with Object.prototype.hasOwnProperty.call), the same set of keys
    // (although not necessarily the same order), equivalent values for every
    // corresponding key, and an identical "prototype" property. Note: this
    // accounts for both named and indexed properties on Arrays.
    } else {
      return objEquiv(actual, expected);
    }
  };

  function isUndefinedOrNull (value) {
    return value === null || value === undefined;
  }

  function isArguments (object) {
    return Object.prototype.toString.call(object) == '[object Arguments]';
  }

  function regExpEquiv (a, b) {
    return a.source === b.source && a.global === b.global &&
           a.ignoreCase === b.ignoreCase && a.multiline === b.multiline;
  }

  function objEquiv (a, b) {
    if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
      return false;
    // an identical "prototype" property.
    if (a.prototype !== b.prototype) return false;
    //~~~I've managed to break Object.keys through screwy arguments passing.
    //   Converting to array solves the problem.
    if (isArguments(a)) {
      if (!isArguments(b)) {
        return false;
      }
      a = pSlice.call(a);
      b = pSlice.call(b);
      return expect.eql(a, b);
    }
    try{
      var ka = keys(a),
        kb = keys(b),
        key, i;
    } catch (e) {//happens when one is a string literal and the other isn't
      return false;
    }
    // having the same number of owned properties (keys incorporates hasOwnProperty)
    if (ka.length != kb.length)
      return false;
    //the same set of keys (although not necessarily the same order),
    ka.sort();
    kb.sort();
    //~~~cheap key test
    for (i = ka.length - 1; i >= 0; i--) {
      if (ka[i] != kb[i])
        return false;
    }
    //equivalent values for every corresponding key, and
    //~~~possibly expensive deep test
    for (i = ka.length - 1; i >= 0; i--) {
      key = ka[i];
      if (!expect.eql(a[key], b[key]))
         return false;
    }
    return true;
  }

  var json = (function () {
    "use strict";

    if ('object' == typeof JSON && JSON.parse && JSON.stringify) {
      return {
          parse: nativeJSON.parse
        , stringify: nativeJSON.stringify
      }
    }

    var JSON = {};

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    function date(d, key) {
      return isFinite(d.valueOf()) ?
          d.getUTCFullYear()     + '-' +
          f(d.getUTCMonth() + 1) + '-' +
          f(d.getUTCDate())      + 'T' +
          f(d.getUTCHours())     + ':' +
          f(d.getUTCMinutes())   + ':' +
          f(d.getUTCSeconds())   + 'Z' : null;
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

  // If the string contains no control characters, no quote characters, and no
  // backslash characters, then we can safely slap some quotes around it.
  // Otherwise we must also replace the offending characters with safe escape
  // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

  // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

  // If the value has a toJSON method, call it to obtain a replacement value.

        if (value instanceof Date) {
            value = date(key);
        }

  // If we were called with a replacer function, then call the replacer to
  // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

  // What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

  // JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

  // If the value is a boolean or null, convert it to a string. Note:
  // typeof null does not produce 'null'. The case is included here in
  // the remote chance that this gets fixed someday.

            return String(value);

  // If the type is 'object', we might be dealing with an object or an array or
  // null.

        case 'object':

  // Due to a specification blunder in ECMAScript, typeof null is 'object',
  // so watch out for that case.

            if (!value) {
                return 'null';
            }

  // Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

  // Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

  // The value is an array. Stringify every element. Use null as a placeholder
  // for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

  // Join all of the elements together, separated with commas, and wrap them in
  // brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

  // If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

  // Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

  // Join all of the member texts together, separated with commas,
  // and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

  // If the JSON object does not yet have a stringify method, give it one.

    JSON.stringify = function (value, replacer, space) {

  // The stringify method takes a value and an optional replacer, and an optional
  // space parameter, and returns a JSON text. The replacer can be a function
  // that can replace values, or an array of strings that will select the keys.
  // A default replacer method can be provided. Use of the space parameter can
  // produce text that is more easily readable.

        var i;
        gap = '';
        indent = '';

  // If the space parameter is a number, make an indent string containing that
  // many spaces.

        if (typeof space === 'number') {
            for (i = 0; i < space; i += 1) {
                indent += ' ';
            }

  // If the space parameter is a string, it will be used as the indent string.

        } else if (typeof space === 'string') {
            indent = space;
        }

  // If there is a replacer, it must be a function or an array.
  // Otherwise, throw an error.

        rep = replacer;
        if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                typeof replacer.length !== 'number')) {
            throw new Error('JSON.stringify');
        }

  // Make a fake root object containing our value under the key of ''.
  // Return the result of stringifying the value.

        return str('', {'': value});
    };

  // If the JSON object does not yet have a parse method, give it one.

    JSON.parse = function (text, reviver) {
    // The parse method takes a text and an optional reviver function, and returns
    // a JavaScript value if the text is a valid JSON text.

        var j;

        function walk(holder, key) {

    // The walk method is used to recursively walk the resulting structure so
    // that modifications can be made.

            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }


    // Parsing happens in four stages. In the first stage, we replace certain
    // Unicode characters with escape sequences. JavaScript handles many characters
    // incorrectly, either silently deleting them, or treating them as line endings.

        text = String(text);
        cx.lastIndex = 0;
        if (cx.test(text)) {
            text = text.replace(cx, function (a) {
                return '\\u' +
                    ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            });
        }

    // In the second stage, we run the text against regular expressions that look
    // for non-JSON patterns. We are especially concerned with '()' and 'new'
    // because they can cause invocation, and '=' because it can cause mutation.
    // But just to be safe, we want to reject all unexpected forms.

    // We split the second stage into 4 regexp operations in order to work around
    // crippling inefficiencies in IE's and Safari's regexp engines. First we
    // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
    // replace all simple value tokens with ']' characters. Third, we delete all
    // open brackets that follow a colon or comma or that begin the text. Finally,
    // we look to see that the remaining characters are only whitespace or ']' or
    // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

        if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

    // In the third stage we use the eval function to compile the text into a
    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
    // in JavaScript: it can begin a block or an object literal. We wrap the text
    // in parens to eliminate the ambiguity.

            j = eval('(' + text + ')');

    // In the optional fourth stage, we recursively walk the new structure, passing
    // each name/value pair to a reviver function for possible transformation.

            return typeof reviver === 'function' ?
                walk({'': j}, '') : j;
        }

    // If the text is not JSON parseable, then a SyntaxError is thrown.

        throw new SyntaxError('JSON.parse');
    };

    return JSON;
  })();

  if ('undefined' != typeof window) {
    window.expect = module.exports;
  }

})(
    this
  , 'undefined' != typeof module ? module : {exports: {}}
);

}).call(this,require("buffer").Buffer)
},{"buffer":2}],4:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],5:[function(require,module,exports){
(function(module) {
    'use strict';

    module.exports.is_uri = is_iri;
    module.exports.is_http_uri = is_http_iri;
    module.exports.is_https_uri = is_https_iri;
    module.exports.is_web_uri = is_web_iri;
    // Create aliases
    module.exports.isUri = is_iri;
    module.exports.isHttpUri = is_http_iri;
    module.exports.isHttpsUri = is_https_iri;
    module.exports.isWebUri = is_web_iri;


    // private function
    // internal URI spitter method - direct from RFC 3986
    var splitUri = function(uri) {
        var splitted = uri.match(/(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/);
        return splitted;
    };

    function is_iri(value) {
        if (!value) {
            return;
        }

        // check for illegal characters
        if (/[^a-z0-9\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\.\-\_\~\%]/i.test(value)) return;

        // check for hex escapes that aren't complete
        if (/%[^0-9a-f]/i.test(value)) return;
        if (/%[0-9a-f](:?[^0-9a-f]|$)/i.test(value)) return;

        var splitted = [];
        var scheme = '';
        var authority = '';
        var path = '';
        var query = '';
        var fragment = '';
        var out = '';

        // from RFC 3986
        splitted = splitUri(value);
        scheme = splitted[1]; 
        authority = splitted[2];
        path = splitted[3];
        query = splitted[4];
        fragment = splitted[5];

        // scheme and path are required, though the path can be empty
        if (!(scheme && scheme.length && path.length >= 0)) return;

        // if authority is present, the path must be empty or begin with a /
        if (authority && authority.length) {
            if (!(path.length === 0 || /^\//.test(path))) return;
        } else {
            // if authority is not present, the path must not start with //
            if (/^\/\//.test(path)) return;
        }

        // scheme must begin with a letter, then consist of letters, digits, +, ., or -
        if (!/^[a-z][a-z0-9\+\-\.]*$/.test(scheme.toLowerCase()))  return;

        // re-assemble the URL per section 5.3 in RFC 3986
        out += scheme + ':';
        if (authority && authority.length) {
            out += '//' + authority;
        }

        out += path;

        if (query && query.length) {
            out += '?' + query;
        }

        if (fragment && fragment.length) {
            out += '#' + fragment;
        }

        return out;
    }

    function is_http_iri(value, allowHttps) {
        if (!is_iri(value)) {
            return;
        }

        var splitted = [];
        var scheme = '';
        var authority = '';
        var path = '';
        var port = '';
        var query = '';
        var fragment = '';
        var out = '';

        // from RFC 3986
        splitted = splitUri(value);
        scheme = splitted[1]; 
        authority = splitted[2];
        path = splitted[3];
        query = splitted[4];
        fragment = splitted[5];

        if (!scheme)  return;

        if(allowHttps) {
            if (scheme.toLowerCase() != 'https') return;
        } else {
            if (scheme.toLowerCase() != 'http') return;
        }

        // fully-qualified URIs must have an authority section that is
        // a valid host
        if (!authority) {
            return;
        }

        // enable port component
        if (/:(\d+)$/.test(authority)) {
            port = authority.match(/:(\d+)$/)[0];
            authority = authority.replace(/:\d+$/, '');
        }

        out += scheme + ':';
        out += '//' + authority;
        
        if (port) {
            out += port;
        }
        
        out += path;
        
        if(query && query.length){
            out += '?' + query;
        }

        if(fragment && fragment.length){
            out += '#' + fragment;
        }
        
        return out;
    }

    function is_https_iri(value) {
        return is_http_iri(value, true);
    }

    function is_web_iri(value) {
        return (is_http_iri(value) || is_https_iri(value));
    }

})(module);

},{}],6:[function(require,module,exports){
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

},{"../dist/card-info":1,"../tasks/_get-banks-and-prefixes":2,"../tasks/_read-banks":2,"expect.js":3,"underscore":4,"valid-url":5}]},{},[6]);
