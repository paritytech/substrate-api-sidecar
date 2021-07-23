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
 * Launch any given process. It accepts a resolver as a option, which will act
 * as the success case when searching through the stdout.
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
		const command = 'yarn';

		procs[proc] = spawn(command, args, { detached: true });

		procs[proc].stdout.on('data', (data: Buffer) => {
			console.log(data.toString());

			if (data.toString().includes(resolver)) {
				resolve('0');
			}
		});

		procs[proc].stderr.on('data', (data: Buffer) => {
			console.error(data.toString());

			if (resolverStartupErr && data.toString().includes(resolverStartupErr)) {
				resolve('1');
			}
		});

		procs[proc].on('close', () => {
			resolve('0');
		});

		procs[proc].on('error', (err) => {
			console.log(err);
			reject('1');
		});
	});
};

const launchChainTest = async (chain: string): Promise<boolean> => {
	const { wsUrl, SasStartOpts, JestProcOpts } = config[chain];

	// Set the ws url env var
	setWsUrl(wsUrl);

	console.log('Launching Sidecar...');
	const sidecarStart = await launchProcess(SasStartOpts);

	if (sidecarStart === '0') {
		// Sidecar successfully launched, and jest will now get called
		console.log('Launching jest...');
		const jest = await launchProcess(JestProcOpts);

		if (jest === '0') {
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
				/* continue regardless */
			}
		}
	}
};

const main = async (args: Namespace): Promise<void> => {
	// Build sidecar
	console.log('Building Sidecar...');
	const sidecarBuild = await launchProcess(defaultSasBuildOpts);

	// When sidecar fails to build, we kill all process's and exit
	if (sidecarBuild === '1') {
		console.error('Sidecar failed to build, exiting...');
		// Kill all processes
		killAll();
		// Exit program
		process.exit();
	}

	if (args.chain) {
		const selectedChain = await launchChainTest(args.chain);

		if (selectedChain) {
			process.exit(0);
		} else {
			process.exit(1);
		}
	} else {
		// Test the e2e tests against polkadot
		const polkadotTest = await launchChainTest('polkadot');

		// Test the e2e tests against kusama
		const kusamaTest = await launchChainTest('kusama');

		// Test the e2e tests against westend
		const westendTest = await launchChainTest('westend');

		if (polkadotTest && kusamaTest && westendTest) {
            console.log('[PASSED] All Tests Passed!');
			process.exit(0);
		} else {
            console.log('[FAILED] Some Tests Failed!');
			process.exit(1);
		}
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

main(args).finally(() => {
	killAll();
});
