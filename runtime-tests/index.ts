const config = {
	chain: 'polkadot',
};
const argv = process.argv.slice(0, 2);

/**
 * We return empty string's as an indication of a false value. JS recognizes "" as falsey.
 * NodeJS.Process.argv.reduce expects the return value of the accumulator to
 * be of type string, this is a way of satisfying the compiler, but also
 * returning the correct behavior.
 */
process.argv.reduce((cmd, arg) => {
	if (cmd) {
		if (cmd.startsWith('/')) return '';
		config[cmd] = arg;
		return '';
	}

	if (arg.startsWith('--')) {
		const sub = arg.substring('--'.length);
		// Will only accept the flag if it's within the config
		if (Object.keys(config).includes(sub)) {
			// Set the sub to the next cmd
			return sub;
		}
	}

	argv.push(arg);
	return '';
});

// Store configuration on env
process.env.__CONFIGURATION = JSON.stringify(config);

// Setting real ARGV
process.argv = argv;

// Calling jest runner
require('jest-cli/bin/jest');
