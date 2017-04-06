const glob = require('glob')
const path = require('path')
const sharp = require('sharp')
const fs = require('fs-extra')
const argv = require('yargs').argv

module.exports = (destDir, srcPattern, defaultWidth, defaultHeight) => {
  let width
  let height
  if (argv.width || argv.w || argv.height || argv.h) {
    width = argv.width || argv.w || null
    height = argv.height || argv.h || null
  } else {
    width = defaultWidth
    height = defaultHeight
  }

  const enlargement = argv.enlargement || argv.n || false
  const embed = argv.embed || argv.e || false

  fs.ensureDirSync(destDir)
  const imagesPaths = glob.sync(srcPattern)
  for (const imagePath of imagesPaths) {
    const extname = path.extname(imagePath)
    const basename = path.basename(imagePath, extname)
    const isSvg = (extname === '.svg')
    const options = isSvg ? { density: 300 } : {}
    const resizing = sharp(imagePath, options).resize(width, height).max()
    if (!enlargement) resizing.withoutEnlargement()
    if (embed) resizing.background({ r: 0, g: 0, b: 0, alpha: 0 }).embed()
    resizing.toFile(path.resolve(destDir, `${basename}.png`), (err) => {
      if (err) throw err
    })
    if (isSvg) fs.copy(imagePath, path.resolve(destDir, `${basename}.svg`))
  }
}
