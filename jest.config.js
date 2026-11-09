module.exports = {
  moduleDirectories: ['node_modules', '<rootDir>'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/e2e/'
  ],
  transform: {
    '\\.tsx?$': ['ts-jest', {}]
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!lodash-es/).*\\.js$']
}
