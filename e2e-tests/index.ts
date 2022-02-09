import { ArgumentParser } from 'argparse';

import { IParser } from './types';

const config = {
	chain: 'polkadot',
};

const argv = process.argv.slice(0, 2);

/**
 * The arg parser takes in two commands.
 * @arg --chain The chain to be passed into the jest test
 * @arg --config The path to the correct jest config. This is important as the
 * jest config inside of /runtime-tests ignores all the other tests.
 */
const parser = new ArgumentParser();

parser.add_argument('--chain', {
	choices: ['polkadot', 'kusama', 'westend', 'statemine', 'statemint'],
	default: 'polkadot',
});
parser.add_argument('--config', { default: './runtime-tests/jest.config.js' });

const args = parser.parse_args() as IParser;

// Set the chain property for the jest test
config['chain'] = args.chain;

// Pass in the Jest CLI path option to the correct config
argv.push('--config='.concat(args.config));

// Store configuration on env
process.env.__SAS_RUNTIME_TEST_CONFIGURATION = JSON.stringify(config);

// Setting real ARGV
process.argv = argv;

// Calling jest runner
require('jest-cli/bin/jest');
