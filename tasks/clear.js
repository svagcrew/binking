const del = require('del')
const path = require('path')

del.sync([path.resolve(__dirname, '..', 'dist', '**'), '!' + path.resolve(__dirname, '..', 'dist')])
