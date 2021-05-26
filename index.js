;(function () {
  var binking = function (cardNumberSource, optionsOrCallback, callbackSource) {
    var result = binking._assign({}, binking.defaultResult)
    var optionsAndCallback = binking._getOptionsAndCallback(optionsOrCallback, callbackSource)
    var options = optionsAndCallback.options
    var callback = optionsAndCallback.callback
    binking._checkOptions(options, 'Form')
    result.cardNumberSource = cardNumberSource
    result.cardNumberNormalized = binking._getCardNumberNormalized(result.cardNumberSource)
    result.cardNumberValidByLuhn = binking._isValidByLuhn(result.cardNumberNormalized)
    if (options.strategy === 'archive') {
      if (result.cardNumberNormalized.length >= 6) {
        var bank = binking._getBankByCardNumber(result.cardNumberNormalized)
        binking._appendResultWithArchiveBank(result, options, bank)
      }
      binking._appendResultWithBrand(result, options)
      if (options.sync) {
        return result
      } else if (callback) {
        callback(result)
      } else if (binking._promiseSupported) {
        return Promise.resolve(result)
      }
    } else {
      if (result.cardNumberNormalized.length >= 6) {
        var apiRequestOptions = {
          apiUrl: options.apiFormUrl,
          apiKey: options.apiKey,
          cardNumber: result.cardNumberNormalized.substr(0, 6),
          sandbox: options.sandbox
        }
        if (callback) {
          binking._apiRequest(apiRequestOptions, function (res, err) {
            if (err) {
              console.error(err)
              binking._appendResultWithBrand(result, options)
              callback(result)
            } else {
              binking._appendResultByApiResponse(result, options, res)
              binking._appendResultWithBrand(result, options)
              callback(result)
            }
          })
        } else if (binking._promiseSupported) {
          return new Promise(function (resolve) {
            binking._apiRequest(apiRequestOptions, function (res, err) {
              if (err) {
                console.error(err)
                binking._appendResultWithBrand(result, options)
                resolve(result)
              } else {
                binking._appendResultByApiResponse(result, options, res)
                binking._appendResultWithBrand(result, options)
                resolve(result)
              }
            })
          })
        }
      } else {
        binking._appendResultWithBrand(result, options)
        if (callback) {
          callback(result)
        } else if (binking._promiseSupported) {
          return Promise.resolve(result)
        }
      }
    }
  }

  binking.getBrand = function (brandAlias, optionsSource) {
    var options = binking._assign({}, binking.defaultOptions, optionsSource || {})
    var brand = binking._brands[brandAlias]
    if (!brand) return null
    var logoOriginalSvg = options.brandsLogosPath + brand.alias + '-original.svg'
    var logoInvertedSvg = options.brandsLogosPath + brand.alias + '-inverted.svg'
    var logoOriginalPng = options.brandsLogosPath + brand.alias + '-original.png'
    var logoInvertedPng = options.brandsLogosPath + brand.alias + '-inverted.png'
    var brandWithLogos = binking._assign({}, brand, {
      logoOriginalSvg: logoOriginalSvg,
      logoInvertedSvg: logoInvertedSvg,
      logoOriginalPng: logoOriginalPng,
      logoInvertedPng: logoInvertedPng
    })
    return brandWithLogos
  }

  binking.getBrands = function (brandsAliasesOrOptions, optionsSource) {
    var brandsAliases
    var options
    if (!brandsAliasesOrOptions) {
      brandsAliases = Object.keys(binking._brands)
      options = {}
    } else if (binking._isArray(brandsAliasesOrOptions)) {
      brandsAliases = brandsAliasesOrOptions
      options = optionsSource
    } else {
      brandsAliases = Object.keys(binking._brands)
      options = brandsAliasesOrOptions
    }
    var brandsWithLogos = []
    for (var i = 0; i < brandsAliases.length; i++) {
      var brandAlias = brandsAliases[i]
      var brandWithLogos = binking.getBrand(brandAlias, options)
      if (brandWithLogos) brandsWithLogos.push(brandWithLogos)
    }
    return brandsWithLogos
  }

  binking.getBank = function (bankAlias, optionsOrCallback, callbackSource) {
    var optionsAndCallback = binking._getOptionsAndCallback(optionsOrCallback, callbackSource)
    var options = optionsAndCallback.options
    var callback = optionsAndCallback.callback
    binking._checkOptions(options, 'Bank')
    var result
    if (options.strategy === 'archive') {
      var bank = binking._banks[bankAlias]
      result = bank ? binking._appendResultWithArchiveBank({}, options, bank) : null
      if (options.sync) {
        return result
      } else if (callback) {
        callback(result)
      } else if (binking._promiseSupported) {
        return Promise.resolve(result)
      }
    } else {
      var apiRequestOptions = {
        apiUrl: options.apiBankUrl,
        apiKey: options.apiKey,
        bankAlias: bankAlias,
        sandbox: options.sandbox
      }
      if (callback) {
        binking._apiRequest(apiRequestOptions, function (res, err) {
          if (err) {
            console.error(err)
            callback(null)
          } else {
            result = res ? binking._appendResultByApiResponse({}, options, res) : null
            callback(result)
          }
        })
      } else if (binking._promiseSupported) {
        return new Promise(function (resolve) {
          binking._apiRequest(apiRequestOptions, function (res, err) {
            if (err) {
              console.error(err)
              resolve(null)
            } else {
              result = res ? binking._appendResultByApiResponse({}, options, res) : null
              resolve(result)
            }
          })
        })
      }
    }
  }

  binking.getBanks = function (banksAliases, optionsOrCallback, callbackSource) {
    var optionsAndCallback = binking._getOptionsAndCallback(optionsOrCallback, callbackSource)
    var options = optionsAndCallback.options
    var callback = optionsAndCallback.callback
    binking._checkOptions(options, 'Banks')
    var result = []
    var i
    if (options.strategy === 'archive') {
      for (i = 0; i < banksAliases.length; i++) {
        var bankAlias = banksAliases[i]
        var bank = binking._banks[bankAlias]
        var resultPart = bank ? binking._appendResultWithArchiveBank({}, options, bank) : null
        result.push(resultPart)
      }
      if (options.sync) {
        return result
      } else if (callback) {
        callback(result)
      } else if (binking._promiseSupported) {
        return Promise.resolve(result)
      }
    } else {
      var apiRequestOptions = {
        apiUrl: options.apiBanksUrl,
        apiKey: options.apiKey,
        banksAliases: banksAliases.join(','),
        sandbox: options.sandbox
      }
      if (callback) {
        binking._apiRequest(apiRequestOptions, function (res, err) {
          if (err) {
            console.error(err)
            for (i = 0; i < banksAliases.length; i++) {
              result.push(null)
            }
            callback(result)
          } else {
            for (i = 0; i < res.length; i++) {
              var resPart = res[i]
              var resultPart = resPart ? binking._appendResultByApiResponse({}, options, resPart) : null
              result.push(resultPart)
            }
            callback(result)
          }
        })
      } else if (binking._promiseSupported) {
        return new Promise(function (resolve) {
          binking._apiRequest(apiRequestOptions, function (res, err) {
            if (err) {
              console.error(err)
              for (i = 0; i < banksAliases.length; i++) {
                result.push(null)
              }
              resolve(result)
            } else {
              for (i = 0; i < res.length; i++) {
                var resPart = res[i]
                var resultPart = resPart ? binking._appendResultByApiResponse({}, options, resPart) : null
                result.push(resultPart)
              }
              resolve(result)
            }
          })
        })
      }
    }
  }

  binking.getBrandLogo = function (brandAlias, formLogoSchemeSource, optionsSource) {
    var options = binking._assign({}, binking.defaultOptions, optionsSource || {})
    var formLogoScheme = formLogoSchemeSource || 'original'
    return options.brandsLogosPath + brandAlias + '-' + formLogoScheme + '.svg'
  }

  binking.setDefaultOptions = function (options) {
    binking._assign(binking.defaultOptions, options)
  }

  binking.setValidationErrors = function (errorCodes) {
    binking._assign(binking.validationErrors, errorCodes)
  }

  binking.validationErrors = {
    CARD_NUMBER_REQUIRED: 'Indicate your bank card number',
    CARD_NUMBER_INVALID: 'Card number contains invalid symbols',
    CARD_NUMBER_INCOMPLETE: 'Card number entry is incomplete',
    CARD_NUMBER_OVERCOMPLETE: 'Card number input exceeds allowable number of symbols',
    CARD_NUMBER_LUHN: 'Card number entry contains typo',
    MONTH_REQUIRED: 'Indicate card expiry date',
    MONTH_INVALID: 'Error in card expiry date',
    YEAR_REQUIRED: 'Indicate year of card expiry',
    YEAR_INVALID: 'Error in year of card expiry',
    YEAR_IN_PAST: 'Year of card expiry can not be in the past',
    MONTH_IN_PAST: 'Month of card expiry can not be in the past',
    CODE_REQUIRED: 'Please indicate security code',
    CODE_INVALID: 'Security code is invalid'
  }

  binking._isValidByLuhn = function (cardNumberNormalized) {
    var nCheck = 0
    var bEven = false
    for (var n = cardNumberNormalized.length - 1; n >= 0; n--) {
      var cDigit = cardNumberNormalized.charAt(n)
      var nDigit = parseInt(cDigit, 10)
      if (bEven && (nDigit *= 2) > 9) nDigit -= 9
      nCheck += nDigit
      bEven = !bEven
    }
    return nCheck % 10 === 0
  }

  binking.validateCardNumber = function (cardNumberSource) {
    var cardNumber = cardNumberSource + ''
    if (!cardNumber) {
      return binking._makeValidationError('cardNumber', 'CARD_NUMBER_REQUIRED')
    }
    if (/[^\d\s]+/.test(cardNumber)) {
      return binking._makeValidationError('cardNumber', 'CARD_NUMBER_INVALID')
    }
    var cardNumberNormalized = binking._getCardNumberNormalized(cardNumber)
    var brand = binking._getBrandByCardNumber(cardNumberNormalized)
    var minLength = brand ? brand.lengths[0] : 12
    var maxLength = brand ? brand.lengths[brand.lengths.length - 1] : 19
    if (cardNumberNormalized.length < minLength) {
      return binking._makeValidationError('cardNumber', 'CARD_NUMBER_INCOMPLETE')
    }
    if (cardNumberNormalized.length > maxLength) {
      return binking._makeValidationError('cardNumber', 'CARD_NUMBER_OVERCOMPLETE')
    }
    if (!binking._isValidByLuhn(cardNumberNormalized)) {
      return binking._makeValidationError('cardNumber', 'CARD_NUMBER_LUHN')
    }
  }

  binking.validateMonth = function (monthSource) {
    var month = monthSource + ''
    if (!month) {
      return binking._makeValidationError('month', 'MONTH_REQUIRED')
    }
    var monthInt = parseInt(month)
    if (!/^\d\d$/.test(month) || monthInt > 12 || monthInt < 1) {
      return binking._makeValidationError('month', 'MONTH_INVALID')
    }
  }

  binking.validateYear = function (yearSource) {
    var year = yearSource + ''
    if (!year) {
      return binking._makeValidationError('year', 'YEAR_REQUIRED')
    }
    if (!/^\d\d$/.test(year)) {
      return binking._makeValidationError('year', 'YEAR_INVALID')
    }
  }

  binking.validateDate = function (monthSource, yearSource) {
    var month = parseInt(monthSource)
    var year = parseInt(yearSource)
    if (isNaN(month) || isNaN(year)) return
    var now = new Date()
    var nowYear = now.getFullYear() % 2000
    var nowMonth = now.getMonth() + 1
    if (nowYear > year) {
      return binking._makeValidationError('year', 'YEAR_IN_PAST')
    }
    if (nowYear === year && nowMonth > month) {
      return binking._makeValidationError('month', 'MONTH_IN_PAST')
    }
  }

  binking.validateCode = function (codeSource) {
    var code = codeSource + ''
    if (!code) {
      return binking._makeValidationError('code', 'CODE_REQUIRED')
    }
    if (!/^\d\d\d\d?$/.test(code)) {
      return binking._makeValidationError('code', 'CODE_INVALID')
    }
  }

  binking.validate = function (cardNumberSource, monthSource, yearSource, codeSource) {
    var hasErrors = false
    var errors = {}
    var cardNumberValidationError = binking.validateCardNumber(cardNumberSource)
    if (cardNumberValidationError) {
      errors[cardNumberValidationError.field] = cardNumberValidationError
      hasErrors = true
    }
    var monthValidationError = binking.validateMonth(monthSource)
    if (monthValidationError) {
      errors[monthValidationError.field] = monthValidationError
      hasErrors = true
    }
    var yearValidationError = binking.validateYear(yearSource)
    if (yearValidationError) {
      errors[yearValidationError.field] = yearValidationError
      hasErrors = true
    }
    if (!monthValidationError && !yearValidationError) {
      var dateValidationError = binking.validateDate(monthSource, yearSource)
      if (dateValidationError) {
        errors[dateValidationError.field] = dateValidationError
        hasErrors = true
      }
    }
    var codeValidationError = binking.validateCode(codeSource)
    if (codeValidationError) {
      errors[codeValidationError.field] = codeValidationError
      hasErrors = true
    }
    return {
      hasErrors: hasErrors,
      errors: errors
    }
  }

  binking._makeValidationError = function (field, errorCode) {
    return {
      field: field,
      code: errorCode,
      message: binking.validationErrors[errorCode]
    }
  }

  binking._checkOptions = function (options, method) {
    if (options.strategy === 'archive') {
      if (!Object.keys(binking._bins).length) {
        throw new Error('BinKing: you should add banks by binking.addBanks(banks) to use archive strategy')
      }
      if (!Object.keys(binking._banks).length) {
        throw new Error('BinKing: you should add bins by binking.addBins(bins) to use archive strategy')
      }
    } else if (options.strategy === 'api') {
      if (options['api' + method + 'Url'] === binking['_defaultApi' + method + 'Url'] && !options.apiKey) {
        throw new Error('BinKing: you should set option "apiKey" if you use api strategy with default api url')
      }
    } else {
      throw new Error('BinKing: you should set option "strategy" to "api" or "archive"')
    }
  }

  binking.setDefaultResult = function (props) {
    if (props.formBackgroundColor) {
      binking.defaultResult.formBackgroundColor = props.formBackgroundColor
    }
    if (props.formBackgroundColors) {
      binking.defaultResult.formBackgroundColors = props.formBackgroundColors
      binking.defaultResult.formBackgroundGradient = binking._getGradient(
        ['#eeeeee', '#dddddd'],
        binking.defaultOptions.gradientDegrees
      )
    }
    if (props.formBackgroundLightness) {
      binking.defaultResult.formBackgroundLightness = props.formBackgroundLightness
    }
    if (props.formTextColor) {
      binking.defaultResult.formTextColor = props.formTextColor
    }
    if (props.formBorderColor) {
      binking.defaultResult.formBorderColor = props.formBorderColor
    }
  }

  binking._getOptionsAndCallback = function (optionsOrCallback, callbackSource) {
    var optionsSource = !optionsOrCallback || binking._isFunction(optionsOrCallback) ? {} : optionsOrCallback
    var options = binking._assign({}, binking.defaultOptions, optionsSource)
    var callback = callbackSource || (binking._isFunction(optionsOrCallback) ? optionsOrCallback : null)
    return { options: options, callback: callback }
  }

  binking._banks = {}

  binking.addBanks = function (banks) {
    binking._assign(binking._banks, banks)
  }

  binking._bins = {}

  binking.addBins = function (bins) {
    binking._assign(binking._bins, bins)
  }

  binking._appendResultWithBrand = function (result, options) {
    var brand = binking._getBrandByCardNumber(result.cardNumberNormalized)
    if (brand) {
      result.brandAlias = brand.alias
      result.brandName = brand.name
      result.brandLogoOriginalSvg = options.brandsLogosPath + brand.alias + '-original.svg'
      result.brandLogoInvertedSvg = options.brandsLogosPath + brand.alias + '-inverted.svg'
      result.brandLogoOriginalPng = options.brandsLogosPath + brand.alias + '-original.png'
      result.brandLogoInvertedPng = options.brandsLogosPath + brand.alias + '-inverted.png'
      var formBrandLogoBasename = binking._getFormBrandLogoBasename(
        result.brandAlias,
        options.brandLogoPolicy,
        result.formLogoScheme
      )
      result.formBrandLogoSvg = options.brandsLogosPath + formBrandLogoBasename + '.svg'
      result.formBrandLogoPng = options.brandsLogosPath + formBrandLogoBasename + '.png'
      result.codeName = brand.codeName
      result.codeMaxLength = brand.codeMaxLength
      result.codeMinLength = brand.codeMinLength
      result.cardNumberLengths = brand.lengths
      result.cardNumberMaxLength = brand.lengths[brand.lengths.length - 1]
      result.cardNumberMinLength = brand.lengths[0]
      result.cardNumberGaps = brand.gaps
    }
    result.cardNumberBlocks = binking._getBlocks(result.cardNumberGaps, result.cardNumberLengths)
    result.cardNumberMask = binking._getMask(
      options.maskDigitSymbol,
      options.maskDelimiterSymbol,
      result.cardNumberBlocks
    )
    result.cardNumberNice = binking._getNumberNice(result.cardNumberNormalized, result.cardNumberGaps)
  }

  binking._appendResultWithArchiveBank = function (result, options, bank) {
    if (bank) {
      binking._assign(result, bank)
      result.bankLogoBigOriginalSvg = options.banksLogosPath + bank.bankAlias + '-big-original.svg'
      result.bankLogoBigInvertedSvg = options.banksLogosPath + bank.bankAlias + '-big-inverted.svg'
      result.bankLogoSmallOriginalSvg = options.banksLogosPath + bank.bankAlias + '-small-original.svg'
      result.bankLogoSmallInvertedSvg = options.banksLogosPath + bank.bankAlias + '-small-inverted.svg'
      result.formBankLogoBigSvg = options.banksLogosPath + bank.bankAlias + '-big-' + bank.formLogoScheme + '.svg'
      result.formBankLogoSmallSvg = options.banksLogosPath + bank.bankAlias + '-small-' + bank.formLogoScheme + '.svg'
      result.bankLogoBigOriginalPng = options.banksLogosPath + bank.bankAlias + '-big-original.png'
      result.bankLogoBigInvertedPng = options.banksLogosPath + bank.bankAlias + '-big-inverted.png'
      result.bankLogoSmallOriginalPng = options.banksLogosPath + bank.bankAlias + '-small-original.png'
      result.bankLogoSmallInvertedPng = options.banksLogosPath + bank.bankAlias + '-small-inverted.png'
      result.formBankLogoBigPng = options.banksLogosPath + bank.bankAlias + '-big-' + bank.formLogoScheme + '.png'
      result.formBankLogoSmallPng = options.banksLogosPath + bank.bankAlias + '-small-' + bank.formLogoScheme + '.png'
    }
    result.formBackgroundGradient = binking._getGradient(result.formBackgroundColors, options.gradientDegrees)
    return result
  }

  binking._appendResultByApiResponse = function (result, options, res) {
    if (res) {
      binking._assign(result, res)
    }
    result.formBackgroundGradient = binking._getGradient(result.formBackgroundColors, options.gradientDegrees)
    return result
  }

  binking._assign = function () {
    var objTarget = arguments[0]
    for (var i = 1; i < arguments.length; i++) {
      var objSource = arguments[i]
      for (var key in objSource) {
        if (Object.prototype.hasOwnProperty.call(objSource, key)) {
          if (objSource[key] instanceof Array) {
            objTarget[key] = binking._assign([], objSource[key])
          } else {
            objTarget[key] = objSource[key]
          }
        }
      }
    }
    return objTarget
  }

  binking._getCardNumberNormalized = function (cardNumberSource) {
    var cardNumberSourceString = cardNumberSource + ''
    return cardNumberSourceString.replace(/\D/g, '')
  }

  binking._getBankByCardNumber = function (cardNumberNormalized) {
    if (cardNumberNormalized.length < 6) return null
    var bin = cardNumberNormalized.substr(0, 6)
    var bankAlias = binking._bins[bin]
    if (!bankAlias) return null
    var bank = binking._banks[bankAlias]
    return bank || null
  }

  binking._getGradient = function (colors, gradientDegrees) {
    return 'linear-gradient(' + gradientDegrees + 'deg, ' + colors.join(', ') + ')'
  }

  binking._brands = {
    visa: {
      name: 'Visa',
      alias: 'visa',
      pattern: /^4/,
      gaps: [4, 8, 12],
      lengths: [16, 18, 19],
      codeName: 'CVV',
      codeMinLength: 3,
      codeMaxLength: 3
    },
    mastercard: {
      name: 'Mastercard',
      alias: 'mastercard',
      pattern: /^(51|52|53|54|55|22|23|24|25|26|27)/,
      gaps: [4, 8, 12],
      lengths: [16],
      codeName: 'CVC',
      codeMinLength: 3,
      codeMaxLength: 3
    },
    'american-express': {
      name: 'American Express',
      alias: 'american-express',
      pattern: /^(34|37)/,
      gaps: [4, 10],
      lengths: [15],
      codeName: 'CID',
      codeMinLength: 3,
      codeMaxLength: 4
    },
    'diners-club': {
      name: 'Diners Club',
      alias: 'diners-club',
      pattern: /^(30|36|38|39)/,
      gaps: [4, 10],
      lengths: [14, 16, 19],
      codeName: 'CVV',
      codeMinLength: 3,
      codeMaxLength: 3
    },
    discover: {
      name: 'Discover',
      alias: 'discover',
      pattern: /^(60|64|65)/,
      gaps: [4, 8, 12],
      lengths: [16, 19],
      codeName: 'CID',
      codeMinLength: 3,
      codeMaxLength: 3
    },
    jcb: {
      name: 'JCB',
      alias: 'jcb',
      pattern: /^(18|21|35)/,
      gaps: [4, 8, 12],
      lengths: [16, 17, 18, 19],
      codeName: 'CVV',
      codeMinLength: 3,
      codeMaxLength: 3
    },
    unionpay: {
      name: 'UnionPay',
      alias: 'unionpay',
      pattern: /^(62)/,
      gaps: [4, 8, 12],
      lengths: [14, 15, 16, 17, 18, 19],
      codeName: 'CVN',
      codeMinLength: 3,
      codeMaxLength: 3
    },
    maestro: {
      name: 'Maestro',
      alias: 'maestro',
      pattern: /^(49|50|56|59|63|67)/,
      gaps: [4, 8, 12],
      lengths: [12, 13, 14, 15, 16, 17, 18, 19],
      codeName: 'CVC',
      codeMinLength: 3,
      codeMaxLength: 3
    },
    mir: {
      name: 'Mir',
      alias: 'mir',
      pattern: /^(22)/,
      gaps: [4, 8, 12],
      lengths: [16, 17, 18, 19],
      codeName: 'CVP2',
      codeMinLength: 3,
      codeMaxLength: 3
    }
  }

  binking._getBrandByCardNumber = function (cardNumberNormalized) {
    if (!cardNumberNormalized) return null
    var brands = []
    for (var brandAlias in binking._brands) {
      if (Object.prototype.hasOwnProperty.call(binking._brands, brandAlias)) {
        if (binking._brands[brandAlias].pattern.test(cardNumberNormalized)) brands.push(this._brands[brandAlias])
      }
    }
    if (brands.length === 1) return brands[0]
    return null
  }

  binking._isArray = function (arg) {
    if (!arg) return false
    return Object.prototype.toString.call(arg) === '[object Array]'
  }

  binking._isFunction = function (arg) {
    if (!arg) return false
    return Object.prototype.toString.call(arg) === '[object Function]'
  }

  binking._promiseSupported = typeof Promise !== 'undefined' && Promise.toString().indexOf('[native code]') !== -1

  binking._getFormBrandLogoBasename = function (brandAlias, brandLogoPolicy, formLogoScheme) {
    switch (brandLogoPolicy) {
      case 'auto':
        return brandAlias + '-' + (formLogoScheme || 'original')
      case 'inverted':
        return brandAlias + '-inverted'
      case 'original':
      default:
        return brandAlias + '-original'
    }
  }

  binking._getBlocks = function (cardNumberGaps, cardNumberLengths) {
    var numberLength = cardNumberLengths[cardNumberLengths.length - 1]
    var blocks = []
    for (var i = cardNumberGaps.length - 1; i >= 0; i--) {
      var blockLength = numberLength - cardNumberGaps[i]
      numberLength -= blockLength
      blocks.push(blockLength)
    }
    blocks.push(numberLength)
    return blocks.reverse()
  }

  binking._getMask = function (maskDigitSymbol, maskDelimiterSymbol, cardNumberBlocks) {
    var mask = ''
    for (var i = 0; i < cardNumberBlocks.length; i++) {
      mask += (i ? maskDelimiterSymbol : '') + Array(cardNumberBlocks[i] + 1).join(maskDigitSymbol)
    }
    return mask
  }

  binking._getNumberNice = function (cardNumberNormalized, cardNumberGaps) {
    var offsets = [0].concat(cardNumberGaps).concat([cardNumberNormalized.length])
    var components = []
    for (var i = 0; offsets[i] < cardNumberNormalized.length; i++) {
      var start = offsets[i]
      var end = Math.min(offsets[i + 1], cardNumberNormalized.length)
      components.push(cardNumberNormalized.substring(start, end))
    }
    return components.join(' ')
  }

  binking._buildUrl = function (url, data) {
    var fullUrl = url
    var firstKey = true
    for (var key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined) {
        fullUrl += (firstKey ? '?' : '&') + key + '=' + data[key]
        firstKey = false
      }
    }
    return fullUrl
  }

  binking._apiRequestsCount = 0

  binking._savedApiResults = {}

  binking._request = function (url, callback) {
    var _XMLHttpRequest = binking._XMLHttpRequest
    var xhr = new _XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) return
      var parsedRes, err
      try {
        parsedRes = JSON.parse(this.responseText)
      } catch (e) {
        err = new Error(this.responseText)
        callback(null, err)
        return false
      }
      if (this.status !== 200) {
        err = new Error('BinKing Api Error: ' + parsedRes.message)
        callback(null, err)
      } else {
        callback(parsedRes)
      }
    }
    xhr.send()
  }

  binking._apiRequest = function (apiRequestOptions, callback) {
    var apiUrl = apiRequestOptions.apiUrl
    var apiKey = apiRequestOptions.apiKey
    var cardNumber = apiRequestOptions.cardNumber
    var bankAlias = apiRequestOptions.bankAlias
    var banksAliases = apiRequestOptions.banksAliases
    var sandbox = apiRequestOptions.sandbox
    var url = binking._buildUrl(apiUrl, {
      apiKey: apiKey,
      cardNumber: cardNumber,
      bankAlias: bankAlias,
      banksAliases: banksAliases,
      sandbox: sandbox ? 1 : undefined
    })
    var savedApiResult = binking._savedApiResults[url]
    if (savedApiResult) {
      if (savedApiResult === 'pending') {
        var interval = setInterval(function () {
          var savedApiResultUpdated = binking._savedApiResults[url]
          if (savedApiResultUpdated !== 'pending') {
            clearInterval(interval)
            callback(savedApiResultUpdated[0], savedApiResultUpdated[1])
          }
        }, 100)
      } else {
        callback(savedApiResult[0], savedApiResult[1])
      }
    } else {
      binking._apiRequestsCount++
      binking._savedApiResults[url] = 'pending'
      binking._request(url, function (result, err) {
        binking._savedApiResults[url] = [result, err]
        callback(result, err)
      })
    }
  }

  binking._XMLHttpRequest = typeof XMLHttpRequest !== 'undefined' ? XMLHttpRequest : undefined

  binking._defaultApiFormUrl = 'https://api.binking.io/form'
  binking._defaultApiBankUrl = 'https://api.binking.io/bank'
  binking._defaultApiBanksUrl = 'https://api.binking.io/banks'

  binking.defaultOptions = {
    strategy: 'api',
    apiFormUrl: binking._defaultApiFormUrl,
    apiBankUrl: binking._defaultApiBankUrl,
    apiBanksUrl: binking._defaultApiBanksUrl,
    apiKey: undefined,
    sandbox: false,
    sync: false,
    banksLogosPath: '',
    brandsLogosPath: 'https://static.binking.io/brands-logos/',
    maskDigitSymbol: '0',
    maskDelimiterSymbol: ' ',
    gradientDegrees: 135,
    brandLogoPolicy: 'auto'
  }

  binking.defaultResult = {
    bankAlias: null,
    bankName: null,
    bankLocalName: null,
    bankCountry: null,
    bankSite: null,
    bankPhone: null,
    bankLogoBigOriginalSvg: null,
    bankLogoBigInvertedSvg: null,
    bankLogoSmallOriginalSvg: null,
    bankLogoSmallInvertedSvg: null,
    bankLogoBigOriginalPng: null,
    bankLogoBigInvertedPng: null,
    bankLogoSmallOriginalPng: null,
    bankLogoSmallInvertedPng: null,
    bankColor: null,
    bankColors: null,
    brandAlias: null,
    brandName: null,
    brandLogoOriginalSvg: null,
    brandLogoInvertedSvg: null,
    brandLogoOriginalPng: null,
    brandLogoInvertedPng: null,
    formBackgroundColor: '#eeeeee',
    formBackgroundColors: ['#eeeeee', '#dddddd'],
    formBackgroundGradient: binking._getGradient(['#eeeeee', '#dddddd'], binking.defaultOptions.gradientDegrees),
    formBackgroundLightness: 'light',
    formTextColor: '#000000',
    formBorderColor: '#333333',
    formBrandLogoSvg: null,
    formBankLogoBigSvg: null,
    formBankLogoSmallSvg: null,
    formBrandLogoPng: null,
    formBankLogoBigPng: null,
    formBankLogoSmallPng: null,
    formLogoScheme: null,
    codeName: 'CVV',
    codeMinLength: 3,
    codeMaxLength: 4,
    cardNumberMask: '0000 0000 0000 0000000',
    cardNumberGaps: [4, 8, 12],
    cardNumberBlocks: [4, 4, 4, 7],
    cardNumberLengths: [12, 13, 14, 15, 16, 17, 18, 19],
    cardNumberMaxLength: 19,
    cardNumberMinLength: 12,
    cardNumberValidByLuhn: true,
    cardNumberNice: '',
    cardNumberNormalized: '',
    cardNumberSource: undefined
  }

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = binking
    }
    exports.binking = binking
  } else if (typeof window !== 'undefined') {
    window.binking = binking
  }
})()
