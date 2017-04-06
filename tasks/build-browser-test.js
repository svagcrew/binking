const browserify = require('browserify')
const path = require('path')
const fs = require('fs-extra')

const destDir = path.resolve(__dirname, '..', 'test', 'browser')
fs.ensureDirSync(destDir)
const srcPath = path.resolve(__dirname, '..', 'test', 'main.js')
browserify()
  .add(srcPath)
  .ignore('buffer')
  .ignore(path.resolve(__dirname, '..', 'tasks', '_read-banks.js'))
  .ignore(path.resolve(__dirname, '..', 'tasks', '_get-banks-and-prefixes.js'))
  .bundle((err, buf) => {
    if (err) throw err
    fs.writeFile(path.resolve(destDir, 'main.js'), buf, (err) => {
      if (err) throw err
    })
  })
