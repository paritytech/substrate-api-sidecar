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
import * as bodyParser from 'body-parser';

import App from './App';
import Config, { SidecarConfig } from './config_setup';
import BalanceController from './controllers/BalanceController';
import BlocksController from './controllers/BlockController';
import ClaimsController from './controllers/ClaimsController';
import MetadataController from './controllers/MetadataController';
import StakingController from './controllers/StakingController';
import StakingInfoController from './controllers/StakingInfoController';
import TxArtifactsController from './controllers/TxArtifactsController';
import TxFeeEstimateController from './controllers/TxFeeEstimateController';
import TxSubmitController from './controllers/TxSubmitController';
import VestingController from './controllers/VestingController';
import {
	errorMiddleware,
	httpErrorMiddleware,
	internalErrorMiddleware,
	legacyErrorMiddleware,
	txErrorMiddleware,
} from './middleware/error_middleware';
import {
	developmentLoggerMiddleware,
	productionLoggerMiddleware,
} from './middleware/logger_middleware';
import sanitizedSendMiddleware from './middleware/sanitizeResMiddleware';

async function main() {
	const configOrNull = Config.GetConfig();

	if (!configOrNull) {
		console.log('Your config is NOT valid, exiting');
		process.exit(1);
	}

	const config: SidecarConfig = configOrNull;

	console.log(`Connecting to ${config.NAME} at ${config.WS_URL}`);

	// Instantiate a web socket connection to the node for basic polkadot-js use
	const api = await ApiPromise.create({
		provider: new WsProvider(config.WS_URL),
		types: config.CUSTOM_TYPES,
	});

	// Create our array of middleware that is to be mounted before the routes
	const preMiddleware = [bodyParser.json(), sanitizedSendMiddleware];
	if (config.LOG_MODE === 'errors') {
		preMiddleware.push(productionLoggerMiddleware);
	} else if (config.LOG_MODE === 'all') {
		preMiddleware.push(developmentLoggerMiddleware);
	}

	// Instantiate controller class instances
	const blocksController = new BlocksController(api);
	const balanceController = new BalanceController(api);
	const stakingInfoController = new StakingInfoController(api);
	const stakingController = new StakingController(api);
	const vestingController = new VestingController(api);
	const metadataController = new MetadataController(api);
	const claimsController = new ClaimsController(api);
	const txArtifactsController = new TxArtifactsController(api);
	const txFeeEstimateController = new TxFeeEstimateController(api);
	const txSubmitController = new TxSubmitController(api);

	// Create our App
	const app = new App({
		preMiddleware,
		controllers: [
			blocksController,
			balanceController,
			stakingInfoController,
			stakingController,
			vestingController,
			metadataController,
			claimsController,
			txArtifactsController,
			txFeeEstimateController,
			txSubmitController,
		],
		postMiddleware: [
			txErrorMiddleware,
			httpErrorMiddleware,
			errorMiddleware,
			legacyErrorMiddleware,
			internalErrorMiddleware,
		],
		port: config.PORT,
		host: config.HOST,
	});

	// Start the server
	app.listen();
}

main().catch(console.log);
