const base = require('@substrate/dev/config/jest')

module.exports = {
    ...base,
    testPathIgnorePatterns: ['/build/', '/node_modules/'],
};
