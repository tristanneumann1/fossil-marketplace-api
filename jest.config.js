const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, './'),
  setupFiles: [
    'jest-localstorage-mock'
  ],
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
  ],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.vue$': 'vue-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/$1',
    '\\.(svg)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  coverageDirectory: '<rootDir>/test/unit/coverage',
  collectCoverageFrom: [
    '**/*.js',
    '**/*.vue',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!./nuxtClient.js',
    '!**/test/**',
    '!**/utils/**',
  ],
  coverageThreshold: {
    global: {
      'statements': 100,
      'branches': 100,
      'functions': 100,
      'lines': 100,
    },
  },
};
