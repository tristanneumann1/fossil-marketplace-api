const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, './'),
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.*\\.(js)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(svg)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  coverageDirectory: '<rootDir>/test/unit/coverage',
  collectCoverageFrom: [
    '**/*.js',
    '**/*.vue',
    '!**/node_modules/**',
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
