#!/usr/bin/env node

// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

// Introduced via `@polkadot/api v7.0.1`.
import '@polkadot/api-augment';

import { json } from 'express';

import packageJSON from '../package.json';
import { ApiPromiseRegistry } from './apiRegistry/index.ts';
import App from './App';
import { getControllers } from './chains-config';
import { consoleOverride } from './logging/consoleOverride';
import { Log } from './logging/Log';
import { MetricsApp } from './metrics/index';
import * as middleware from './middleware';
import { parseArgs } from './parseArgs';
import { SidecarConfig } from './SidecarConfig';

async function main() {
	const { config } = SidecarConfig;
	const { logger } = Log;
	// Overide console.{log, error, warn, etc}
	consoleOverride(logger);

	logger.info(`Version: ${packageJSON.version}`);

	const api = await ApiPromiseRegistry.getInstance(config.SUBSTRATE.URL);

	// Gather some basic details about the node so we can display a nice message
	const [chainName, { implName, specName }] = await Promise.all([
		api.rpc.system.chain(),
		api.rpc.state.getRuntimeVersion(),
	]);
	// Establish a second connection to the node
	// For now, multi chain support is only for Asset hub.

	// TODO: instantiate the multichain connection in APIPromiseRegistry

	// let multiChainApi: ApiPromise | undefined;
	// // TODO: If the chain is assethub and the multichain url is not there, give a warning.
	// if (config.SUBSTRATE.MULTI_CHAIN_URL && assetHubSpecNames.has(specName.toString().toLowerCase())) {
	// 	multiChainApi = await ApiPromise.create({
	// 		provider: config.SUBSTRATE.MULTI_CHAIN_URL.startsWith('http')
	// 			? new HttpProvider(config.SUBSTRATE.MULTI_CHAIN_URL, undefined, CACHE_CAPACITY || 0)
	// 			: new WsProvider(config.SUBSTRATE.MULTI_CHAIN_URL, undefined, undefined, undefined, CACHE_CAPACITY || 0),
	// 	});
	// }

	startUpPrompt(config.SUBSTRATE.URL, chainName.toString(), implName.toString());

	const preMiddlewares = [json({ limit: config.EXPRESS.MAX_BODY }), middleware.httpLoggerCreate(logger)];

	if (config.METRICS.ENABLED) {
		// Create Metrics App
		const metricsApp = new MetricsApp({
			port: config.METRICS.PROM_PORT,
			host: config.METRICS.PROM_HOST,
		});

		// Generate metrics middleware
		preMiddlewares.push(metricsApp.preMiddleware());
		// Start the Metrics server
		metricsApp.listen();
	}

	const app = new App({
		preMiddleware: preMiddlewares,
		controllers: getControllers(api, config, specName.toString()),
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
	const server = app.listen();

	server.keepAliveTimeout = config.EXPRESS.KEEP_ALIVE_TIMEOUT;
	server.headersTimeout = config.EXPRESS.KEEP_ALIVE_TIMEOUT + 5000;
}

/**
 * Prompt the user with some basic info about the node and the network they have
 * connected Sidecar to.
 *
 * @param url Url of the node Sidecar is connected to, can be a websocket or http address
 * @param chainName chain name of the network Sidecar is connected to
 * @param implName implementation name of the node Sidecar is connected to
 */
function startUpPrompt(url: string, chainName: string, implName: string) {
	const { logger } = Log;

	logger.info(`Connected to chain ${chainName} on the ${implName} client at ${url}`);

	// Split the Url to check for 2 things. Secure connection, and if its a local IP.
	const splitUrl: string[] = url.split(':');
	// If its 'ws' its not a secure connection.
	const isSecure: boolean = splitUrl[0] === 'wss' || splitUrl[0] === 'https';
	// Check if its a local IP.
	const isLocal: boolean = splitUrl[1] === '//127.0.0.1' || splitUrl[1] === '//localhost';

	if (!isSecure && !isLocal) {
		logger.warn(
			`Using unencrypted connection to a public node (${url}); All traffic is sent over the internet in cleartext.`,
		);
	}
}

process.on('SIGINT', function () {
	console.log('Caught interrupt signal, exiting...');
	process.exit(0);
});

const args = parseArgs();

if (args.version) {
	console.log(`@substrate/api-sidecar v${packageJSON.version}`);
	process.exit(0);
} else {
	main().catch(console.log);
}
