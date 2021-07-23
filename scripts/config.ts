import { IChainConfig } from './types';

const defaultSasStartOpts = {
	proc: 'sidecar',
	resolver: 'Check the root endpoint',
	resolverStartupErr: 'error: uncaughtException: listen EADDRINUSE:',
	args: ['start'],
};

const defaultJestOpts = {
	proc: 'jest',
	resolver: 'PASS',
};

export const defaultSasBuildOpts = {
	proc: 'sidecar',
	resolver: 'Build Finished',
	args: ['build'],
};

export const config: Record<string, IChainConfig> = {
	polkadot: {
		wsUrl: 'wss://rpc.polkadot.io',
		JestProcOpts: {
			...defaultJestOpts,
			args: ['test:e2e-tests', '--chain', 'polkadot'],
		},
		SasStartOpts: defaultSasStartOpts,
	},
	kusama: {
		wsUrl: 'wss://kusama-rpc.polkadot.io',
		JestProcOpts: {
			...defaultJestOpts,
			args: ['test:e2e-tests', '--chain', 'kusama'],
		},
		SasStartOpts: defaultSasStartOpts,
	},
	westend: {
		wsUrl: 'wss://westend-rpc.polkadot.io',
		JestProcOpts: {
			...defaultJestOpts,
			args: ['test:e2e-tests', '--chain', 'westend'],
		},
		SasStartOpts: defaultSasStartOpts,
	},
};
