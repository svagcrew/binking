const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

;(async () => {
  try {
    const brandsLogosDir = path.resolve(__dirname, 'brands-logos')
    const brandsLogosFiles = fs.readdirSync(brandsLogosDir)
    console.log(brandsLogosDir)
    for (const logoFileName of brandsLogosFiles) {
      const extname = path.extname(logoFileName)
      if (extname !== '.svg') {
        continue
      }
      const basename = path.basename(logoFileName, extname)
      const srcPathName = path.resolve(brandsLogosDir, logoFileName)
      const destPathName = path.resolve(brandsLogosDir, `${basename}.png`)
      console.log(srcPathName, destPathName)
      await sharp(srcPathName, { density: 1000 })
        .png()
        .resize(250, 250, {
          fit: 'inside'
        })
        .toFile(destPathName)
    }
  } catch (e) {
    console.error(e)
  }
})()
