import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

import { config, defaultSasBuildOpts } from './config';

type StatusCode = '0' | '1';

interface IProcOpts {
	process: string;
	resolver: string;
	args: string[];
}

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
	process,
	resolver,
	args,
}: IProcOpts): Promise<StatusCode> => {
	return new Promise<StatusCode>((resolve, reject) => {
		const command = 'yarn';

		procs[process] = spawn(command, args);

		procs[process].stdout.on('data', (data: Buffer) => {
			console.log(data.toString());

			if (data.toString().includes(resolver)) {
				resolve('0');
			}
		});

		procs[process].stderr.on('data', (data: Buffer) => {
			console.error(data.toString());
		});

		procs[process].on('close', () => {
			resolve('0');
		});

		procs[process].on('error', (err) => {
			console.log(err);
			reject('1');
		});
	});
};

const launchChainTest = async (chain: string): Promise<boolean> => {
	const { wsUrl, SasStartOpts, JestProcOpts } = config[chain];
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
		}
	} else {
		console.log('Error launching sidecar');
		return false;
	}

	return false;
};

// Kill all processes spawned and tracked by this file.
const killAll = () => {
	console.log('\nKilling all processes...');
	for (const key of Object.keys(procs)) {
		console.log(`\nKilling ${key} process`);
		procs[key].kill();
	}
};

const main = async (): Promise<void> => {
	// Build sidecar
	console.log('Building Sidecar...');
	const sidecarBuild = await launchProcess(defaultSasBuildOpts);

	if (sidecarBuild === '1') {
		console.log('Sidecar failed to build, exiting...');
		// Kill all processes
		killAll();
		// Exit program
		process.exit();
	}

	// Test the e2e tests against polkadot
	const polkadotTest = await launchChainTest('polkadot');

	// Test the e2e tests against kusama
	const kusamaTest = await launchChainTest('kusama');

	// Test the e2e tests against westend
	const westendTest = await launchChainTest('westend');

	if (polkadotTest && kusamaTest && westendTest) {
		killAll();
		process.exit(0);
	} else {
		killAll();
		process.exit(1);
	}
};

main().catch((err) => console.log(err));
