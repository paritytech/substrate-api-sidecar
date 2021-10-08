import { spawn } from 'child_process';

import { IProcOpts, ProcsType, StatusCode } from './types';

/**
 * Sets the url that sidecar will use in the env
 *
 * @param url ws url used in sidecar
 */
export const setWsUrl = (url: string): void => {
	process.env.SAS_SUBSTRATE_WS_URL = url;
};

/**
 * Sets the log level for sidecar
 *
 * @param level log-levels -> error, warn, info, http, verbose, debug, silly
 */
export const setLogLevel = (level: string): void => {
	process.env.SAS_LOG_LEVEL = level;
};

/**
 * Kill all processes
 *
 * @param procs
 */
export const killAll = (procs: ProcsType): void => {
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

/**
 * Launch any given process. It accepts an options object.
 *
 * @param cmd Optional Command will default to 'yarn'
 * @param procs Object of saved processes
 * @param IProcOpts
 * {
 *   proc => the name of the process to be saved in our cache
 *   resolver => If the stdout contains the resolver it will resolve the process
 *   resolverStartupErr => If the stderr contains the resolver it will resolve the process
 *   args => an array of args to be attached to the `yarn` command.
 * }
 */
export const launchProcess = (
	cmd: string,
	procs: ProcsType,
	{ proc, resolver, resolverStartupErr, args }: IProcOpts
): Promise<StatusCode> => {
	return new Promise<StatusCode>((resolve, reject) => {
		const { Success, Failed } = StatusCode;

		const command = cmd || 'yarn';

		procs[proc] = spawn(command, args, { detached: true });

		procs[proc].stdout.on('data', (data: Buffer) => {
			console.log(data.toString().trim());

			if (data.toString().includes(resolver)) {
				resolve(Success);
			}
		});

		procs[proc].stderr.on('data', (data: Buffer) => {
			console.error(data.toString().trim());

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
