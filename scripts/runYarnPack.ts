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

import { defaultSasBuildOpts, defaultSasPackOpts } from './config';
import { killAll, launchProcess, setWsUrl } from './sidecarScriptApi';
import { ProcsType, StatusCode } from './types';

const procs: ProcsType = {};

/**
 * Cleans up the remaining deps and files that should be temps
 */
const cleanup = async () => {
	const { Failed } = StatusCode;

	/**
	 * Cleanup dep tree
	 */
	console.log('Uninstalling Sidecar..');
	const sasUnInstallPackOpts = {
		proc: 'sidecar-install-pack',
		resolver: 'YN0000: Done',
		args: ['remove', '@substrate/api-sidecar'],
	};
	const sidecarUnInstallPack = await launchProcess('yarn', procs, sasUnInstallPackOpts);

	if (sidecarUnInstallPack.code === Failed) {
		console.error('UnInstalling sidecar package failed..');
		console.error('Please uninstall the package using `yarn remove @substrate/api-sidecar`.');
		killAll(procs);
	}

	/**
	 * Delete tarball
	 */
	console.log('Deleting tarball');
	const sasDeleteTarballOpts = {
		proc: 'delete-tarball',
		resolver: '',
		args: ['-rf', `${__dirname}/../../package.tgz`],
	};
	const deleteTarball = await launchProcess('rm', procs, sasDeleteTarballOpts);

	if (deleteTarball.code === Failed) {
		console.error('Error deleting tarball.');
		console.error('In order to delete tarball run: `rm -rf ./package.tgz` from the root directory of the repository.');
		killAll(procs);
	}
};

/**
 * This script creates a dry-run npm release and checks if sidecar
 * launches succesfully.
 */
const main = async () => {
	const { Failed, Success } = StatusCode;

	/**
	 * Build sidecar
	 */
	console.log('Building Sidecar');
	const sidecarBuild = await launchProcess('yarn', procs, defaultSasBuildOpts);

	if (sidecarBuild.code === Failed) {
		console.error('Sidecar failed to build, exiting...');
		killAll(procs);
		process.exit(1);
	}

	/**
	 * Build Tarball via yarn pack
	 */
	console.log('Building Local Npm release of Sidecar.');
	const sidecarPack = await launchProcess('yarn', procs, defaultSasPackOpts);

	if (sidecarPack.code === Failed) {
		console.error('Sidecar failed to build an local npm tarball.');
		killAll(procs);
		process.exit(1);
	}

	/**
	 * Install tarball
	 */
	console.log('Installing Sidecar as a package');
	const sasInstallPackOpts = {
		proc: 'sidecar-install-pack',
		resolver: 'YN0000: Done',
		args: ['add', `${__dirname}/../../package.tgz`],
	};
	const sidecarInstallPack = await launchProcess('yarn', procs, sasInstallPackOpts);

	if (sidecarInstallPack.code === Failed) {
		console.error('Installing the binary failed..');
		killAll(procs);
		process.exit(1);
	}

	/**
	 * Start sidecar and see if it works
	 */
	setWsUrl('wss://kusama-rpc.polkadot.io');
	console.log('Initializing Sidecar');
	const sasStartPackOpts = {
		proc: 'sidecar',
		resolver: 'Check the root endpoint',
		resolverStartupErr: 'Error',
		args: [],
	};
	const sidecarStart = await launchProcess(
		`${__dirname}/../../node_modules/.bin/substrate-api-sidecar`,
		procs,
		sasStartPackOpts,
	);

	if (sidecarStart.code === Success) {
		console.log('Successful Release Build of Sidecar');
		killAll(procs);
		await cleanup();
		process.exit(0);
	} else {
		console.error('Release Build failed for Sidecar');
		killAll(procs);
		await cleanup();
		process.exit(1);
	}
};

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

main()
	.catch((err) => console.error(err))
	.finally(() => process.exit());
