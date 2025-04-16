module.exports = {
  extends: ["react-app"],
  ignorePatterns: ["**/node_modules/monaco-editor/**", "**/node_modules/stylis-plugin-rtl/**"],
  overrides: [
    {
      files: ["**/*.js"],
      rules: {
        "import/no-webpack-loader-syntax": "off"
      }
    }
  ]
}; 