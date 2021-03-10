module.exports = {
	preset: 'ts-jest/presets/js-with-babel',
	transformIgnorePatterns: ['<rootDir>/node_modules/(?!@polkadot|@babel/runtime/helpers/esm/)'],
	testPathIgnorePatterns: ['/build/', '/node_modules/', '/docs/'],
};
