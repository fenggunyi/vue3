/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-empty': 0,
    'prefer-const': 0,
    'no-async-promise-executor': 0,
    'no-prototype-builtins': 0,
    'vue/multi-word-component-names': 0,
    'vue/no-setup-props-destructure': 0,
    'vue/return-in-computed-property': 0
  }
}
