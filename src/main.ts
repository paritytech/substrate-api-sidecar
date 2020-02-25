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
import { Request, Response } from 'express';
import { ApiPromise } from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces/rpc';
import { HttpProvider, WsProvider } from '@polkadot/rpc-provider';
import ApiHandler from './ApiHandler';

const HOST = process.env.BIND_HOST || '127.0.0.1';
const PORT = Number(process.env.BIND_PORT) || 8080;
const WS_URL = process.env.NODE_WS_URL || 'ws://127.0.0.1:9944';

type Params = { [key: string]: string };

async function main() {
	const api = await ApiPromise.create({ provider: new WsProvider(WS_URL) });
	const handler = new ApiHandler(api);
	const app = express();

	function get(path: string, cb: (params: Params) => Promise<any>) {
		app.get(path, async (req, res) => {
			try {
				res.send(await cb(req.params));
			} catch(err) {
				console.error('Internal Error:', err);

				res.status(500).send({ error: 'Interal Error' });
			}
		});
	}

	get('/', async (req) => 'Sidecar is running, go to /block to get latest finalized block');

	get('/block/:number', async (params) => {
		const number = Number(params.number) || 0;
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
		const number = Number(params.number) || 0;
		const hash = await api.rpc.chain.getBlockHash(number);

		return await handler.fetchBalance(hash, address);
	});

	app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}/`))
}

main();