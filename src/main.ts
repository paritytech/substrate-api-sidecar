import * as express from 'express';
import { Request, Response } from 'express';
import { ApiPromise } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces/rpc';
import { HttpProvider, WsProvider } from '@polkadot/rpc-provider';

const HOST = process.env.BIND_HOST || '127.0.0.1';
const PORT = Number(process.env.BIND_PORT) || 8080;
const WS_URL = process.env.NODE_WS_URL || 'ws://127.0.0.1:9944';

async function main() {
	const api = await ApiPromise.create({ provider: new WsProvider(WS_URL) });
	const app = express();

	async function fetchBlock(hash: BlockHash, req: Request, res: Response) {
		const { block } = await api.rpc.chain.getBlock(hash);
		const { parentHash, number, stateRoot, extrinsicsRoot } = block.header;

		// console.log(Object.keys(block.header.digest.logs[0]));

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

	app.get('/', (req, res) => res.send('Proxy is running, go to /block to get latest finalized block'))
	app.get('/block/:number', async (req, res) => {
		const number = Number(req.params.number) || 0;
		const hash = await api.rpc.chain.getBlockHash(number);

		await fetchBlock(hash, req, res);
	})
	app.get('/block/', async (req, res) => {
		const hash = await api.rpc.chain.getFinalizedHead();

		await fetchBlock(hash, req, res);
	})

	app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}/`))
}

main();