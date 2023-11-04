module.exports = {
  moduleDirectories: ['node_modules', '<rootDir>'],
  transform: {
    '\\.tsx?$': ['ts-jest', {}]
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!lodash-es/).*\\.js$']
}
