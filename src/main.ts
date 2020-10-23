#!/usr/bin/env node
// Copyright 2017-2020 Parity Technologies (UK) Ltd.
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

import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { json } from 'express';

import App from './App';
import { Config } from './Config';
import * as controllers from './controllers';
import { consoleOverride } from './logging/consoleOverride';
import { Log } from './logging/Log';
import * as middleware from './middleware';

async function main() {
	const { config } = Config;

	const { logger } = Log;

	/**
	 * Best effort list of known public nodes that do not encourage high traffic
	 * sidecar installations connecting to them for non - testing / development purposes.
	 */
	const publicWsUrls: string[] = [
		'wss://rpc.polkadot.io',
		'wss://cc1-1.polkadot.network',
		'wss://kusama-rpc.polkadot.io',
		'wss://cc3-5.kusama.network',
		'wss://fullnode.centrifuge.io',
		'wss://crab.darwinia.network',
		'wss://mainnet-node.dock.io',
		'wss://mainnet1.edgewa.re',
		'wss://rpc.kulupu.corepaper.org/ws',
		'wss://main1.nodleprotocol.io',
		'wss://rpc.plasmnet.io/',
		'wss://mainnet-rpc.stafi.io',
		'wss://rpc.subsocial.network',
	];

	// Overide console.{log, error, warn, etc}
	consoleOverride(logger);

	// Instantiate a web socket connection to the node for basic polkadot-js use
	const api = await ApiPromise.create({
		provider: new WsProvider(config.SUBSTRATE.WS_URL),
		types: {
			...config.SUBSTRATE.CUSTOM_TYPES,
		},
	});

	// Gather some basic details about the node so we can display a nice message
	const [chainName, { implName }] = await Promise.all([
		api.rpc.system.chain(),
		api.rpc.state.getRuntimeVersion(),
	]);

	logger.info(
		`Connected to chain ${chainName.toString()} on the ${implName.toString()} client at ${
			config.SUBSTRATE.WS_URL
		}`
	);

	const isPublicUrl: boolean = publicWsUrls.includes(config.SUBSTRATE.WS_URL);

	if (isPublicUrl) {
		logger.info(
			`${config.SUBSTRATE.WS_URL} is a public node. Too many users will overload this public endpoint. Switch to a privately hosted node when possible.`
		);
	}

	// Split the Url to check for 2 things. Secure connection, and if its a local IP.
	const splitUrl: string[] = config.SUBSTRATE.WS_URL.split(':');
	// If its 'ws' its not a secure connection.
	const isSecure: boolean = splitUrl[0] === 'wss';
	// Check if its a local IP.
	const isLocal: boolean =
		splitUrl[1] === '//0.0.0.0' ||
		splitUrl[1] === '//127.0.0.1' ||
		splitUrl[1] === '//localhost';

	if (!isSecure && !isLocal) {
		logger.warn(
			`Using unencrypted connection to a public node (${config.SUBSTRATE.WS_URL}); All traffic is sent over the internet in cleartext.`
		);
	}

	// Create our App
	const app = new App({
		preMiddleware: [json(), middleware.httpLoggerCreate(logger)],
		controllers: [
			new controllers.Blocks(api),
			new controllers.AccountsStakingPayouts(api),
			new controllers.AccountsBalanceInfo(api),
			new controllers.AccountsStakingInfo(api),
			new controllers.AccountsVestingInfo(api),
			new controllers.NodeNetwork(api),
			new controllers.NodeVersion(api),
			new controllers.NodeTransactionPool(api),
			new controllers.RuntimeCode(api),
			new controllers.RuntimeSpec(api),
			new controllers.RuntimeMetadata(api),
			new controllers.TransactionDryRun(api),
			new controllers.TransactionMaterial(api),
			new controllers.TransactionFeeEstimate(api),
			new controllers.TransactionSubmit(api),
			new controllers.palletsStakingProgress(api),
			new controllers.palletsStorageItem(api),
		],
		postMiddleware: [
			middleware.txError,
			middleware.httpError,
			middleware.error,
			middleware.legacyError,
			middleware.internalError,
		],
		port: config.EXPRESS.PORT,
		host: config.EXPRESS.HOST,
	});

	// Start the server
	app.listen();
}

process.on('SIGINT', function () {
	console.log('Caught interrupt signal, exiting...');
	process.exit(0);
});
main().catch(console.log);
