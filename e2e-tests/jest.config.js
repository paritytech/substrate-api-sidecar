const base = require('@substrate/dev/config/jest')

module.exports = {
    ...base,
    testPathIgnorePatterns: ['/build/', '/node_modules/', '/src/'],
    testEnvironment: 'node',
	maxConcurrency: 3,
	maxWorkers: '50%',
    transform: {
        // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
        // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            isolatedModules: true
          },
        ],
    },
};
