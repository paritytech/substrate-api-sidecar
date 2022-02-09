import { ArgumentParser, Namespace } from 'argparse';

import { config, defaultSasBuildOpts } from './config';
import {
	killAll,
	launchProcess,
	setLogLevel,
	setWsUrl,
} from './sidecarScriptApi';
import { ProcsType, StatusCode } from './types';

// Stores all the processes
const procs: ProcsType = {};

/**
 * Launches Sidecar, and if successful it will launch the jest runner. This operation
 * handles killing all the processes after the jest runner is done.
 *
 * @param chain The chain in which to target the e2e tests too.
 */
const launchChainTest = async (chain: string): Promise<boolean> => {
	const { wsUrl, SasStartOpts, JestProcOpts } = config[chain];
	const { Success } = StatusCode;

	// Set the ws url env var
	setWsUrl(wsUrl);

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
		process.exit(1);
	}
};

const checkTests = (...args: boolean[]) => {
	const testStatus = args.every((test) => test);

	if (testStatus) {
		console.log('[PASSED] All Tests Passed!');
		process.exit(0);
	} else {
		console.log('[FAILED] Some Tests Failed!');
		process.exit(1);
	}
};

const main = async (args: Namespace): Promise<void> => {
	const { Failed } = StatusCode;

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
		process.exit();
	}

	if (args.chain) {
		const selectedChain = await launchChainTest(args.chain);

		checkTests(selectedChain);
	} else {
		// Test the e2e tests against polkadot
		const polkadotTest = await launchChainTest('polkadot');

		// Test the e2e tests against kusama
		const kusamaTest = await launchChainTest('kusama');

		// Test the e2e tests against westend
		const westendTest = await launchChainTest('westend');

		// Test the e2e tests against statemine
		const statemineTest = await launchChainTest('statemine');

		// Test the e2e tests against statemint
		const statemintTest = await launchChainTest('statemint');

		checkTests(polkadotTest, kusamaTest, westendTest, statemineTest, statemintTest);
	}
};

/**
 * Arg Parser
 */
const parser = new ArgumentParser();

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
