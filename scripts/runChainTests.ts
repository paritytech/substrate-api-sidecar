import { ArgumentParser, Namespace } from 'argparse';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

import { config, defaultSasBuildOpts } from './config';
import { IProcOpts, StatusCode } from './types';

// Stores all the processes
const procs: { [key: string]: ChildProcessWithoutNullStreams } = {};

// Set the env variable for SAS_SUBSTRATE_WS_URL
const setWsUrl = (url: string): void => {
	process.env.SAS_SUBSTRATE_WS_URL = url;
};

/**
 * Launch any given process. It accepts an options object.
 *
 * {
 *   proc => the name of the process to be saved in our cache
 *   resolver => If the stdout contains the resolver it will resolve the process
 *   resolverStartupErr => If the stderr contains the resolver it will resolve the process
 *   args => an array of args to be attached to the `yarn` command.
 * }
 *
 * @param IProcOpts
 */
const launchProcess = async ({
	proc,
	resolver,
	resolverStartupErr,
	args,
}: IProcOpts): Promise<StatusCode> => {
	return new Promise<StatusCode>((resolve, reject) => {
		const { Success, Failed } = StatusCode;

		const command = 'yarn';

		procs[proc] = spawn(command, args, { detached: true });

		procs[proc].stdout.on('data', (data: Buffer) => {
			console.log(data.toString());

			if (data.toString().includes(resolver)) {
				resolve(Success);
			}
		});

		procs[proc].stderr.on('data', (data: Buffer) => {
			console.error(data.toString());

			if (resolverStartupErr && data.toString().includes(resolverStartupErr)) {
				resolve(Failed);
			}
		});

		procs[proc].on('close', () => {
			resolve(Success);
		});

		procs[proc].on('error', (err) => {
			console.log(err);
			reject(Failed);
		});
	});
};

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
	const sidecarStart = await launchProcess(SasStartOpts);

	if (sidecarStart === Success) {
		// Sidecar successfully launched, and jest will now get called
		console.log('Launching jest...');
		const jest = await launchProcess(JestProcOpts);

		if (jest === Success) {
			killAll();
			return true;
		} else {
			killAll();
			return false;
		}
	} else {
		console.error('Error launching sidecar... exiting...');
		killAll();
		process.exit(1);
	}
};

// Kill all processes spawned and tracked by this file.
const killAll = () => {
	console.log('Killing all processes...');
	for (const key of Object.keys(procs)) {
		if (!procs[key].killed) {
			try {
				console.log(`Killing ${key}`);
				// Kill child and all its descendants.
				process.kill(-procs[key].pid, 'SIGTERM');
				process.kill(-procs[key].pid, 'SIGKILL');
			} catch (e) {
				/**
				 * The error we are catching here silently, is when `-procs[key].pid` takes
				 * the range of all pid's inside of the subprocess group created with
				 * `spawn`, and one of the process's is either already closed or doesn't exist anymore.
				 *
				 * ex: `Error: kill ESRCH`
				 *
				 * This is a very specific use case of an empty catch block and is used
				 * outside of the scope of the API therefore justifiable, and should be used cautiously
				 * elsewhere.
				 */
			}
		}
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

	// Build sidecar
	console.log('Building Sidecar...');
	const sidecarBuild = await launchProcess(defaultSasBuildOpts);

	// When sidecar fails to build, we kill all process's and exit
	if (sidecarBuild === Failed) {
		console.error('Sidecar failed to build, exiting...');
		// Kill all processes
		killAll();
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

		checkTests(polkadotTest, kusamaTest, westendTest);
	}
};

/**
 * Arg Parser
 */
const parser = new ArgumentParser();

parser.add_argument('--chain', {
	choices: ['polkadot', 'kusama', 'westend'],
});

const args = parser.parse_args() as Namespace;

/**
 * Signal interrupt
 */
process.on('SIGINT', function () {
	console.log('Caught interrupt signal');
	killAll();
	process.exit();
});

/**
 * Signal hangup terminal
 */
process.on('SIGHUP', function () {
	console.log('Caught terminal termination');
	killAll();
	process.exit();
});

main(args).finally(() => process.exit());
