# DEPRECATED

The code is no longer supported. The API will stop working on October 1, 2024. Archives with all the data (BINs, banks, logos) have been made freely available: [https://github.com/svagcrew/binking/tree/master/archives](https://github.com/svagcrew/binking/tree/master/archives). You can continue using the SDK with these archives. If you previously used the API, download the archives and use them instead of the API.

# BinKing

BinKing is a King banking card data fill-in form. BinKing allows you to get the bank logo, colors, phone number, brand logo and more by card number. BinKing also helps in the validation of these forms. Use BinKing to create a smart and responsive card acceptance form. Increase conversion, increase user loyalty, reduce the workload of the support department.

To use the plugin, you need an API key or data from the archive. The key and archive can be obtained in your personal account [on the BinKing website.](https://binking.io) See the list of available banks and countries [on this page.](https://binking.io/en/docs/banks)

Plugin demonstration is available here: [JSFiddle.](https://jsfiddle.net/serge10d1n/9sj53x01/1/) This demonstration is a part of [Creating a payment form comprehensive guide.](https://binking.io/en/guide) We talk about show how to apply in the plugin, how to set an automatic cursor move, how to provide a form validation, etc. Article contains full code samples, you can just copy and use it. You can easily modify it according to your needs

## Quick start

The example given below will help you immediately understand what is special here and how the main function of the plugin works. The example is designed for users who are going to use the plugin in conjunction with the API. See below for other ways to customize the plugin.
```js
import binking from "binking";

binking.setDefaultOptions({
  strategy: "api",
  apiKey: "YOUR_API_KEY",
});

var $form = document.querySelector(".form");
var $bankLogo = document.querySelector(".bank-logo");
var $brandLogo = document.querySelector(".brand-logo");
var $cardNumberField = document.querySelector(".number-field");
var $codeField = document.querySelector(".code-field");
var $fields = document.querySelectorAll(".field");

$cardNumberField.onkeyup = () => {
  var cardNumber = $cardNumberField.value;
  binking(cardNumber, function(result) {
    $form.style.background = result.formBackgroundGradient;
    $form.style.color = result.formTextColor;
    $fields.forEach($field => (field.style.borderColor = result.formBorderColor));
    $codeField.placeholder = result.codeName || "";
    if (result.formBankLogoBigSvg) $bankLogo.src = result.formBankLogoBigSvg;
    $bankLogo.style.display = result.formBankLogoBigSvg ? "block" : "none";
    if (result.formBrandLogoSvg) $brandLogo.src = result.formBrandLogoSvg;
    $brandLogo.style.display = result.formBrandLogoSvg ? "block" : "none";
  });
};
```

If you need more “lively” sample, suitable for a real project, again, we recommend to check out [Creating a payment form comprehensive guide.](https://binking.io/en/guide)

## Plugin apply

You can apply the plugin with `$ yarn add binking` or `$ npm i binking --save` and then import it in your code

```js
import binking from "binking";
```

You can apply the link CDN `https://unpkg.com/binking`

```html
<script src="https://unpkg.com/binking"></script>
```

After this, `binking` function will be available for global vision.

## Settings

You can change default setting or transmit them at every call.
To change default settings, call:

```js
binking.setDefaultOptions({
  // New settings object
});
```

### General setting:

- **`brandsLogosPath`** default `"https://static.binking.io/brands-logos/"`  
  Path to files with brand logos. If you have uploaded brand logos to your server, change this path, otherwise brand logos will be distributed from our server. The brands folder is included in the files of this `brand-logos` repository.
- **`brandLogoPolicy`** default `"auto"`  
  This parameter defines the brand logo’s style. Available options: `"original"`, `"inverted"`, `"auto"`.
  - `"original"`  
    Colorized logo
  - `"inverted"`  
    White logo
  - `"auto"`  
    Logo is colored, if a bank’s brand logo (`formLogoScheme`) is colored (`"original"`)
    Logo is white, if a bank’s logo (`formLogoScheme`)  is white (`"inverted"`)
    Logo is colored, if bank is unable to recognize
- **`maskDigitSymbol`** default is `"0"`  
  Symbol denoting the digit in the mask of the card number specified in the instance property `cardNumberMask`.
- **`maskDelimiterSymbol`** default `" "`  
  A symbol denoting a separator in the mask of the card number specified in the instance property `cardNumberMask`.
- **`gradientDegrees`** default `135`  
  Degree under which the gradient is specified in the instance property `formBackgroundGradient`.

### Settings when using API

You can read more about how the API works in the [Datasheet.](https://binking.io/en/docs/api) The plugin helps to minimize API requests. Just one request per paying user is enough. The API request occurs once and only when the user has entered a sufficient number of characters to identify the bank to which his card belongs.
- **`apiKey`** required field
  You API key that you obtained on your acount
- **`sandbox`** default `false`  
  f set to `true`, then the request will be free. When using the `binking` function, the bank will be determined only if the cardNumber is passed the card number starting with these digits:` 402333` (Sberbank), `546918` (Sberbank),` 400812` (Rosbank), `677721` (Rosbank). When using `binking.getBank` and` binking.getBanks`, banks will be found only if the aliases `"ru-sberbank"` and`"ru-rosbank"` are passed.

### Settings when using the archive

If you purchased an archive and decided to use it on the client side, you need to set the following settings:

- **`strategy`** default `"api"`  
  Set `"archive"`
- **`banksLogosPath`** default `""`  
  Path to files with bank logos. Upload bank logos to your server and specify the path to them in this property.
- **`sync`** default `false`
  If set to `true` then` binking`, `binking.getBank` and` binking.getBanks` functions can be used synchronously.

You also need to transfer bank and bin data to the plugin.

```js
binking.addBanks(banks);
binking.addBins(bins);
```

The variable `banks` should contain an object from a JSON file with banks. The bins variable should contain an object from a JSON file with bins. In order to transfer an object from a JSON file, you can customize your javascript collector, or simply copy the entire contents of the file, like this:
```js
binking.addBanks(/* file contents banks-all.json */);
binking.addBins(/* file contents bins-all.json */);
```

To learn more about file contents and archives read [Datasheet.](https://binking.io/en/docs/archive)

### Settings when using your API

If you purchased the archive and decided to make your own API for yourself, specify your endpoints in the settings. An example of implementing your own API is described in [Datasheet.](https://binking.io/en/docs/archive)

- **`apiFormUrl`** default `"http://api.binking.io/form"`
- **`apiBankUrl`** default `"http://api.binking.io/bank"`
- **`apiBanksUrl`** default `"http://api.binking.io/banks"`

## Usage

### Making a form

Use one of the following options to get an object with data for form layout.

```js
binking(cardNumber, function(result) { /* ... */ });
binking(cardNumber, options, function(result) { /* ... */ });
binking(cardNumber).then(function(result) { /* ... */ });
binking(cardNumber, options).then(function(result) { /* ... */ });
// The options below work only if the settings specify {strategy: "archive", sync: true}
var result = binking(cardNumber);
var result = binking(cardNumber, options);
```

Pass the card number as `cardNumber`. It can be either a number or a string, spaces are allowed in the string. Pass the card number whenever the value that the user enters into the card number field changes. To determine the brand of the card and all the properties associated with it, 1 character may be enough, the bank can be determined after transmitting 6 characters or more.

The variable `result` will store an object with all the necessary data for the layout of the form.

- **`bankAlias`** default `null`  
  The short name of the bank in English, all letters are small, no spaces, at the beginning the country prefix. For example: "ru-sberbank".
- **`bankName`** default `null`  
  Bank’s name in English.
- **`bankLocalName`** default `null`  
  The name of the bank in the language of the country in which the bank operates.
- **`bankCountry`** default `null`
  Country code in which this bank operates. `"ru"` - Russia.
- **`bankSite`** default `null`
  Link to the bank's website.
- **`bankPhone`** default `null`
  Bank phone.
- **`bankLogoBigOriginalSvg`** default `null`
- **`bankLogoBigOriginalPng`** default `null`
  Link to the large color bank logo
- **`bankLogoBigInvertedSvg`** default `null`
- **`bankLogoBigInvertedPng`** default `null`
  Large white bank logo.
- **`bankLogoSmallOriginalSvg`** default `null`
- **`bankLogoSmallOriginalPng`** default `null`
  Small, square-shaped, colored bank logo.
- **`bankLogoSmallInvertedSvg`** default `null`
- **`bankLogoSmallInvertedPng`** default `null`
  Small white bank logo.
- **`bankColor`** default `null`
  The main color of the bank.
- **`bankColors`** default `null`
  An array with all the colors of the bank.
- **`formBackgroundColor`** default `"#eeeeee"`
  The color for the background of the form.
- **`formBackgroundColors`** default `["#eeeeee", "#dddddd"]`
  Array of colors for the gradient background of the shape.
- **`formBackgroundGradient`** default `["#eeeeee", "#dddddd"]`
  Contains a line with the CSS background property value, by setting which you get a gradient from the colors specified in the `formBackgroundColors` field. The angle can be specified in the `gradientDegrees` property of the settings.
- **`formBackgroundLightness`** default `"light"`  
  The background is rather dark "dark" or light "light".
- **`formTextColor`** default `"#000000"`
  The color of the text that will look good against the background of the form.
- **`formBorderColor`** default `"#333333"`
  Border color for form fields.
- **`formBankLogoBigSvg`** default `null`
- **`formBankLogoBigPng`** default `null`
  Link to a large bank logo that will look good against the background of the form.
- **`formBankLogoSmallSvg`** default `null`
- **`formBankLogoSmallPng`** default `null`
  Link to a small bank logo that will look good against the background of the form.
- **`formLogoScheme`** default `null`
  Color scheme of the logo for the "original" or "inverted" form.
- **`formBrandLogoSvg`** default `null`
- **`formBrandLogoPng`** default `null`
  Link to a brand logo that will look good against the background of the form.- **`brandLogoOriginalSvg`** default `null`
- **`brandLogoOriginalPng`** default `null`    
  Link to the brand's color logo.
- **`brandLogoInvertedSvg`** default `null`
- **`brandLogoInvertedPng`** default `null`  
  Link to the white brand logo.
- **`brandAlias`** default `null`
  Short name of the type in English, all letters are small, no spaces.
- **`brandName`** default `null`
  The full name of the type.
- **`codeName`** default `null`
  Code name on the back of the card (CVC / CID / CVV / CVN / CVP2).
- **`codeMinLength`** default `3`
  The minimum number of characters in the security code. Always 3.
- **`codeMaxLength`** default `4`
  The maximum number of characters in the security code. Usually 3, but for American Express cards 4.
- **`cardNumberMask`** default `0000 0000 0000 0000000`
  Mask for the card number of this type. Usually the mask is 0000 0000 0000 0000, but some types of cards have a length of the card number other than 16 characters, and spaces are placed in other places. For example, for American Express cards the mask will be 0000000000 00000. The symbols in the mask can be changed by changing the settings for `maskDigitSymbol` and` maskDelimiterSymbol`. Use the `cardNumberMask` property to mask the card number input field.
- **`cardNumberGaps`** default `[4, 8, 12]`  
  An array with numbers defining the position of the spaces when creating the mask.
- **`cardNumberBlocks`** default `[4, 4, 4, 7] `
  An array with numbers defining the number of digits in each mask block. Determined based on the `cardNumberGaps` property and the maximum number in `cardNumberLengths`.
- **`cardNumberLengths`** default `[12, 13, 14, 15, 16, 17, 18, 19]`
  An array with numbers defining the allowed number of characters in the card number.
- **`cardNumberMinLength`** default `12`
  The minimum allowed number of symbols in the card number.
- **`cardNumberMaxLength`** default `19`
  The maximum number of symbols allowed in the card number.
- **`cardNumberValidByLuhn`** default `true`
  Is the card number valid according to the Luna algorithm. (Algorithm that checks the card number for typos).
- **`cardNumberNice`**
  Nice-looking card number. The mask is defined by the `cardNumberMask` property. Example: 4377730000000000 → 4377 7300 0000 0000, 437773 → 4377 73.
- **`cardNumberNormalized`**
  Card number as a string with spaces removed. If the transmitted card number contained any characters other than numbers and spaces, there will be an empty string.
- **`cardNumberSource`**

Card number passed when calling the function.

If it was not possible to determine the bank data by the card number, the fields `bankAlias`, `bankName`, `bankLocalName`, `bankCountry`, `bankSite`, `bankPhone`, `bankLogoBigOriginalSvg`, `bankLogoBigInvertedSvg`, `bankLogoSmallOriginalSvg`,`bankLogoSmallInvertedSvg`, `bankLogoBigOriginalPng`, `bankLogoBigInvertedPng`, `bankLogoSmallOriginalPng`,`bankLogoSmallInvertedPng`, `bankColor`, `bankColors`, `formBackgroundColor`, `formBackgroundColors`, `formBackgroundGradient`, `formBackgroundLightness`, `formTextColor`, `formBorderColor`, `formBankLogoBigSvg`, `formBankLogoSmallPng`, `formBankLogoBigPng`, `formBankLogoSmallPng` will have the default value.

If it was not possible to determine the type data by the card number, the fields `brandAlias`, `brandName`, `brandLogoOriginalSvg`, `brandLogoInvertedSvg`, `formBrandLogoSvg`, `brandLogoOriginalPng`, `brandLogoInvertedPng`, `formBrandLogoPng`, `codeName`, `codeMinLength`, `codeMaxLength`, `cardNumberMask`, `cardNumberGaps`, `cardNumberBlocks`, `cardNumberLengths` will have the default value.

### Retrieving data from a specific bank

This method can be useful for displaying information about the user's bank if he saved his bank card, and you recorded the bank alias (bankAlias) in your database when the user entered its data.

```js
binking.getBank(bankAlias, function(result) { /* ... */ });
binking.getBank(bankAlias, options, function(result) { /* ... */ });
binking.getBank(bankAlias).then(function(result) { /* ... */ });
binking.getBank(bankAlias, options).then(function(result) { /* ... */ });
// The options below only work if the settings indicate { strategy: "archive", sync: true }
var result = binking.getBank(bankAlias);
var result = binking.getBank(bankAlias, options);
```

Pass the previously saved bank alias as `bankAlias`. For example: "ru-sberbank"

The variable `result` will contain an object with all the data about the bank. The property names will be the same as when calling the binking function, but there will be no fields related to the brand and card number. List of returned fields: `bankAlias`, `bankName`, `bankLocalName`, `bankCountry`, `bankSite`, `bankPhone`, `bankLogoBigOriginalSvg`, `bankLogoBigInvertedSvg`, `bankLogoSmallOriginalSvg`, `bankLogoSmallInvertedSvg`, `bankLogoBigOriginalPng`, `bankLogoBigInvertedPng`, `bankLogoSmallOriginalPng`, `bankLogoSmallInvertedPng`, `bankColor`, `bankColors`, `formBackgroundColor`, `formBackgroundColors`, `formBackgroundGradient`, `formBackgroundLightness`, `formTextColor`, `formBorderColor`, `formBankLogoBigSvg`, `formBankLogoSmallSvg`, `formBankLogoBigPng`, `formBankLogoSmallPng`.

If the bank with the specified alias was not found, the value `null` will be returned.

### Retrieving data on multiple banks

```js
binking.getBanks(banksAliases, function(result) { /* ... */ });
binking.getBanks(banksAliases, options, function(result) { /* ... */ });
binking.getBanks(banksAliases).then(function(result) { /* ... */ });
binking.getBanks(banksAliases, options).then(function(result) { /* ... */ });
// The options below only work if the settings indicate { strategy: "archive", sync: true }
var result = binking.getBanks(banksAliases);
var result = binking.getBanks(banksAliases, options);
```

For `banksAliases`, pass an array with bank aliases. For example: `["ru-sberbank", "ru-alias"]`

The variable `result` will contain an array with objects, each of which will contain all the data about the requested bank.

If the bank was not found, then `null` will be in its place in the array.

### Retrieving specific brand data

```js
var result = binking.getBrand(brandAlias);
var result = binking.getBrand(brandAlias, options);
```

Pass the brand alias as `brandAlias`. For example: "visa".

The variable `result` will contain an object with all the data about the brand.

- **`logoOriginalSvg`** default `null`
- **`logoOriginalPng`** default `null`  
  Link to the brand's color logo.
- **`logoInvertedSvg`** default `null`
- **`logoInvertedPng`** default `null`  
  Link to the white brand logo.
- **`name`**
  Brand name.
- **`alias`**
  Short name of the type in English, all letters are small, no spaces.
- **`pattern`**
  Regular expression to determine whether the card number belongs to this brand.
- **`gaps`**
  An array with numbers defining the position of the spaces when creating the mask.
- **`lengths`**
  An array with numbers defining the allowed number of characters in the card number.
- **`codeName`**
  Code name on the back of the card (CVC / CID / CVV / CVN / CVP2).
- **`codeMinLength`**
  The minimum number of characters in the security code. Always 3.
- **`codeMaxLength`**
  The maximum number of characters in the security code. Usually 3, but for American Express cards is 4.
- **`bankAlias`** default `null`  
  The short name of the bank in English, all letters are small, no spaces, at the beginning the country prefix. For example: "ru-sberbank".
- **`bankName`** default` null`
  Bank name in English.

### Getting a link to a brand logo

```js
var result = binking.getBrandLogo(brandAlias);
var result = binking.getBrandLogo(brandAlias, logoScheme);
var result = binking.getBrandLogo(brandAlias, options);
var result = binking.getBrandLogo(brandAlias, logoScheme, options);
```

Helper function for getting a link to a brand logo. If you do not specify `logoScheme`, it will be considered equal to` original`. Valid values for `logoScheme` are` original` or `inverted`.

### Retrieving data from multiple brands

```js
var result = binking.getBrands();
var result = binking.getBrands(options);
var result = binking.getBrands(brandsAliases);
var result = binking.getBrands(brandsAliases, options);
```

For `brandsAliases`, pass an array with brand aliases. For example: `["visa", "mastercard"]`. If brandsAliases is not passed, you will get a list of all brands. If one of the specified bernds is not found, it will not be included in the array with the results.

The variable `result` will contain an array with objects with all the data about each brand.

## Validation

### Validation of all card data

```js
var result = binking.validate(cardNumber, month, year, code);
```

The result of validation is an object of the form `{hasErros: Boolean, errors: Object}`.

If no errors were found in the map data, then `hasErros` will be` false`, the `erros` object will be` {} `.

If any errors are found in the map data, `hasErros` will be` true`. Each object key will correspond to the name of the field to which the error belongs. Each value will be a `{field: String, code: String, message: String}` object. The `field` property also contains the name of the field. The `code` property contains the error code. The `message` property contains a human-readable error message. If the field does not contain an error, then there will be no corresponding key in the `errors` object.

Example:

```js
var result = binking.validate("1234", "13", "2a", "12345");
console.log(result);
```

```js
{
  hasErros: true,
  errors: {
    cardNumber: {
      field: 'cardNumber',
      code: 'CARD_NUMBER_INCOMPLETE',
      message: 'The card number is not completely filled in',
    },
    month: {
      field: 'month',
      code: 'MONTH_INVALID',
      message: 'Card expiration month error',
    },
    year: {
      field: 'year',
      code: 'YEAR_INVALID',
      message: 'Card expiration year error',
    },
    code: {
      field: 'code',
      code: 'CODE_INVALID',
      message: 'Security code is incorrect',
    },
  }
}
```

a complete list of errors corresponding to each of the fields is listed below.

### Card number validation

```js
var result = binking.validateCardNumber(cardNumber);
```

In response, it returns `undefined` if there are no errors in the card number. If there is any error, an object of the form `{field: 'cardNumber', code: String, message: String}` is returned.

Possible codes (`code`) and error messages (` message`):

- `CARD_NUMBER_REQUIRED`: "Enter your bank card number"
- `CARD_NUMBER_INVALID`: "The card number contains invalid characters"
- `CARD_NUMBER_INCOMPLETE`: "The card number is not completely filled in"
- `CARD_NUMBER_OVERCOMPLETE`: "There are too many characters in the card number"
- `CARD_NUMBER_LUHN`: "There is a typo in the card number"

### Validate month

```js
var result = binking.validateMonth(month);
```

In response, it returns `undefined` if there are no errors in the card expiration month. If there is any error, an object of the form `{field: 'month', code: String, message: String}` is returned.

Possible codes (`code`) and error messages (`message`):

- `MONTH_REQUIRED`: "Specify card expiration month"
- `MONTH_INVALID`: "Error in card expiration month"

### Validation of the year

```js
var result = binking.validateYear (year);
```

In response, it returns `undefined` if there are no errors in the card expiration year. If there is any error, an object of the form `{field: 'year', code: String, message: String}` is returned.

Possible codes (`code`) and error messages (`message`):

- `YEAR_REQUIRED`: "Specify the card expiration year"
- `YEAR_INVALID`: "Error in the card expiration year"

### Date validation

```js
var result = binking.validateYear(month, year);
```

Returns `undefined` if there are no errors in the card expiration date. If there is any error, an object of the form `{field: 'year' | 'month', code: String, message: String} `.

Possible codes (`code`) and error messages (`message`):

- `YEAR_IN_PAST`: "The year is in the past tense"
- `MONTH_IN_PAST`: "Month is in the past tense"

### Security Code Validation

```js
var result = binking.validateCode (code);
```

In response, it returns `undefined` if there are no errors in the card's security code. If there is any error, an object of the form `{field: 'code', code: String, message: String}` is returned.

Possible codes (`code`) and error messages (`message`):

- `CODE_REQUIRED`: "Please provide a security code"
- `CODE_INVALID`: "The security code is incorrect"

### Setting your own error messages

By default, error messages are displayed in English:

```js
binking.setValidationErrors({
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
});
```

But you can set your own messages in any language. For example, in Russian:

```js
binking.setValidationErrors({
  CARD_NUMBER_REQUIRED: "Укажите номер вашей банковской карты",
  CARD_NUMBER_INVALID: "Номер карты содержит недопустимые символы",
  CARD_NUMBER_INCOMPLETE: "Номер карты заполнен не до конца",
  CARD_NUMBER_OVERCOMPLETE: "В номере карты слишком много символов",
  CARD_NUMBER_LUHN: "В номере карты содержится опечатка",
  MONTH_REQUIRED: "Укажите месяц истечения карты",
  MONTH_INVALID: "Ошибка в месяце истечения карты",
  YEAR_REQUIRED: "Укажите год истечения карты",
  YEAR_INVALID: "Ошибка в годе истечения карты",
  YEAR_IN_PAST: "Этот год прошёл",
  MONTH_IN_PAST: "Этот месяц прошёл",
  CODE_REQUIRED: "Укажите код безопасности",
  CODE_INVALID: "Код безопасности указан неверно"
});
```

## Brands

The plugin files contain a folder with brand logos `brands-logos`. Each brand's logo is presented in 3 color schemes: color, black, white. Also all these logos are downloaded at: https://static.binking.io/brands-logos

You can download these logos to yourself and use them on your side, or you can display them directly from our server. The filenames on our server are identical to those in the `brands-logos` folder.

List of brands: Visa, Mastercard, American Express, Diners Club, Discover, JCB, UnionPay, Maestro, Mir.

List of brand aliases: `visa`, `mastercard`, `american-express`, `diners-club`, `discover`, `jcb`, `unionpay`, `maestro`, `mir`.

## Development and testing

All source code is in the `index.js` file. To apply eslint, call the command `$ npm run lint-fix`. To build files for the `dist` folder, call the` $ npm run build` command.

To run the tests, call the command `$ API_KEY=YOUR_API_KEY npm run test`.

To run tests in a browser, open the file `test.html` in a browser, then add` # YOUR_API_KEY` in the browser line. For example: `file:///Users/username/binking/test.html # YOUR_API_KEY`.

If you don't specify an API key, tests will fail. All API requests during the test go with the `sandbox = 1` flag, so these requests are completely free.
