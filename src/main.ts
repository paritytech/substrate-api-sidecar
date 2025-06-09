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
import { ApiPromiseRegistry } from './apiRegistry';
import App from './App';
import { getControllers } from './chains-config';
import { assetHubSpecNames } from './chains-config';
import { consoleOverride } from './logging/consoleOverride';
import { Log } from './logging/Log';
import { MetricsApp } from './metrics/index';
import * as middleware from './middleware';
import { parseArgs } from './parseArgs';
import { SidecarConfig } from './SidecarConfig';

/*
 * initApis function prepares the API registry and initializes the API
 * it returns the specName of the main API to be used by sidecar
 */
async function initApis(): Promise<string> {
	const { config } = SidecarConfig;
	const { logger } = Log;

	logger.info('Initializing APIs');

	const requiredApis: {
		url: string;
		type?: 'relay' | 'assethub' | 'parachain';
	}[] = [
		{ url: config.SUBSTRATE.URL },
		...config.SUBSTRATE.MULTI_CHAIN_URL.map((chain) => ({ url: chain.url, type: chain.type })),
	].filter((apiOption) => !!apiOption.url);

	// Create the API registry
	const apis = await Promise.all(
		requiredApis.map((apiUrl) => ApiPromiseRegistry.initApi(apiUrl.url, apiUrl.type || undefined)),
	);

	for (const api of apis) {
		await api.isReady;
	}

	const specNames = [];

	let isAssetHub = false;
	let isAssetHubMigrated = false;
	for (let i = 0; i < apis.length; i++) {
		if (!apis[i]) {
			logger.error('Failed to create API instance');
		}
		const api = apis[i];
		// Gather some basic details about the node so we can display a nice message
		const [chainName, { implName, specName }] = await Promise.all([
			api.rpc.system.chain(),
			api.rpc.state.getRuntimeVersion(),
		]);

		// This is assuming that the first requiredApi will be SUBSTRATE.URL
		if (i === 0 && assetHubSpecNames.has(specName.toString().toLowerCase())) {
			isAssetHub = true;

			let stage;
			if (api.query.ahMigrator) {
				stage = await api.query.ahMigrator.ahMigrationStage();
			}

			if (stage && (stage as unknown as { isMigrationDone: boolean }).isMigrationDone) {
				isAssetHubMigrated = true;
			}

			ApiPromiseRegistry.setAssetHubInfo({ isAssetHub, isAssetHubMigrated });
		}

		startUpPrompt(requiredApis[i].url, chainName.toString(), implName.toString());
		specNames.push(specName.toString());
	}

	logger.info('All APIs initialized');
	return specNames[0];
}

async function main() {
	const { config } = SidecarConfig;
	const { logger } = Log;
	// Overide console.{log, error, warn, etc}
	consoleOverride(logger);

	logger.info(`Version: ${packageJSON.version}`);

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

	const specNames = await initApis();

	const pallets = [];

	if (config.EXPRESS.INJECTED_CONTROLLERS) {
		// Get the pallets from the API
		const api = ApiPromiseRegistry.getApi(specNames);
		if (api) {
			const chainPallets = (api.registry.metadata.toJSON().pallets as unknown as Record<string, unknown>[]).map(
				(p) => p.name as string,
			);

			pallets.push(...chainPallets);
		}
	}

	const app = new App({
		preMiddleware: preMiddlewares,
		controllers: getControllers(config, specNames, pallets),
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
	// TODO: disconnnect all APIs
	process.exit(0);
});

const args = parseArgs();

if (args.version) {
	console.log(`@substrate/api-sidecar v${packageJSON.version}`);
	process.exit(0);
} else {
	main().catch(console.log);
}
