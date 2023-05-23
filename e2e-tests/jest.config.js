const base = require('@substrate/dev/config/jest')

module.exports = {
    ...base,
    testPathIgnorePatterns: ['/build/', '/node_modules/', '/src/'],
    testEnvironment: 'node',
	maxConcurrency: 3,
	maxWorkers: '50%',
    globals: {
        'ts-jest': {
            isloatedModules: true
        }
    }
};
