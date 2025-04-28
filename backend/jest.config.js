module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    '!**/__tests__/**'
  ],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['js', 'json', 'node'],
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true
}; 