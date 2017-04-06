const UglifyJS = require('uglify-js')

module.exports = (code) => {
  return UglifyJS.minify(code, { fromString: true }).code
}
