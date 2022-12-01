// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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

import { ArgumentParser, Namespace } from 'argparse';

import { historicalE2eConfig, defaultSasBuildOpts, localWsUrl } from './config';
import {
	killAll,
	launchProcess,
	setLogLevel,
	setWsUrl,
} from './sidecarScriptApi';
import { ProcsType, StatusCode } from './types';
import { checkTests } from './e2eHelpers';

// Stores all the processes
const procs: ProcsType = {};

/**
 * Launches Sidecar, and if successful it will launch the jest runner. This operation
 * handles killing all the processes after the jest runner is done.
 *
 * @param chain The chain in which to target the e2e tests too.
 */
const launchChainTest = async (chain: string, isLocal: boolean): Promise<boolean> => {
	const { wsUrl, SasStartOpts, JestProcOpts } = historicalE2eConfig[chain];
	const { Success } = StatusCode;

	// Set the ws url env var
	isLocal ? setWsUrl(localWsUrl) : setWsUrl(wsUrl);

	console.log('Launching Sidecar...');
	const sidecarStart = await launchProcess('yarn', procs, SasStartOpts);

	if (sidecarStart === Success) {
		// Sidecar successfully launched, and jest will now get called
		console.log('Launching jest...');
		const jest = await launchProcess('yarn', procs, JestProcOpts);

		if (jest === Success) {
			killAll(procs);
			return true;
		} else {
			killAll(procs);
			return false;
		}
	} else {
		console.error('Error launching sidecar... exiting...');
		killAll(procs);
		process.exit(2);
	}
};

const main = async (args: Namespace): Promise<void> => {
	const { Failed } = StatusCode;
	const isLocal = args.local ? true : false;

	if (isLocal && !args.chain) {
		console.error('error: `--local` must be used in conjunction with `--chain`');
		process.exit(3);
	}

	if (args.log_level) {
		setLogLevel(args.log_level);
	}

	// Build sidecar
	console.log('Building Sidecar...');
	const sidecarBuild = await launchProcess('yarn', procs, defaultSasBuildOpts);

	// When sidecar fails to build, we kill all process's and exit
	if (sidecarBuild === Failed) {
		console.error('Sidecar failed to build, exiting...');
		// Kill all processes
		killAll(procs);
		// Exit program
		process.exit(2);
	}

	if (args.chain) {
		const selectedChain = await launchChainTest(args.chain, isLocal);

		checkTests(selectedChain);
	} else {
		// Test the e2e tests against polkadot
		const polkadotTest = await launchChainTest('polkadot', false);

		// Test the e2e tests against kusama
		const kusamaTest = await launchChainTest('kusama', false);

		// Test the e2e tests against westend
		const westendTest = await launchChainTest('westend', false);

		// Test the e2e tests against statemine
		const statemineTest = await launchChainTest('statemine', false);

		// Test the e2e tests against statemint
		const statemintTest = await launchChainTest('statemint', false);

		checkTests(polkadotTest, kusamaTest, westendTest, statemineTest, statemintTest);
	}
};

/**
 * Arg Parser
 */
const parser = new ArgumentParser();

parser.add_argument('--local', {
	required: false,
	action: 'store_true'
})
parser.add_argument('--chain', {
	choices: ['polkadot', 'kusama', 'westend', 'statemine', 'statemint'],
});
parser.add_argument('--log-level', {
	choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
});

const args = parser.parse_args() as Namespace;

/**
 * Signal interrupt
 */
process.on('SIGINT', function () {
	console.log('Caught interrupt signal');
	killAll(procs);
	process.exit();
});

/**
 * Signal hangup terminal
 */
process.on('SIGHUP', function () {
	console.log('Caught terminal termination');
	killAll(procs);
	process.exit();
});

main(args).finally(() => process.exit());
