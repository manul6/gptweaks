export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        browser: "readonly",
        chrome: "readonly",
        console: "readonly",
        document: "readonly",
        window: "readonly",
        setTimeout: "readonly",
        Node: "readonly",
        Array: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off"
    }
  }
];