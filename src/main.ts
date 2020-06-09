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

import * as express from 'express';
import * as bodyParser from 'body-parser';
import { ApiPromise } from '@polkadot/api';
import { WsProvider } from '@polkadot/rpc-provider';
import { parseNumber, sanitizeNumbers } from './utils';
import ApiHandler from './ApiHandler';

const HOST = process.env.BIND_HOST || '127.0.0.1';
const PORT = Number(process.env.BIND_PORT) || 8080;
const WS_URL = process.env.NODE_WS_URL || 'ws://127.0.0.1:9944';

type Params = { [key: string]: string };

async function main() {
	const api = await ApiPromise.create({ provider: new WsProvider(WS_URL) });
	const handler = new ApiHandler(api);
	const app = express();

	app.use(bodyParser.json());

	function get(path: string, cb: (params: Params) => Promise<any>) {
		app.get(path, async (req, res) => {
			try {
				res.send(sanitizeNumbers(await cb(req.params)));
			} catch(err) {
				if (err && typeof err.error === 'string') {
					res.status(500).send(sanitizeNumbers(err));
					return;
				}

				console.error('Internal Error:', err);

				res.status(500).send({ error: 'Interal Error' });
			}
		});
	}


	function post(path: string, cb: (params: Params, body: any) => Promise<any>) {
		app.post(path, async (req, res) => {
			try {
				res.send(sanitizeNumbers(await cb(req.params, req.body)));
			} catch(err) {
				if (err && typeof err.error === 'string') {
					res.status(500).send(sanitizeNumbers(err));
					return;
				}

				console.error('Internal Error:', err);

				res.status(500).send({ error: 'Interal Error' });
			}
		});
	}

	get('/', async (req) => 'Sidecar is running, go to /block to get latest finalized block');

	get('/block/:number', async (params) => {
		const number = parseNumber(params.number);
		const hash = await api.rpc.chain.getBlockHash(number);

		return await handler.fetchBlock(hash);
	});

	get('/block/', async () => {
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchBlock(hash);
	});

	get('/balance/:address', async (params) => {
		const { address } = params;
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchBalance(hash, address);
	});

	get('/balance/:address/:number', async (params) => {
		const { address } = params;
		const number = parseNumber(params.number);
		const hash = await api.rpc.chain.getBlockHash(number);

		return await handler.fetchBalance(hash, address);
	});

	get('/payout/:address', async (params) => {
		const { address } = params;
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchPayoutInfo(hash, address);
	});

	get('/payout/:address/:number', async (params) => {
		const { address } = params;
		const number = parseNumber(params.number);
		const hash = await api.rpc.chain.getBlockHash(number);

		return await handler.fetchPayoutInfo(hash, address);
	});

	get('/staking/:address', async (params) => {
		const { address } = params;
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchStakingLedger(hash, address);
	});

	get('/staking/:address/:number', async (params) => {
		const { address } = params;
		const number = parseNumber(params.number);
		const hash = await api.rpc.chain.getBlockHash(number);

		return await handler.fetchStakingLedger(hash, address);
	});

	get('/vesting/:address', async (params) => {
		const { address } = params;
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchVesting(hash, address);
	});

	get('/vesting/:address/:number', async (params) => {
		const { address } = params;
		const number = parseNumber(params.number);
		const hash = await api.rpc.chain.getBlockHash(number);

		return await handler.fetchVesting(hash, address);
	});

	get('/metadata/', async () => {
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchMetadata(hash);
	});

	get('/metadata/:number', async (params) => {
		const number = parseNumber(params.number);
		const hash = await api.rpc.chain.getBlockHash(number);

		return await handler.fetchMetadata(hash);
	});

	get('/claims/:ethAddress', async (params) => {
		const { ethAddress } = params;
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchClaimsInfo(hash, ethAddress);
	});

	get('/claims/:ethAddress/:number', async (params) => {
		const { ethAddress } = params;
		const number = parseNumber(params.number);
		const hash = await api.rpc.chain.getBlockHash(number);

		return await handler.fetchClaimsInfo(hash, ethAddress);
	});

	get('/tx/artifacts', async () => {
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchTxArtifacts(hash);
	});

	get('/tx/artifacts/:number', async (params) => {
		const number = parseNumber(params.number);
		const hash = await api.rpc.chain.getBlockHash(number);

		return await handler.fetchTxArtifacts(hash);
	});

	post('/tx/fee-estimate/', async (_, body) => {
		if(body && typeof body.tx !== 'string'){
			return {
				error: "Missing field `tx` on request body.",
			};
		}

		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchFeeInformation(hash, body.tx);
	});

	post('/tx/', async (_, body) => {
		if (body && typeof body.tx !== 'string') {
			return {
				error: "Missing field `tx` on request body.",
			};
		}

		return await handler.submitTx(body.tx);
	});


	app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}/`))
}

main();
