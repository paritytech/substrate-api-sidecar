const defaultSasBuildOpts = {
	process: 'sidecar',
	resolver: 'Build Finished',
	args: ['build'],
};

const defaultSasStartOpts = {
	process: 'sidecar',
	resolver: 'Check the root endpoint',
	args: ['start'],
};

export const config = {
	polkadot: {
		wsUrl: 'wss://rpc.polkadot.io',
		JestProcOpts: {
			process: 'jest',
			resolver: 'PASS',
			args: ['test:e2e-tests', '--chain', 'polkadot'],
		},
		SasBuildOpts: defaultSasBuildOpts,
		SasStartOpts: defaultSasStartOpts,
	},
	kusama: {
		JestProcOpts: {
			process: 'jest',
			resolver: 'PASS',
			args: [],
		},
		SasBuildOpts: defaultSasBuildOpts,
		SasStartOpts: defaultSasStartOpts,
	},
	westend: {
		JestProcOpts: {
			process: 'jest',
			resolver: 'PASS',
			args: [],
		},
		SasBuildOpts: defaultSasBuildOpts,
		SasStartOpts: defaultSasStartOpts,
	},
	statemine: {
		JestProcOpts: {
			process: 'jest',
			resolver: 'PASS',
			args: [],
		},
		SasBuildOpts: defaultSasBuildOpts,
		SasStartOpts: defaultSasStartOpts,
	},
};
