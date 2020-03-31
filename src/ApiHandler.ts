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
import { BlockHash } from '@polkadot/types/interfaces/chain';
import { Event, EventRecord } from '@polkadot/types/interfaces/system';
import { GenericExtrinsicV4 } from '@polkadot/types/extrinsic';
import { EventData } from '@polkadot/types/generic/Event';
import { blake2AsU8a } from '@polkadot/util-crypto';
import { u8aToHex, hexToU8a } from '@polkadot/util';
import { getSpecTypes } from '@polkadot/types-known';
import { u32 } from '@polkadot/types/primitive';

interface SantiziedEvent {
	method: string;
	data: EventData;
}

export default class ApiHandler {
	// private wsUrl: string,
	private api: ApiPromise;
	private specVersion: u32;

	constructor(api: ApiPromise) {
		this.api = api;
		// this.wsUrl = wsUrl;
		this.specVersion = api.createType('u32', -1);
	}

	async fetchBlock(hash: BlockHash) {
		const api = await this.ensureMeta(hash);
		const [{ block }, events] = await Promise.all([
			api.rpc.chain.getBlock(hash),
			this.fetchEvents(api, hash),
		]);

		const { parentHash, number, stateRoot, extrinsicsRoot } = block.header;

		const logs = block.header.digest.logs.map((log) => {
			const { type, index, value } = log;

			return { type, index, value };
		});

		const defaultSuccess = typeof events === 'string' ? events : false;
		const queryInfo = await Promise.all(block.extrinsics.map(async (extrinsic) => {
			if (extrinsic.isSigned && extrinsic.method.sectionName !== 'sudo') {
				try {
					return await api.rpc.payment.queryInfo(extrinsic.toHex(), hash);
				} catch (err) {
					console.error(err);

					return {
						error: 'Unable to fetch fee info',
					}
				}
			}

			return {};
		}));
		const extrinsics = block.extrinsics.map((extrinsic, idx) => {
			const { method, nonce, signature, signer, isSigned, tip, args } = extrinsic;
			const hash = u8aToHex(blake2AsU8a(extrinsic.toU8a(), 256));
			const info = queryInfo[idx];

			return {
				method: `${method.sectionName}.${method.methodName}`,
				signature: isSigned ? { signature, signer } : null,
				nonce,
				args,
				tip,
				hash,
				info,
				events: [] as SantiziedEvent[],
				success: defaultSuccess,
			};
		});

		if (Array.isArray(events)) {
			for (const record of events) {
				const { event, phase } = record;

				if (phase.isApplyExtrinsic) {
					const extrinsicIdx = phase.asApplyExtrinsic.toNumber();
					const extrinsic = extrinsics[extrinsicIdx];

					if (!extrinsic) {
						throw new Error(`Missing extrinsic ${extrinsicIdx} in block ${hash}`);
					}

					const method = `${event.section}.${event.method}`;

					if (method === 'system.ExtrinsicSuccess') {
						extrinsic.success = true;
					}

					extrinsic.events.push({
						method: `${event.section}.${event.method}`,
						data: event.data,
					});
				}
			}
		}

		return {
			number,
			hash,
			parentHash,
			stateRoot,
			extrinsicsRoot,
			logs,
			extrinsics,
		};
	}

	async fetchBalance(hash: BlockHash, address: string) {
		const api = await this.ensureMeta(hash);

		const [header, account, locks, sysAccount] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.balances.account.at(hash, address),
			api.query.balances.locks.at(hash, address),
			api.query.system.account.at(hash, address),
		]);

		const at = {
			hash,
			height: (header as any).number, // TODO: fix this nasty obvious type erasure
		};

		if (account && locks && sysAccount) {
			const { free, reserved, miscFrozen, feeFrozen } = account;
			const { nonce } = sysAccount;

			return {
				at,
				nonce,
				free,
				reserved,
				miscFrozen,
				feeFrozen,
				locks,
			};
		} else {
			throw {
				at,
				error: "Account not found",
			};
		}
	}

	async fetchMetadata(hash: BlockHash) {
		const api = await this.ensureMeta(hash);

		const metadata = await api.rpc.state.getMetadata(hash);

		return metadata;
	}

	async submitTx(extrinsic: string) {
		const api = await this.resetMeta();

		let tx;

		try {
			tx = api.tx(extrinsic);
		} catch (err) {
			throw {
				error: 'Failed to parse a tx',
				data: extrinsic,
				cause: err.toString(),
			};
		}

		try {
			const hash = await api.rpc.author.submitExtrinsic(tx);

			return {
				hash,
			};
		} catch (err) {
			throw {
				error: 'Failed to submit a tx',
				cause: err.toString(),
			}
		}
	}

	private async fetchEvents(api: ApiPromise, hash: BlockHash): Promise<EventRecord[] | string> {
		try {
			return await await api.query.system.events.at(hash);
		} catch (_) {
			return 'Unable to fetch Events, cannot confirm extrinsic status. Check pruning settings on the node.';
		}
	}

	private async resetMeta(): Promise<ApiPromise> {
		const { api } = this;

		return await this.ensureMeta(await api.rpc.chain.getFinalizedHead());
	}

	private async ensureMeta(hash: BlockHash): Promise<ApiPromise> {
		const { api } = this;

		try {
			const version = await api.rpc.state.getRuntimeVersion(hash);
			const blockSpecVersion = version.specVersion;

			// swap metadata if spec version is different
			if (!this.specVersion.eq(blockSpecVersion)) {
				this.specVersion = blockSpecVersion;
				const meta = await api.rpc.state.getMetadata(hash);
				const chain = await api.rpc.system.chain();

				api.registry.register(getSpecTypes(api.registry, chain, version.specName, blockSpecVersion));
				api.registry.setMetadata(meta);
			}
		} catch (err) {
			console.error(`Failed to get Metadata for block ${hash}, using latest.`);
			console.error(err);
			this.specVersion = api.createType('u32', -1);
		}

		return api;
	}
}