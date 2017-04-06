const path = require('path')
const buildImages = require('./_build-images')

buildImages(
  path.resolve(__dirname, '..', 'dist', 'brands-logos'),
  path.resolve(__dirname, '..', 'src', 'brands-logos', '*'),
  null,
  60
)
