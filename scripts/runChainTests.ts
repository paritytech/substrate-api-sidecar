import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

import { config } from './config';

type StatusCode = '0' | '1';

interface IProcOpts {
	process: string;
	resolver: string;
	args: string[];
}

const procs: { [key: string]: ChildProcessWithoutNullStreams } = {};

const setWsUrl = (url: string): void => {
	process.env.SAS_SUBSTRATE_WS_URL = url;
};

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

			// This ensures that sidecar is fully launched and the last
			// info logger has been consoled
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

// Kill all processes spawned and tracked by this file.
const killAll = () => {
	console.log('\nKilling all processes...');
	for (const key of Object.keys(procs)) {
		console.log(`\nKilling ${key} process`);
		procs[key].kill();
	}
};

const launchChainTest = async (
	wsUrl: string,
	SasBuildOpts: IProcOpts,
	SasStartOpts: IProcOpts,
	JestProcOpts: IProcOpts
): Promise<boolean> => {
	setWsUrl(wsUrl);

	console.log('Launching Sidecar...');
	const sidecarBuild = await launchProcess(SasBuildOpts);
	const sidecarStart = await launchProcess(SasStartOpts);

	if (sidecarBuild === '0' && sidecarStart === '0') {
		// Sidecar successfully launched, and jest will now get called
		console.log('Launching jest...');
		const jest = await launchProcess(JestProcOpts);

		if (jest === '0') {
			return true;
		}
	} else {
		console.log('Error launching sidecar');
		return false;
	}

	return false;
};

const main = async (): Promise<void> => {
	const { polkadot } = config;

	const polkadotTest = await launchChainTest(
		polkadot.wsUrl,
		polkadot.SasBuildOpts,
		polkadot.SasStartOpts,
		polkadot.JestProcOpts
	);

	console.log(polkadotTest);
	setTimeout(() => {
		killAll();
	}, 10000);
};

main().catch((err) => console.log(err));
