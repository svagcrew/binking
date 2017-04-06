const eslint = require('mocha-eslint')

eslint(['src/**/*.js', 'tasks/**/*.js', 'test/**/*.js', '!test/browser/**/*.js'], { strict: true })
