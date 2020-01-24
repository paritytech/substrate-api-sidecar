// Copyright 2017-2020 Parity Technologies (UK) Ltd.
// This file is part of Substrate RPC Proxy.
//
// Substrate RPC Proxy is free software: you can redistribute it and/or modify
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
import { GenericAccountId } from '@polkadot/types/primitive';
import { BlockHash } from '@polkadot/types/interfaces/rpc';
import { HttpProvider, WsProvider } from '@polkadot/rpc-provider';

const HOST = process.env.BIND_HOST || '127.0.0.1';
const PORT = Number(process.env.BIND_PORT) || 8080;
const WS_URL = process.env.NODE_WS_URL || 'ws://127.0.0.1:9944';

async function main() {
	const api = await ApiPromise.create({ provider: new WsProvider(WS_URL) });
	const app = express();

	function handleError(res: Response): (err: any) => void {
		return (err) => {
			console.error('Internal Error:', err);

			res.status(500).send({ error: 'Interal Error' });
		}
	}

	async function fetchBlock(hash: BlockHash, req: Request, res: Response) {
		const { block } = await api.rpc.chain.getBlock(hash);
		const { parentHash, number, stateRoot, extrinsicsRoot } = block.header;

		const logs = block.header.digest.logs.map((log) => {
			const { type, index, value } = log;

			return { type, index, value };
		});
		const extrinsics = block.extrinsics.map((extrinsic) => {
			const { method, nonce, signature, signer, isSigned, args } = extrinsic;

			return {
				method: `${method.sectionName}.${method.methodName}`,
				signature: isSigned ? { signature, signer } : null,
				nonce,
				args,
			};
		});

		res.send({
			number,
			hash,
			parentHash,
			stateRoot,
			extrinsicsRoot,
			logs,
			extrinsics,
		});
	}

	async function fetchBalance(hash: BlockHash, address: string, req: Request, res: Response) {
		const [header, free, reserved, locks] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.balances.freeBalance.at(hash, address),
			api.query.balances.reservedBalance.at(hash, address),
			api.query.balances.locks.at(hash, address),
		]);

		const at = {
			hash,
			height: header.number,
		};

		res.send({ at, free, reserved, locks });
	}

	app.get('/', (req, res) => res.send('Proxy is running, go to /block to get latest finalized block'));
	app.get('/block/:number', async (req, res) => {
		const number = Number(req.params.number) || 0;
		const hash = await api.rpc.chain.getBlockHash(number);

		await fetchBlock(hash, req, res).catch(handleError(res));
	});
	app.get('/block/', async (req, res) => {
		const hash = await api.rpc.chain.getFinalizedHead();

		await fetchBlock(hash, req, res).catch(handleError(res));
	});
	app.get('/balance/:address', async (req, res) => {
		const { address } = req.params;
		const hash = await api.rpc.chain.getFinalizedHead();

		await fetchBalance(hash, address, req, res).catch(handleError(res));
	});
	app.get('/balance/:address/:number', async (req, res) => {
		const { address } = req.params;
		const number = Number(req.params.number) || 0;
		const hash = await api.rpc.chain.getBlockHash(number);

		await fetchBalance(hash, address, req, res).catch(handleError(res));
	});

	app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}/`))
}

main();