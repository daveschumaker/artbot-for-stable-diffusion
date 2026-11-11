module.exports = {
  moduleDirectories: ['node_modules', '<rootDir>'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/test-utils/styleMock.js'
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/e2e/',
    '<rootDir>/__local_db/'
  ],
  // Local data, including copies of the repo for upgrade comparisons.
  modulePathIgnorePatterns: ['<rootDir>/__local_db/'],
  transform: {
    // ts-jest compiles each file, and TypeScript 6 needs rootDir to do that.
    '\\.tsx?$': [
      'ts-jest',
      { tsconfig: { jsx: 'react-jsx', rootDir: __dirname } }
    ]
  },
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\](?!lodash-es/).*\\.js$']
}
