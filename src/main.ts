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

	async function getBlock(hash: BlockHash, req: Request, res: Response) {
		const { block } = await api.rpc.chain.getBlock(hash);
		const { parentHash, number, stateRoot, extrinsicsRoot } = block.header;

		// console.log(block.toJSON());

		const logs = block.header.digest.logs.map(log => log.type);
		const extrinsics = block.extrinsics.map(extrinsic => ({
			method: `${extrinsic.method.sectionName}.${extrinsic.method.methodName}`,
			args: extrinsic.args.map(arg => arg.toJSON()),
		}));

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

		await getBlock(hash, req, res);
	})
	app.get('/block/', async (req, res) => {
		const hash = await api.rpc.chain.getFinalizedHead();

		await getBlock(hash, req, res);
	})

	app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}/`))
}

main();