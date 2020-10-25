module.exports = {
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
  preset: "ts-jest",
  reporters: ["default", "jest-junit"],
  transformIgnorePatterns: ["/node_modules/"],
  testEnvironment: "node",
  roots: ["app/", "tests/"],
  resetMocks: true,
  setupFilesAfterEnv: ["./tests/setup.ts"],
  coverageDirectory: "./coverage/",
  collectCoverage: true
}
