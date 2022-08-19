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

import { IChainConfig } from './types';

const defaultJestOpts = {
	proc: 'jest',
	resolver: 'PASS',
	resolverJestErr: 'FAIL',
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
		wsUrl: 'wss://rpc.polkadot.io',
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
