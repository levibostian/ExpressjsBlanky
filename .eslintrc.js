module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["jest"],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "@levibostian/eslint-config-node"
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  overrides: [
    {
      files: ["*.test.ts"],
      rules: {}
    },
    {
      files: ["*.ts"],
      rules: {}
    }
  ]
}
