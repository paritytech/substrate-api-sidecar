module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'prettier',
    'simple-import-sort'
  ],
  rules: {
    // Sort imports
    'simple-import-sort/sort': 'error',
    // https://github.com/eslint/eslint/issues/2321#issuecomment-134665757
    'no-unused-vars': [2, { args: 'all', argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-unused-vars': [
      2,
      { args: 'all', argsIgnorePattern: '^_' }
    ],
    "@typescript-eslint/ban-types": 0,
  },
};
