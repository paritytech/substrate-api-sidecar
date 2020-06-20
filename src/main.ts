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
import type { BlockHash } from '@polkadot/types/interfaces';
import { isHex } from '@polkadot/util';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as morgan from 'morgan';

import ApiHandler from './ApiHandler';
import { parseBlockNumber, sanitizeNumbers } from './utils';

const HOST = process.env.BIND_HOST || '127.0.0.1';
const PORT = Number(process.env.BIND_PORT) || 8080;
const WS_URL = process.env.NODE_WS_URL || 'ws://127.0.0.1:9944';
const LOG_MODE = process.env.LOG_MODE || 'errors';

type Params = { [key: string]: string };

async function main() {
	const api = await ApiPromise.create({ provider: new WsProvider(WS_URL) });
	const handler = new ApiHandler(api);
	const app = express();

	app.use(bodyParser.json());

	switch (LOG_MODE) {
		case 'errors':
			app.use(
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				morgan('combined', {
					skip: function (_: express.Request, res: express.Response) {
						return res.statusCode < 400; // Only log errors
					},
				})
			);
			break;
		case 'all':
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			app.use(morgan('dev'));
			break;
		default:
			break;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function get(path: string, cb: (params: Params) => Promise<any>) {
		app.get(path, async (req, res) => {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				res.send(sanitizeNumbers(await cb(req.params)));
			} catch (err) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if (err && typeof err.error === 'string') {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					res.status(err.statusCode || 500).send(
						sanitizeNumbers(err)
					);
					return;
				}

				console.error('Internal Error:', err);

				res.status(500).send({ error: 'Internal Error' });
			}
		});
	}

	function post(
		path: string,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		cb: (params: Params, body: any) => Promise<any>
	) {
		app.post(path, async (req, res) => {
			try {
				res.send(sanitizeNumbers(await cb(req.params, req.body)));
			} catch (err) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				if (err && typeof err.error === 'string') {
					res.status(500).send(sanitizeNumbers(err));
					return;
				}

				console.error('Internal Error:', err);

				res.status(500).send({ error: 'Internal Error' });
			}
		});
	}

	get(
		'/',
		// eslint-disable-next-line @typescript-eslint/require-await
		async () =>
			'Sidecar is running, go to /block to get latest finalized block'
	);

	// GET a block.
	//
	// Paths:
	// - (Optional) `number`: Block hash or height at which to query. If not provided, queries
	//   finalized head.
	//
	// Returns:
	// - `number`: Block height.
	// - `hash`: The block's hash.
	// - `parentHash`: The hash of the parent block.
	// - `stateRoot`: The state root after executing this block.
	// - `extrinsicsRoot`: The Merkle root of the extrinsics.
	// - `authorId`: The account ID of the block author (may be undefined for some chains).
	// - `logs`: Array of `DigestItem`s associated with the block.
	// - `onInitialize`: Object with an array of `SanitizedEvent`s that occurred during block
	//   initialization with the `method` and `data` for each.
	// - `extrinsics`: Array of extrinsics (inherents and transactions) within the block. Each
	//   contains:
	//   - `method`: Extrinsic method, `{module}.{function}`.
	//   - `signature`: Object with `signature` and `signer`, or `null` if unsigned.
	//   - `nonce`: Account nonce, if applicable.
	//   - `args`: Array of arguments.
	//   - `tip`: Any tip added to the transaction.
	//   - `hash`: The transaction's hash.
	//   - `info`: `RuntimeDispatchInfo` for the transaction. Includes the `partialFee`.
	//   - `events`: An array of `SanitizedEvent`s that occurred during extrinsic execution.
	//   - `success`: Whether or not the extrinsic succeeded.
	//   - `paysFee`: Whether the extrinsic requires a fee. Careful! This field relates to whether or
	//     not the extrinsic requires a fee if called as a transaction. Block authors could insert
	//     the extrinsic as an inherent in the block and not pay a fee. Always check that `paysFee`
	//     is `true` and that the extrinsic is signed when reconciling old blocks.
	// - `onFinalize`: Object with an array of `SanitizedEvent`s that occurred during block
	//   finalization with the `method` and `data` for each.
	//
	// Note: Block finalization does not correspond to consensus, i.e. whether the block is in the
	// canonical chain. It denotes the finalization of block _construction._
	//
	// Substrate Reference:
	// - `DigestItem`: https://crates.parity.io/sp_runtime/enum.DigestItem.html
	// - `RawEvent`: https://crates.parity.io/frame_system/enum.RawEvent.html
	// - Extrinsics: https://substrate.dev/docs/en/knowledgebase/learn-substrate/extrinsics
	// - `Extrinsic`: https://crates.parity.io/sp_runtime/traits/trait.Extrinsic.html
	// - `OnInitialize`: https://crates.parity.io/frame_support/traits/trait.OnInitialize.html
	// - `OnFinalize`: https://crates.parity.io/frame_support/traits/trait.OnFinalize.html
	get('/block/', async () => {
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchBlock(hash);
	});

	get('/block/:number', async (params) => {
		const hash: BlockHash = await getHashForBlock(api, params.number);
		return await handler.fetchBlock(hash);
	});

	// GET balance information for an address.
	//
	// Paths:
	// - `address`: The address to query.
	// - (Optional) `number`: Block hash or height at which to query. If not provided, queries
	//   finalized head.
	//
	// Returns:
	// - `at`: Block number and hash at which the call was made.
	// - `nonce`: Account nonce.
	// - `free`: Free balance of the account. Not equivalent to _spendable_ balance. This is the only
	//   balance that matters in terms of most operations on tokens.
	// - `reserved`: Reserved balance of the account.
	// - `miscFrozen`: The amount that `free` may not drop below when withdrawing for anything except
	//   transaction fee payment.
	// - `feeFrozen`: The amount that `free` may not drop below when withdrawing specifically for
	//   transaction fee payment.
	// - `locks`: Array of locks on a balance. There can be many of these on an account and they
	//   "overlap", so the same balance is frozen by multiple locks. Contains:
	//   - `id`: An identifier for this lock. Only one lock may be in existence for each identifier.
	//   - `amount`: The amount below which the free balance may not drop with this lock in effect.
	//   - `reasons`: If true, then the lock remains in effect even for payment of transaction fees.
	//
	// Substrate Reference:
	// - FRAME System: https://crates.parity.io/frame_system/index.html
	// - Balances Pallet: https://crates.parity.io/pallet_balances/index.html
	// - `AccountInfo`: https://crates.parity.io/frame_system/struct.AccountInfo.html
	// - `AccountData`: https://crates.parity.io/pallet_balances/struct.AccountData.html
	// - `BalanceLock`: https://crates.parity.io/pallet_balances/struct.BalanceLock.html
	get('/balance/:address', async (params) => {
		const { address } = params;
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchBalance(hash, address);
	});

	get('/balance/:address/:number', async (params) => {
		const { address } = params;
		const hash: BlockHash = await getHashForBlock(api, params.number);

		return await handler.fetchBalance(hash, address);
	});

	// Get generalized staking information.
	//
	// at: {
	// 	blockNumber,
	// 	hash
	// },
	// ValidatorCount: number, // of validators in the set
	// ActiveEra: number, // ActiveEra.index
	// ForceEra: enum, // status of era forcing
	// NextEra: number, // block number or unix time of next era
	// NextSession: number, // block number or unix time of next session
	// UnappliedSlashes: Vec < UnnappliedSlash >, // array of upcoming slashes, keyed by era
	// QueuedElected: Option < ElectionResult >, // contains an array of stashes elected
	// ElectionStatus: {
	// 	status,
	// 	toggle
	// },
	get('/staking', async (_) => {
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchStakingInfo(hash);
	});

	get('/staking/:number', async (params) => {
		const hash: BlockHash = await getHashForBlock(api, params.number);

		return await handler.fetchStakingInfo(hash);
	});

	// GET staking information for an address.
	//
	// Paths:
	// - `address`: The _Stash_ address for staking.
	// - (Optional) `number`: Block hash or height at which to query. If not provided, queries
	//   finalized head.
	//
	// Returns:
	// - `at`: Block number and hash at which the call was made.
	// - `rewardDestination`: The account to which rewards will be paid. Can be 'Staked' (Stash
	//   account, adding to the amount at stake), 'Stash' (Stash address, not adding to the amount at
	//   stake), or 'Controller' (Controller address).
	// - `controller`: Controller address for the given Stash.
	// - `numSlashingSpans`: Number of slashing spans on Stash account; `null` if provided address is
	//    not a Controller.
	// - `staking`: The staking ledger. Empty object if provided address is not a Controller.
	//   - `stash`: The stash account whose balance is actually locked and at stake.
	//   - `total`: The total amount of the stash's balance that we are currently accounting for.
	//     Simply `active + unlocking`.
	//   - `active`: The total amount of the stash's balance that will be at stake in any forthcoming
	//     eras.
	//   - `unlocking`: Any balance that is becoming free, which may eventually be transferred out of
	//     the stash (assuming it doesn't get slashed first). Represented as an array of objects, each
	//     with an `era` at which `value` will be unlocked.
	//   - `claimedRewards`: Array of eras for which the stakers behind a validator have claimed
	//     rewards. Only updated for _validators._
	//
	// Note: Runtime versions of Kusama less than 1062 will either have `lastReward` in place of
	// `claimedRewards`, or no field at all. This is related to changes in reward distribution. See:
	// - Lazy Payouts: https://github.com/paritytech/substrate/pull/4474
	// - Simple Payouts: https://github.com/paritytech/substrate/pull/5406
	//
	// Substrate Reference:
	// - Staking Pallet: https://crates.parity.io/pallet_staking/index.html
	// - `RewardDestination`: https://crates.parity.io/pallet_staking/enum.RewardDestination.html
	// - `Bonded`: https://crates.parity.io/pallet_staking/struct.Bonded.html
	// - `StakingLedger`: https://crates.parity.io/pallet_staking/struct.StakingLedger.html
	get('/staking/:address', async (params) => {
		const { address } = params;
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchAddressStakingInfo(hash, address);
	});

	get('/staking/:address/:number', async (params) => {
		const { address } = params;
		const hash: BlockHash = await getHashForBlock(api, params.number);

		return await handler.fetchAddressStakingInfo(hash, address);
	});

	// GET vesting information for an address.
	//
	// Paths:
	// - `address`: Address to query.
	// - (Optional) `number`: Block hash or height at which to query. If not provided, queries
	//   finalized head.
	//
	// Returns:
	// - `at`: Block number and hash at which the call was made.
	// - `vesting`: Vesting schedule for an account.
	//   - `locked`: Number of tokens locked at start.
	//   - `perBlock`: Number of tokens that gets unlocked every block after `startingBlock`.
	//   - `startingBlock`: Starting block for unlocking(vesting).
	//
	// Substrate Reference:
	// - Vesting Pallet: https://crates.parity.io/pallet_vesting/index.html
	// - `VestingInfo`: https://crates.parity.io/pallet_vesting/struct.VestingInfo.html
	get('/vesting/:address', async (params) => {
		const { address } = params;
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchVesting(hash, address);
	});

	get('/vesting/:address/:number', async (params) => {
		const { address } = params;
		const hash: BlockHash = await getHashForBlock(api, params.number);

		return await handler.fetchVesting(hash, address);
	});

	// GET the chain's metadata.
	//
	// Paths:
	// - (Optional) `number`: Block hash or height at which to query. If not provided, queries
	//   finalized head.
	//
	// Returns:
	// - Metadata object.
	//
	// Substrate Reference:
	// - FRAME Support: https://crates.parity.io/frame_support/metadata/index.html
	// - Knowledge Base: https://substrate.dev/docs/en/knowledgebase/runtime/metadata
	get('/metadata/', async () => {
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchMetadata(hash);
	});

	get('/metadata/:number', async (params) => {
		const hash: BlockHash = await getHashForBlock(api, params.number);
		return await handler.fetchMetadata(hash);
	});

	// GET the claims type for an Ethereum address.
	//
	// Paths:
	// - `ethAddress`: The _Ethereum_ address that holds a DOT claim.
	// - (Optional) `number`: Block hash or height at which to query. If not provided, queries
	//   finalized head.
	//
	// Returns:
	// - `type`: The type of claim. 'Regular' or 'Saft'.
	//
	// Reference:
	// - Claims Guide: https://wiki.polkadot.network/docs/en/claims
	get('/claims/:ethAddress', async (params) => {
		const { ethAddress } = params;
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchClaimsInfo(hash, ethAddress);
	});

	get('/claims/:ethAddress/:number', async (params) => {
		const { ethAddress } = params;
		const hash: BlockHash = await getHashForBlock(api, params.number);

		return await handler.fetchClaimsInfo(hash, ethAddress);
	});

	// GET all the information needed to construct a transaction offline.
	//
	// Paths
	// - (Optional) `number`: Block hash or number at which to query. If not provided, queries
	//   finalized head.
	//
	// Returns:
	// - `at`: Block number and hash at which the call was made.
	// - `genesisHash`: The hash of the chain's genesis block.
	// - `chainName`: The chain's name.
	// - `specName`: The chain's spec.
	// - `specVersion`: The spec version. Always increased in a runtime upgrade.
	// - `txversion`: The transaction version. Common `txVersion` numbers indicate that the
	//   transaction encoding format and method indices are the same. Needed for decoding in an
	//   offline environment. Adding new transactions does not change `txVersion`.
	// - `metadata`: The chain's metadata in hex format.
	//
	// Note: `chainName`, `specName`, and `specVersion` are used to define a type registry with a set
	// of signed extensions and types. For Polkadot and Kusama, `chainName` is not used in defining
	// this registry, but in other Substrate-based chains that re-launch their network without
	// changing the `specName`, the `chainName` would be needed to create the correct registry.
	//
	// Substrate Reference:
	// - `RuntimeVersion`: https://crates.parity.io/sp_version/struct.RuntimeVersion.html
	// - `SignedExtension`: https://crates.parity.io/sp_runtime/traits/trait.SignedExtension.html
	// - FRAME Support: https://crates.parity.io/frame_support/metadata/index.html
	get('/tx/artifacts', async () => {
		const hash = await api.rpc.chain.getFinalizedHead();

		return await handler.fetchTxArtifacts(hash);
	});

	get('/tx/artifacts/:number', async (params) => {
		const hash: BlockHash = await getHashForBlock(api, params.number);
		return await handler.fetchTxArtifacts(hash);
	});

	// POST a serialized transaction and receive a fee estimate.
	//
	// Post info:
	// - `data`: Expects a hex-encoded transaction, e.g. '{"tx": "0x..."}'.
	// - `headers`: Expects 'Content-Type: application/json'.
	//
	// Returns:
	// - Success:
	//   - `weight`: Extrinsic weight.
	//   - `class`: Extrinsic class, one of 'Normal', 'Operational', or 'Mandatory'.
	//   - `partialFee`: _Expected_ inclusion fee for the transaction. Note that the fee rate changes
	//     up to 30% in a 24 hour period and this will not be the exact fee.
	// - Failure:
	//   - `error`: Error description.
	//   - `data`: The extrinsic and reference block hash.
	//   - `cause`: Error message from the client.
	//
	// Note: `partialFee` does not include any tips that you may add to increase a transaction's
	// priority. See the reference on `compute_fee`.
	//
	// Substrate Reference:
	// - `RuntimeDispatchInfo`: https://crates.parity.io/pallet_transaction_payment_rpc_runtime_api/struct.RuntimeDispatchInfo.html
	// - `query_info`: https://crates.parity.io/pallet_transaction_payment/struct.Module.html#method.query_info
	// - `compute_fee`: https://crates.parity.io/pallet_transaction_payment/struct.Module.html#method.compute_fee
	post('/tx/fee-estimate/', async (_, body) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		if (body && typeof body.tx !== 'string') {
			return {
				error: 'Missing field `tx` on request body.',
			};
		}

		const hash = await api.rpc.chain.getFinalizedHead();

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return await handler.fetchFeeInformation(hash, body.tx);
	});

	// POST a serialized transaction to submit to the transaction queue.
	//
	// Post info:
	// - `data`: Expects a hex-encoded transaction, e.g. '{"tx": "0x..."}'.
	// - `headers`: Expects 'Content-Type: application/json'.
	//
	// Returns:
	// - Success:
	//   - `hash`: The hash of the encoded transaction.
	// - Failure:
	//   - `error`: 'Failed to parse a tx' or 'Failed to submit a tx'. In the case of the former, the
	//     Sidecar was unable to parse the transaction and never even submitted it to the client. In
	//     the case of the latter, the transaction queue rejected the transaction.
	//   - `data`: The hex-encoded extrinsic. Only present if Sidecar fails to parse a transaction.
	//   - `cause`: The error message from parsing or from the client.
	post('/tx/', async (_, body) => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		if (body && typeof body.tx !== 'string') {
			return {
				error: 'Missing field `tx` on request body.',
			};
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return await handler.submitTx(body.tx);
	});

	app.listen(PORT, HOST, () =>
		console.log(`Running on http://${HOST}:${PORT}/`)
	);
}

async function getHashForBlock(
	api: ApiPromise,
	blockId: string
): Promise<BlockHash> {
	try {
		let blockNumber;

		const isHexStr = isHex(blockId);
		if (isHexStr && blockId.length === 66) {
			// This is a block hash
			return api.createType('BlockHash', blockId);
		} else if (isHexStr) {
			throw {
				error:
					`Cannot get block hash for ${blockId}. ` +
					`Hex string block IDs must be 32-bytes (66-characters) in length.`,
			};
		}

		// Not a block hash, must be a block height
		try {
			blockNumber = parseBlockNumber(blockId);
		} catch (err) {
			throw {
				error:
					`Cannot get block hash for ${blockId}. ` +
					`Block IDs must be either 32-byte hex strings or non-negative decimal integers.`,
			};
		}

		return await api.rpc.chain.getBlockHash(blockNumber);
	} catch (err) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		if (err && typeof err.error === 'string') {
			throw err;
		}

		throw { error: `Cannot get block hash for ${blockId}.` };
	}
}

main().catch(console.log);
