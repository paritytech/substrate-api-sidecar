// Copyright 2017-2023 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ArgumentParser } from 'argparse';

import { IParser } from './types';

const config = {
	chain: 'polkadot',
};

const argv = process.argv.slice(0, 2);

/**
 * The arg parser takes in two commands. This file also directly relates to the historical e2e-tests.
 *
 * @arg --chain The chain to be passed into the jest test
 * @arg --config The path to the correct jest config. This is important as the
 * jest config inside of /runtime-tests ignores all the other tests.
 */
const parser = new ArgumentParser();

parser.add_argument('--chain', {
	choices: ['polkadot', 'kusama', 'westend', 'asset-hub-kusama', 'asset-hub-polkadot', 'asset-hub-westend', 'westmint'],
	default: 'polkadot',
});
parser.add_argument('--config', { default: './e2e-tests/jest.config.js' });

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
