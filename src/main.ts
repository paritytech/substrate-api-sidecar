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
import { RequestHandler } from 'express';

import App from './App';
import Config, { ISidecarConfig } from './Config';
import * as controllers from './controllers';
import * as middleware from './middleware';

async function main() {
	const configOrNull = Config.GetConfig();

	if (!configOrNull) {
		console.log('Your config is NOT valid, exiting');
		process.exit(1);
	}

	const config: ISidecarConfig = configOrNull;

	// Instantiate a web socket connection to the node for basic polkadot-js use
	const api = await ApiPromise.create({
		provider: new WsProvider(config.WS_URL),
		types: config.CUSTOM_TYPES,
	});

	const [chainName, { implName }] = await Promise.all([
		await api.rpc.system.chain(),
		await api.rpc.state.getRuntimeVersion(),
	]);

	console.log(
		`Connected to chain ${chainName.toString()} on the ${implName.toString()} client at ${
			config.WS_URL
		}`
	);

	// Create array of middleware that is to be mounted before the routes
	const preMiddleware: RequestHandler[] = [bodyParser.json()];
	if (config.LOG_MODE === 'errors') {
		preMiddleware.push(middleware.errorLogger);
	} else if (config.LOG_MODE === 'all') {
		preMiddleware.push(middleware.allLogger);
	}

	// Instantiate controller class instances
	const accountsStakingPayoutsController = new controllers.AccountsStakingPayouts(
		api
	);
	const blocksController = new controllers.Blocks(api);
	const balancesController = new controllers.AccountsBalanceInfo(api);
	const stakingInfoController = new controllers.AccountsStakingInfo(api);
	const stakingController = new controllers.PalletsStakingProgress(api);
	const vestingController = new controllers.AccountsVestingInfo(api);
	const metadataController = new controllers.Metadata(api);
	const claimsController = new controllers.Claims(api);
	const txArtifactsController = new controllers.TransactionMaterial(api);
	const txFeeEstimateController = new controllers.TransactionFeeEstimate(api);
	const txSubmitController = new controllers.TransactionSubmit(api);

	// Create our App
	const app = new App({
		preMiddleware,
		controllers: [
			accountsStakingPayoutsController,
			blocksController,
			balancesController,
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
			middleware.txError,
			middleware.httpError,
			middleware.error,
			middleware.legacyError,
			middleware.internalError,
		],
		port: config.PORT,
		host: config.HOST,
	});

	// Start the server
	app.listen();
}

process.on('SIGINT', function () {
	console.log('Caught interrupt signal, exiting...');
	process.exit(0);
});
main().catch(console.log);
