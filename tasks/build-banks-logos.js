const path = require('path')
const buildImages = require('./_build-images')

buildImages(
  path.resolve(__dirname, '..', 'dist', 'banks-logos'),
  path.resolve(__dirname, '..', 'src', 'banks-logos', '*'),
  600,
  200
)
