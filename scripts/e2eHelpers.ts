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
import { killAll, launchProcess, setWsUrl } from './sidecarScriptApi';
import { IChainConfigE2E, ProcsType, StatusCode } from './types';

/**
 * Check each chain test returned by `launchChainTest`, and exit the program
 * with the correct process.
 *
 * @param args The results of each test.
 */
export const checkTests = (...args: boolean[]): void => {
	const testStatus = args.every((test) => test);

	if (testStatus) {
		console.log('[PASSED] All Tests Passed!');
		process.exit(0);
	} else {
		console.log('[FAILED] Some Tests Failed!');
		process.exit(1);
	}
};

/**
 * Launch a e2e test for a chain.
 *
 * @param chain The chain to test against.
 * @param config The config specific to a chain.
 * @param isLocal Boolean declaring if this chain is local.
 * @param procs Object containing all the processes.
 */
export const launchChainTest = async (
	chain: string,
	config: Record<string, IChainConfigE2E>,
	procs: ProcsType,
	localUrl?: string,
): Promise<boolean> => {
	const { wsUrl, SasStartOpts, e2eStartOpts } = config[chain];
	const { Success } = StatusCode;

	// Set the ws url env var
	localUrl ? setWsUrl(localUrl) : setWsUrl(wsUrl);

	console.log('Launching Sidecar...');
	const sidecarStart = await launchProcess('yarn', procs, SasStartOpts);

	if (sidecarStart.code === Success) {
		// Sidecar successfully launched, and jest will now get called
		console.log('Launching jest...');
		const jest = await launchProcess('yarn', procs, e2eStartOpts);

		if (jest.code === Success) {
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
