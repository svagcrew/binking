# BinKing

BinKing — инструмент для создания королевских форм приёма банковских карт. BinKing позволяет по номеру карты получить логотип банка, цвета, номер телефона, логотип бренда и прочее. Также BinKing помогает в валидации таких форм. Используйте BinKing, чтобы создать умную и отзывчивую форму для приёма банковских карт. Увеличьте конверсию, увеличьте лояльность пользователей, снизте нагрузку отдела поддержки.

Для использования плагина вам понадобится API ключ или данные из архива. Ключ и архив можно получить в личном кабинете [на сайте BinKing.](https://binking.io) Перечень доступных банков и стран смотрите [на этой странице.](https://binking.io/ru/docs/banks)

Демонстрация использования плагина доступна на [JSFiddle.](https://jsfiddle.net/serge10d1n/9sj53x01/1/) Эта демонстрация является частью [подробного гайда по созданию платёжной формы.](https://binking.io/ru/guide) Рассказываем и показываем, как подключить этот плагин, как сделать автоматический перенос курсора в следующее поле, как сделать валидацию формы и много другое. В тексте статьи содержится полный пример кода, который можно просто скопировать к себе и использовать. При желании вы легко сможете его доработать под свои нужды.

## Быстрый старт

Пример данный ниже поможет сразу понять в чём тут соль и как работает основная функция плагина. Пример рассчитан на пользователей, которые собираются использовать плагин в связке с API. Другие способы настройки плагина смотрите ниже.

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

Если вы хотите увидеть более живой пример, пригодный для использования в реально проекте, ещё раз рекомендуем обратиться [к подробному гайу по созданию платёжной формы.](https://binking.io/ru/guide)

## Подключение плагина

Можете установить плагин с помощью `$ yarn add binking` или `$ npm i binking --save` после чего импортируйте его в своём коде

```js
import binking from "binking";
```

Можете подключить используя ссылку CDN `https://unpkg.com/binking`

```html
<script src="https://unpkg.com/binking"></script>
```

После этого функция `binking` будет доступна в глобальной области видимости.

## Настройки

Вы можете изменить настройки по умолчанию, а можете передавать их при каждом вызове.

Для изменения настроек по умолчанию вызовите:

```js
binking.setDefaultOptions({
  // Объект с новыми настройками
});
```

### Общие настройки:

- **`brandsLogosPath`** по умолчанию `"https://static.binking.io/brands-logos/"`  
  Путь к файлам с логотипами брендов. Если вы загрузили логотипы брендов к себе на сервер, измените этот путь, иначе логотипы берндов будут раздаваться с нашего сервера. Папка с брендами включена в файлы этого репозитория `brand-logos`.
- **`brandLogoPolicy`** по умолчанию `"auto"`  
  Эта настройка определяет стиль логотипа бренда. Доступные значения: `"original"`, `"inverted"`, `"auto"`.
    - `"original"`  
      Логотип бренда будет цветным
    - `"inverted"`  
      Логотип бренда будет белым
    - `"auto"`  
      Логотип бренда будет цветным, если стиль логотипа банка (`formLogoScheme`) цветной (`"original"`)
      Логотип бренда будет белым, если стиль логотипа банка (`formLogoScheme`) белый (`"inverted"`)
      Логотип бренда будет цветным, если банк не определён
- **`maskDigitSymbol`** по умолчанию `"0"`  
  Символ, обозначающий цифру в маске номера карты, указанной в свойстве экземпляра `cardNumberMask`.
- **`maskDelimiterSymbol`** по умолчанию `" "`  
  Символ, обозначающий разделитель в маске номера карты, указанной в свойстве экземпляра `cardNumberMask`.
- **`gradientDegrees`** по умолчанию `135`  
  Градус, под которым идёт градиент указанный в свойстве экземпляра `formBackgroundGradient`.

### Настройки при использовании API

Подробнее о том, как работает API можно прочитать [в документации.](https://binking.io/ru/docs/api) Плагин помогает минимизировать запросы к API. Достаточно всего одного запроса на одного платящего пользователя. Запрос к API происходит единожды и только тогда, когда пользователь ввёл достаточное количество символов для опеределения банка, к которой принадлежит его банк.

- **`apiKey`** обязательное поле  
  Ваш ключ API, который вы получили в личном кабинете
- **`sandbox`** по умолчанию `false`  
  Если установить в `true`, то запрос будет являться бесплатным. При использовнии функции `binking` банк будет определён, только если в cardNumber передать
  номер карты, начинающийся этими цифрами: `402333` (Сбербанк), `546918` (Сбербанк), `400812` (Росбанк), `677721` (Росбанк). При использовании `binking.getBank` и `binking.getBanks` банки будут найдены только при переданных алиасах `"ru-sberbank"` и `"ru-rosbank"`.

### Настройки при использовании архива

Если вы приобрели архив, и решили использовать его на стороне клиента, вам необходимо установить следующие настройки:

- **`strategy`** по умолчанию `"api"`  
  Установите `"archive"`
- **`banksLogosPath`** по умолчанию `""`  
  Путь к файлам с логотипами банков. Загрузите логотипы банков к себе на сервер и укажите путь к ним в этом свойстве.
- **`sync`** по умолчанию `false`
  Если установить `true`, тогда функции `binking`, `binking.getBank` и `binking.getBanks` можно будеет использовать в синхронном стиле.

Также вам необходимо передать в плагин данные банков и бинов.

```js
binking.addBanks(banks);
binking.addBins(bins);
```

В переменной `banks` должен храниться объект из JSON файла с банками. В переменной `bins` должен храниться объект из JSON файла с бинами. Для того, чтобы перенести объект из JSON файла вы можете настроить свой сборщик яваскрипта, или просто скопировать целиком содержимое файла, вот так:

```js
binking.addBanks(/* содержимое файла banks-all.json */);
binking.addBins(/* содержимое файла bins-all.json */);
```

Подробнее о содержимом и использовании архив читайте [в документации.](https://binking.io/ru/docs/archive)

### Настройки при использовании своего API

Если вы приобрели архив и решили сделать для себя собственное API, укажите ваши эндпоинты в настройках. Пример реализации собственного API описан [в документации.](https://binking.io/ru/docs/archive)

- **`apiFormUrl`** по умолчанию `"http://api.binking.io/form"`
- **`apiBankUrl`** по умолчанию `"http://api.binking.io/bank"`
- **`apiBanksUrl`** по умолчанию `"http://api.binking.io/banks"`

## Использование

### Для создания формы

Используйте один из перечисленных ниже вариантов, чтобы получить объект с данными для вёрстки формы.

```js
binking(cardNumber, function(result) { /* ... */ });
binking(cardNumber, options, function(result) { /* ... */ });
binking(cardNumber).then(function(result) { /* ... */ });
binking(cardNumber, options).then(function(result) { /* ... */ });
// Варианты ниже работают только, если в настройках указано { strategy: "archive", sync: true }
var result = binking(cardNumber);
var result = binking(cardNumber, options);
```

В качестве `cardNumber` передайте номер карты. Это может быть как число, так и строка, в строке допускаются пробелы. Передавайте номер карты, всякий раз, как изменяется значение, которое пользователь вводит в поле с номером карты. Для определения бренда карты и всех связанных с ним свойств может быть достаточно и 1 символа, банк может быть определён после передачи 6 символов и более.

В переменной `result` будет храниться объект со всеми необходими данными для вёрстки формы.

- **`bankAlias`** по умолчанию `null`  
  Короткое название банка на английском, все буквы маленькие, без пробелов, в начале префикс страны. Например: "ru-sberbank".
- **`bankName`** по умолчанию `null`  
  Название банка на английском.
- **`bankLocalName`** по умолчанию `null`  
  Название банка на языке той страны, в которой работает банк.
- **`bankCountry`** по умолчанию `null`  
  Код страны, в которой работает этот банк. `"ru"` — Россия.
- **`bankSite`** по умолчанию `null`  
  Ссылка на сайт банка.
- **`bankPhone`** по умолчанию `null`  
  Телефон банка.
- **`bankLogoBigOriginalSvg`** по умолчанию `null`
- **`bankLogoBigOriginalPng`** по умолчанию `null`  
  Ссылка на большой цветной логотип банка
- **`bankLogoBigInvertedSvg`** по умолчанию `null`
- **`bankLogoBigInvertedPng`** по умолчанию `null`  
  Большой белый логотип банка.
- **`bankLogoSmallOriginalSvg`** по умолчанию `null`
- **`bankLogoSmallOriginalPng`** по умолчанию `null`  
  Маленький, вписывающийся в квадрат, цветной логотип банка.
- **`bankLogoSmallInvertedSvg`** по умолчанию `null`
- **`bankLogoSmallInvertedPng`** по умолчанию `null`  
  Маленький белый логотип банка.
- **`bankColor`** по умолчанию `null`  
  Основной цвет банка.
- **`bankColors`** по умолчанию `null`  
  Массив со всеми цветами банка.
- **`formBackgroundColor`** по умолчанию `"#eeeeee"`  
  Цвет для фона формы.
- **`formBackgroundColors`** по умолчанию `["#eeeeee", "#dddddd"]`  
  Массив цветов для градиентного фона формы.
- **`formBackgroundGradient`** по умолчанию `["#eeeeee", "#dddddd"]`  
  Содержит строку с CSS значением свойства background, установив которое, вы получите градиент из цветов указанны в поле `formBackgroundColors`. Угол можно указать в свойстве настроек `gradientDegrees`.
- **`formBackgroundLightness`** по умолчанию `"light"`  
  Фон скорее тёмный "dark" или светлый "light".
- **`formTextColor`** по умолчанию `"#000000"`  
  Цвет текста, который хорошо будет смотреться на фоне формы.
- **`formBorderColor`** по умолчанию `"#333333"`  
  Цвет границ для полей в форме.
- **`formBankLogoBigSvg`** по умолчанию `null`
- **`formBankLogoBigPng`** по умолчанию `null`  
  Ссылка на большой логотип банка, который хорошо будет смотреться на фоне формы.
- **`formBankLogoSmallSvg`** по умолчанию `null`
- **`formBankLogoSmallPng`** по умолчанию `null`    
  Ссылка на маленький логотип банка, который хорошо будет смотреться на фоне формы.
- **`formLogoScheme`** по умолчанию `null`  
  Цветовая схема логотипа для формы "original" или "inverted".
- **`formBrandLogoSvg`** по умолчанию `null`
- **`formBrandLogoPng`** по умолчанию `null`    
  Ссылка на логотип бренда, который хорошо будет смотреться на фоне формы.
- **`brandLogoOriginalSvg`** по умолчанию `null`
- **`brandLogoOriginalPng`** по умолчанию `null`    
  Ссылка на цветной логотип бренда.
- **`brandLogoInvertedSvg`** по умолчанию `null`
- **`brandLogoInvertedPng`** по умолчанию `null`  
  Ссылка на белый логотип бренда.
- **`brandAlias`** по умолчанию `null`  
  Короткое название типа на английском, все буквы маленькие, без пробелов.
- **`brandName`** по умолчанию `null`  
  Полное название типа.
- **`codeName`** по умолчанию `null`  
  Название кода на обратной стороне карты (CVC/CID/CVV/CVN/CVP2).
- **`codeMinLength`** по умолчанию `3`  
  Минимальное количество символов в коде безопасности. Всегда 3.
- **`codeMaxLength`** по умолчанию `4`  
  Максимальное количество символов в коде безопасности. Обычно 3, но для карт American Express 4.
- **`cardNumberMask`** по умолчанию `0000 0000 0000 0000000`  
  Маска для номера карты данного типа. Обычно маска 0000 0000 0000 0000, но некоторые типы карт имеют отличную от 16 символов длину номера карты, и пробелы расставляются в других местах. Например, для карт American Express маска будет 0000 000000 00000. Символы в маске могут быть изменены путем изменения настроек `maskDigitSymbol` и `maskDelimiterSymbol`. Используйте свойство `cardNumberMask` для наложения маски на поле ввода номера карты.
- **`cardNumberGaps`** по умолчанию `[4, 8, 12]`  
  Массив с числами, определяющими положение пробелов при создании маски.
- **`cardNumberBlocks`** по умолчанию `[4, 4, 4, 7]`  
  Массив с числами, определяющими количество цифр в каждом блоке маски. Определяется на основании свойства `cardNumberGaps` и максимального числа в `cardNumberLengths`.
- **`cardNumberLengths`** по умолчанию `[12, 13, 14, 15, 16, 17, 18, 19]`  
  Массив с числами, определяющими допустимое количество символов в номере карты.
- **`cardNumberMinLength`** по умолчанию `12`  
  Минимальное допустимое количество симовлов в номере карты.
- **`cardNumberMaxLength`** по умолчанию `19`  
  Максимальное допустимое количество симовлов в номере карты.
- **`cardNumberValidByLuhn`** по умолчанию `true`  
  Валиден ли номер карты по алгоритму Луна. (Алгоритм проверяющий номер карты на опечатки).
- **`cardNumberNice`**  
  Номер карты, приведённый к красивому виду. Маска определяется свойством `cardNumberMask`. Пример: 4377730000000000 → 4377 7300 0000 0000, 437773 → 4377 73.
- **`cardNumberNormalized`**  
  Номер карты в виде строки с удалёнными пробелами. Если в переданном номере карты были какие-либо символы, кроме цифр и пробелов, будет пустая строка.
- **`cardNumberSource`**  
  Номер карты, переданный при вызове функции.

Если по номеру карты не удалось определить данные о банке, поля `bankAlias`, `bankName`, `bankLocalName`, `bankCountry`, `bankSite`, `bankPhone`, `bankLogoBigOriginalSvg`, `bankLogoBigInvertedSvg`, `bankLogoSmallOriginalSvg`,`bankLogoSmallInvertedSvg`, `bankLogoBigOriginalPng`, `bankLogoBigInvertedPng`, `bankLogoSmallOriginalPng`,`bankLogoSmallInvertedPng`, `bankColor`, `bankColors`, `formBackgroundColor`, `formBackgroundColors`, `formBackgroundGradient`, `formBackgroundLightness`, `formTextColor`, `formBorderColor`, `formBankLogoBigSvg`, `formBankLogoSmallPng`, `formBankLogoBigPng`, `formBankLogoSmallPng` будут иметь значение по умолчанию.

Если по номеру карты не удалось определить данные о типе, поля `brandAlias`, `brandName`, `brandLogoOriginalSvg`, `brandLogoInvertedSvg`, `formBrandLogoSvg`, `brandLogoOriginalPng`, `brandLogoInvertedPng`, `formBrandLogoPng`, `codeName`, `codeMinLength`, `codeMaxLength`, `cardNumberMask`, `cardNumberGaps`, `cardNumberBlocks`, `cardNumberLengths` будут иметь значение по умолчанию.

### Получение данных конкретного банка

Этот метод может пригодится для вывода информации о банке пользователя, в случае если он сохранил свою банковскую карту, а вы записали алиас банка (bankAlias) в свою базу данных, когда пользователь вводил её данные.

```js
binking.getBank(bankAlias, function(result) { /* ... */ });
binking.getBank(bankAlias, options, function(result) { /* ... */ });
binking.getBank(bankAlias).then(function(result) { /* ... */ });
binking.getBank(bankAlias, options).then(function(result) { /* ... */ });
// Варианты ниже работают только, если в настройках указано { strategy: "archive", sync: true }
var result = binking.getBank(bankAlias);
var result = binking.getBank(bankAlias, options);
```

В качестве `bankAlias` передайте сохранённый ранее алиас банка. Например: "ru-sberbank"

В переменной `result` будет храниться объект со всеми данными о банке. Названия свойств будут такими же, как и при вызове функции `binking`, однако там не будет полей относящихся к бренду и номеру карты. Перечень возвращаемых полей: `bankAlias`, `bankName`, `bankLocalName`, `bankCountry`, `bankSite`, `bankPhone`, `bankLogoBigOriginalSvg`, `bankLogoBigInvertedSvg`, `bankLogoSmallOriginalSvg`, `bankLogoSmallInvertedSvg`, `bankLogoBigOriginalPng`, `bankLogoBigInvertedPng`, `bankLogoSmallOriginalPng`, `bankLogoSmallInvertedPng`, `bankColor`, `bankColors`, `formBackgroundColor`, `formBackgroundColors`, `formBackgroundGradient`, `formBackgroundLightness`, `formTextColor`, `formBorderColor`, `formBankLogoBigSvg`, `formBankLogoSmallSvg`, `formBankLogoBigPng`, `formBankLogoSmallPng`.

Если банк с указанным алиасом найден не был, будет возвращено `null`.

### Получение данных о нескольких банках

```js
binking.getBanks(banksAliases, function(result) { /* ... */ });
binking.getBanks(banksAliases, options, function(result) { /* ... */ });
binking.getBanks(banksAliases).then(function(result) { /* ... */ });
binking.getBanks(banksAliases, options).then(function(result) { /* ... */ });
// Варианты ниже работают только, если в настройках указано { strategy: "archive", sync: true }
var result = binking.getBanks(banksAliases);
var result = binking.getBanks(banksAliases, options);
```

В качестве `banksAliases` передайте массив с алиасами банков. Например: `["ru-sberbank", "ru-alias"]`

В переменной `result` будут храниться массив с объектами, в каждом из которы будут все данные о запрошенном банке.

Если банк не был найден, то на его месте в массиве будет `null`.

### Получение данных конкретного бренда

```js
var result = binking.getBrand(brandAlias);
var result = binking.getBrand(brandAlias, options);
```

В качестве `brandAlias` передайте алиас бренда. Например: "visa".

В переменной `result` будет храниться объект со всеми данными о бренде.

- **`logoOriginalSvg`** по умолчанию `null`
- **`logoOriginalPng`** по умолчанию `null`  
  Ссылка на цветной логотип бренда.
- **`logoInvertedSvg`** по умолчанию `null`
- **`logoInvertedPng`** по умолчанию `null`  
  Ссылка на белый логотип бренда.
- **`name`**  
  Название бренда.
- **`alias`**  
  Короткое название типа на английском, все буквы маленькие, без пробелов.
- **`pattern`**  
  Регулярнное выражение для определения принадлежности номера карты к этоу бренду.
- **`gaps`**  
  Массив с числами, определяющими положение пробелов при создании маски.
- **`lengths`**  
  Массив с числами, определяющими допустимое количество символов в номере карты.
- **`codeName`**  
  Название кода на обратной стороне карты (CVC/CID/CVV/CVN/CVP2).
- **`codeMinLength`**  
  Минимальное количество символов в коде безопасности. Всегда 3.
- **`codeMaxLength`**  
  Максимальное количество символов в коде безопасности. Обычно 3, но для карт American Express 4.
- **`bankAlias`** по умолчанию `null`  
  Короткое название банка на английском, все буквы маленькие, без пробелов, в начале префикс страны. Например: "ru-sberbank".
- **`bankName`** по умолчанию `null`  
  Название банка на английском.

### Получение ссылки на логотип бренда

```js
var result = binking.getBrandLogo(brandAlias);
var result = binking.getBrandLogo(brandAlias, logoScheme);
var result = binking.getBrandLogo(brandAlias, options);
var result = binking.getBrandLogo(brandAlias, logoScheme, options);
```

Вспомогательная функция для получения ссылки на логотип бренда. Если не указывать `logoScheme`, будет считаться, что он равен `original`. Допустимые значения для `logoScheme` — `original` или `inverted`.

### Получение данных нескольких брендов

```js
var result = binking.getBrands();
var result = binking.getBrands(options);
var result = binking.getBrands(brandsAliases);
var result = binking.getBrands(brandsAliases, options);
```

В качестве `brandsAliases` передайте массив с алиасами бренда. Например: `["visa", "mastercard"]`. Если brandsAliases передан не будет, вы получите список всех брендов. Если один из указанных берндов найде не будет, он не попадёт в массив с результатами.

В переменной `result` будет храниться массив с объектами со всеми данными о каждом бренде.

## Валидация

### Валидация всех данных карты

```js
var result = binking.validate(cardNumber, month, year, code);
```

Результат валидации это объект вида `{ hasErros: Boolean, errors: Object}`.

Если в данных карты не найдено никаких ошибок, тогда `hasErros` будет `false`, объект `erros` будет `{}`.

Если в данных карты найден какие либо ошибки. В `hasErros` будет `true`. Каждый ключ объекта будет соответствовать названию поля, к которому принадлежит ошибка. Каждое значение будет являться объектом `{ field: String, code: String, message: String }`. В свойстве `field` также содержится название поля. В свойстве `code` содердится код ошибки. В свойстве `message` сообщение об ошибке в человекопонятной форме. Если поле не содержит ошибки, тогда не будет и соответствующего ключа в объекете `errors`.

Пример:

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
      message: 'Номер карты заполнен не до конца',
    },
    month: {
      field: 'month',
      code: 'MONTH_INVALID',
      message: 'Ошибка в месяце истечения карты',
    },
    year: {
      field: 'year',
      code: 'YEAR_INVALID',
      message: 'Ошибка в годе истечения карты',
    },
    code: {
      field: 'code',
      code: 'CODE_INVALID',
      message: 'Код безопасности указан неверно',
    },
  }
}
```

Полный список ошибок соответствующих каждому из полей смотрите ниже.

### Валидация номер карты

```js
var result = binking.validateCardNumber(cardNumber);
```

В ответ возвращает `undefined`, если ошибок в номере карты нету. Если какая-то ошибка есть, возваращается объект вида `{ field: 'cardNumber', code: String, message: String }`.

Возможные коды (`code`) и сообщения об ошибках (`message`):

- `CARD_NUMBER_REQUIRED`: "Укажите номер вашей банковской карты"
- `CARD_NUMBER_INVALID`: "Номер карты содержит недопустимые символы"
- `CARD_NUMBER_INCOMPLETE`: "Номер карты заполнен не до конца"
- `CARD_NUMBER_OVERCOMPLETE`: "В номере карты слишком много символов"
- `CARD_NUMBER_LUHN`: "В номере карты содержится опечатка"

### Валидация месяца

```js
var result = binking.validateMonth(month);
```

В ответ возвращает `undefined`, если ошибок в месяце истечения карты нету. Если какая-то ошибка есть, возваращается объект вида `{ field: 'month', code: String, message: String }`.

Возможные коды (`code`) и сообщения об ошибках (`message`):

- `MONTH_REQUIRED`: "Укажите месяц истечения карты"
- `MONTH_INVALID`: "Ошибка в месяце истечения карты"

### Валидация года

```js
var result = binking.validateYear(year);
```

В ответ возвращает `undefined`, если ошибок в годе истечения карты нету. Если какая-то ошибка есть, возваращается объект вида `{ field: 'year', code: String, message: String }`.

Возможные коды (`code`) и сообщения об ошибках (`message`):

- `YEAR_REQUIRED`: "Укажите год истечения карты"
- `YEAR_INVALID`: "Ошибка в годе истечения карты"

### Валидация даты

```js
var result = binking.validateYear(month, year);
```

В ответ возвращает `undefined`, если ошибок в дате истечения карты нету. Если какая-то ошибка есть, возваращается объект вида `{ field: 'year' | 'month', code: String, message: String }`.

Возможные коды (`code`) и сообщения об ошибках (`message`):

- `YEAR_IN_PAST`: "Год указан в прошедшем времени"
- `MONTH_IN_PAST`: "Месяц указан в прошедшем времени"

### Валидация кода безопасности

```js
var result = binking.validateCode(code);
```

В ответ возвращает `undefined`, если ошибок в коде безопасности карты нету. Если какая-то ошибка есть, возваращается объект вида `{ field: 'code', code: String, message: String }`.

Возможные коды (`code`) и сообщения об ошибках (`message`):

- `CODE_REQUIRED`: "Укажите код безопасности"
- `CODE_INVALID`: "Код безопасности указан неверно"

### Установка своих сообщений об ошибках

По-умолчанию сообщения об ошибке выводятся на английском языке:

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

Но вы можете установить свои собственные сообщения на любом языке. Вот к примеру на русском:

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
  YEAR_IN_PAST: "Year is in the past",
  MONTH_IN_PAST: "Month is in the past",
  CODE_REQUIRED: "Укажите код безопасности",
  CODE_INVALID: "Код безопасности указан неверно"
});
```

## Бренды

В файлах плагина есть папка с логотипами брендов `brands-logos`. Логотип каждого бренда представлен в 3 цветовых схемах: цветной, чёрный, белый. Также все эти логотипы загргужены по адресу: https://static.binking.io/brands-logos

Вы можете скачать эти логотипы к себе и использовать их на своей стороне, или вы можете выводить их напрямую с нашего сервера. Названия файлов на нашем сервере идентичны тем, что представлены в папке `brands-logos`.

Перечень брендов: Visa, Mastercard, American Express, Diners Club, Discover, JCB, UnionPay, Maestro, Mir.

Перечень алиасов брендов: `visa`, `mastercard`, `american-express`, `diners-club`, `discover`, `jcb`, `unionpay`, `maestro`, `mir`.

## Разработка и тестирование

Весь исходный код находится в файле `index.js`. Для применения eslint вызовите команду `$ npm run lint-fix`. Чтобы сбилдить файлы для папки `dist` вызовите команду `$ npm run build`.

Чтобы прогнать тесты вызовите команду `$ API_KEY=YOUR_API_KEY npm run test`.

Чтобы прогнать тесты в браузере, откройте файл `test.html` в браузере, после этого в строке браузера добавьте `#YOUR_API_KEY`. Например: `file:///Users/username/binking/test.html#YOUR_API_KEY`.

Если ключ апи не указать, тесты провалятся. Все запросы к апи во время теста уходят с флагом `sandbox=1`, так что эти запросы являются абсолютно бесплатными.
