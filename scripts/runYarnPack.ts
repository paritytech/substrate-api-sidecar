import { defaultSasBuildOpts, defaultSasPackOpts } from './config';
import { killAll, launchProcess } from './sidecarScriptApi';
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
	const sidecarUnInstallPack = await launchProcess(sasUnInstallPackOpts, procs);

	if (sidecarUnInstallPack === Failed) {
		console.error('UnInstalling sidecar package failed');
		killAll(procs);
	}

	/**
	 * Delete tarball
	 */
	console.log('Deleting Tarball');
	const sasDeleteTarballOpts = {
		proc: 'delete-tarball',
		resolver: '',
		args: ['-rf', `${__dirname}/../../package.tgz`],
	};
	const deleteTarball = await launchProcess(sasDeleteTarballOpts, procs, 'rm');

	if (deleteTarball === Failed) {
		console.error('Error deleting tarball');
		killAll(procs);
	}
};

/**
 * This scripts focus is to create a dry-run npm release and check if sidecar
 * launches succesfully.
 */
const main = async () => {
	const { Failed, Success } = StatusCode;

	/**
	 * Build sidecar
	 */
	console.log('Building Sidecar');
	const sidecarBuild = await launchProcess(defaultSasBuildOpts, procs);

	if (sidecarBuild === Failed) {
		console.error('Sidecar failed to build, exiting...');
		killAll(procs);
		process.exit(1);
	}

	/**
	 * Build Tarball via yarn pack
	 */
	console.log('Building Local Npm release of Sidecar.');
	const sidecarPack = await launchProcess(defaultSasPackOpts, procs);

	if (sidecarPack === Failed) {
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
	const sidecarInstallPack = await launchProcess(sasInstallPackOpts, procs);

	if (sidecarInstallPack === Failed) {
		console.error('Installing the binary failed..');
		killAll(procs);
		process.exit(1);
	}

	/**
	 * Start sidecar and see if it works
	 */
	console.log('Initializing Sidecar');
	const sasStartPackOpts = {
		proc: 'sidecar',
		resolver: 'Check the root endpoint',
		resolverStartupErr: 'error: uncaughtException: listen EADDRINUSE:',
		args: [],
	};
	const sidecarStart = await launchProcess(
		sasStartPackOpts,
		procs,
		`${__dirname}/../../node_modules/.bin/substrate-api-sidecar`
	);

	if (sidecarStart === Success) {
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

main().finally(() => process.exit());
