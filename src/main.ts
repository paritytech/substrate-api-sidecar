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

	app.get('/', (req, res) => res.send('Proxy is running, go to /block to get latest finalized block'))
	app.get('/block/:number', async (req, res) => {
		const number = Number(req.params.number) || 0;
		const hash = await api.rpc.chain.getBlockHash(number);

		await fetchBlock(hash, req, res).catch(handleError(res));
	})
	app.get('/block/', async (req, res) => {
		const hash = await api.rpc.chain.getFinalizedHead();

		await fetchBlock(hash, req, res).catch(handleError(res));
	})
	app.get('/balance/:address', async (req, res) => {
		const { address } = req.params;
		const hash = await api.rpc.chain.getFinalizedHead();

		await fetchBalance(hash, address, req, res).catch(handleError(res));
	})
	app.get('/balance/:address/:number', async (req, res) => {
		const { address } = req.params;
		const number = Number(req.params.number) || 0;
		const hash = await api.rpc.chain.getBlockHash(number);

		await fetchBalance(hash, address, req, res).catch(handleError(res));
	})

	app.listen(PORT, HOST, () => console.log(`Running on http://${HOST}:${PORT}/`))
}

main();