const config = require('@substrate/dev/config/eslint');

module.exports = {
    ...config,
    parserOptions: {
        project: '**/tsconfig.json'
    }
}
