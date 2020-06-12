const base = require('@amaurymartiny/eslintrc');

module.exports = {
  ...base,
  // Remove react-related plugins.
  extends: base.extends.filter(plugin => !plugin.includes('react'))
}
