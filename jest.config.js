module.exports = {
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
  transform: {
    "^.+\\.tsx?$": "babel-jest"
  },
  reporters: ["default", "jest-junit"],
  transformIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^@app/(.*)": "<rootDir>/app/$1",
    "^@test/(.*)$": "<rootDir>/tests/$1"
  },
  testEnvironment: "node",
  roots: ["app/", "tests/"],
  resetMocks: true
}
