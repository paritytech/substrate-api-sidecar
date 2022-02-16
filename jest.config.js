const base = require('@substrate/dev/config/jest')

module.exports = {
	...base,
	verbose: true,
	coverageThreshold: {
		global: {
			branches: 50,
			functions: 70,
			lines: 70,
			statements: 85
		}
	},
	testEnvironment: 'node',
	testPathIgnorePatterns: ['/build/', '/node_modules/', '/docs/', '/e2e-tests/'],
};
