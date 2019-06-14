module.exports = {
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  transformIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^app/(.*)": "<rootDir>/app/$1",
    "^test/(.*)$": "<rootDir>/tests/$1",
  },
  // testMatch: [
  //   "**/tests/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)",
  // ],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["app/", "tests/"],
  resetMocks: true,
}
