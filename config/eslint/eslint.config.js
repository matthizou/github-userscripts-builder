module.exports = {
  // extends: 'airbnb-base',
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'], // activating esling-plugin-prettier (--fix stuff)
  rules: {
    semi: ['error', 'never'],
    'no-console': 1,
    'import/prefer-default-export': 0,
    'no-use-before-define': 0,
    'prettier/prettier': [
      'error',
      {
        printWidth: 80,
        singleQuote: true,
        tadWidth: 4,
        trailingComma: 'all',
      },
    ],
  },
  env: {
    browser: true,
    greasemonkey: true,
  },
}
