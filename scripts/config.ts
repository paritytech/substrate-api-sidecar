const defaultSasStartOpts = {
	process: 'sidecar',
	resolver: 'Check the root endpoint',
	args: ['start'],
};

export const defaultSasBuildOpts = {
	process: 'sidecar',
	resolver: 'Build Finished',
	args: ['build'],
};

export const config = {
	polkadot: {
		wsUrl: 'wss://rpc.polkadot.io',
		JestProcOpts: {
			process: 'jest',
			resolver: 'PASS',
			args: ['test:e2e-tests', '--chain', 'polkadot'],
		},
		SasStartOpts: defaultSasStartOpts,
	},
	kusama: {
		wsUrl: 'wss://kusama-rpc.polkadot.io',
		JestProcOpts: {
			process: 'jest',
			resolver: 'PASS',
			args: ['test:e2e-tests', '--chain', 'kusama'],
		},
		SasStartOpts: defaultSasStartOpts,
	},
	westend: {
		wsUrl: 'wss://westend-rpc.polkadot.io',
		JestProcOpts: {
			process: 'jest',
			resolver: 'PASS',
			args: ['test:e2e-tests', '--chain', 'westend'],
		},
		SasStartOpts: defaultSasStartOpts,
	},
};
