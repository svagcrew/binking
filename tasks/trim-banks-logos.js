const glob = require('glob')
const gm = require('gm').subClass({ imageMagick: true })

const banksLogosPaths = glob.sync('./src/banks-logos/trim/*')
for (const bankLogoPath of banksLogosPaths) {
  gm(bankLogoPath)
    .trim()
    .write(bankLogoPath, (err) => {
      if (err) throw err
    })
}
