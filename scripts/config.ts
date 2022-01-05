import { IChainConfig } from './types';

const defaultJestOpts = {
	proc: 'jest',
	resolver: 'PASS',
};

export const defaultSasStartOpts = {
	proc: 'sidecar',
	resolver: 'Check the root endpoint',
	resolverStartupErr: 'error: uncaughtException: listen EADDRINUSE:',
	args: ['start'],
};

export const defaultSasBuildOpts = {
	proc: 'sidecar',
	resolver: 'Build Finished',
	args: ['build'],
};

export const defaultSasPackOpts = {
	proc: 'sidecar-pack',
	resolver: 'YN0000: Done in',
	args: ['pack'],
};

export const config: Record<string, IChainConfig> = {
	polkadot: {
		wsUrl: 'wss://polkadot.api.onfinality.io/public-ws',
		JestProcOpts: {
			...defaultJestOpts,
			args: ['test:e2e-tests', '--chain', 'polkadot'],
		},
		SasStartOpts: defaultSasStartOpts,
	},
	kusama: {
		wsUrl: 'wss://kusama.api.onfinality.io/public-ws',
		JestProcOpts: {
			...defaultJestOpts,
			args: ['test:e2e-tests', '--chain', 'kusama'],
		},
		SasStartOpts: defaultSasStartOpts,
	},
	westend: {
		wsUrl: 'wss://westend.api.onfinality.io/public-ws',
		JestProcOpts: {
			...defaultJestOpts,
			args: ['test:e2e-tests', '--chain', 'westend'],
		},
		SasStartOpts: defaultSasStartOpts,
	},
	statemine: {
		wsUrl: 'wss://statemine.api.onfinality.io/public-ws',
		JestProcOpts: {
			...defaultJestOpts,
			args: ['test:e2e-tests', '--chain', 'statemine'],
		},
		SasStartOpts: defaultSasStartOpts,
	},
	statemint: {
		wsUrl: 'wss://statemint-rpc.polkadot.io',
		JestProcOpts: {
			...defaultJestOpts,
			args: ['test:e2e-tests', '--chain', 'statemint'],
		},
		SasStartOpts: defaultSasStartOpts
	}
};
