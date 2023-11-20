#!/usr/bin/env node

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

// Introduced via `@polkadot/api v7.0.1`.
import '@polkadot/api-augment';

import { ApiPromise } from '@polkadot/api';
import { HttpProvider, WsProvider } from '@polkadot/rpc-provider';
import { OverrideBundleType, RegistryTypes } from '@polkadot/types/types';
import { json } from 'express';

import packageJSON from '../package.json';
import App from './App';
import { getControllersForSpec } from './chains-config';
import { consoleOverride } from './logging/consoleOverride';
import { Log } from './logging/Log';
import * as middleware from './middleware';
import tempTypesBundle from './override-types/typesBundle';
import { parseArgs } from './parseArgs';
import { SidecarConfig } from './SidecarConfig';
import Metrics_App from './util/metrics';

async function main() {
	const { config } = SidecarConfig;
	const { logger } = Log;
	// Overide console.{log, error, warn, etc}
	consoleOverride(logger);

	logger.info(`Version: ${packageJSON.version}`);

	const { TYPES_BUNDLE, TYPES_SPEC, TYPES_CHAIN, TYPES } = config.SUBSTRATE;
	// Instantiate a web socket connection to the node and load types
	const api = await ApiPromise.create({
		provider: config.SUBSTRATE.URL.startsWith('http')
			? new HttpProvider(config.SUBSTRATE.URL)
			: new WsProvider(config.SUBSTRATE.URL),
		/* eslint-disable @typescript-eslint/no-var-requires */
		typesBundle: TYPES_BUNDLE ? (require(TYPES_BUNDLE) as OverrideBundleType) : (tempTypesBundle as OverrideBundleType),
		typesChain: TYPES_CHAIN ? (require(TYPES_CHAIN) as Record<string, RegistryTypes>) : undefined,
		typesSpec: TYPES_SPEC ? (require(TYPES_SPEC) as Record<string, RegistryTypes>) : undefined,
		types: TYPES ? (require(TYPES) as RegistryTypes) : undefined,
		/* eslint-enable @typescript-eslint/no-var-requires */
	});

	// Gather some basic details about the node so we can display a nice message
	const [chainName, { implName, specName }] = await Promise.all([
		api.rpc.system.chain(),
		api.rpc.state.getRuntimeVersion(),
	]);

	startUpPrompt(config.SUBSTRATE.URL, chainName.toString(), implName.toString());

	// Create our App
	const app = new App({
		preMiddleware: [json(), middleware.httpLoggerCreate(logger)],
		controllers: getControllersForSpec(api, specName.toString()),
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

	if (args.prometheus) {
		// Create Metrics App
		const metricsApp = new Metrics_App({
			port: 9100,
			host: config.EXPRESS.HOST,
		});
		// Start the Metrics server
		metricsApp.listen();
	}
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
