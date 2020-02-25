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
import { BlockHash } from '@polkadot/types/interfaces/rpc';
import { Event, EventRecord } from '@polkadot/types/interfaces/system';
import { EventData } from '@polkadot/types/generic/Event';
import { blake2AsU8a } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { getSpecTypes } from '@polkadot/types/known';
import { u32 } from '@polkadot/types/primitive';

interface SantiziedEvent {
	method: string;
	data: EventData;
}

export default class ApiHandler {
	private api: ApiPromise;
	private specVersion: u32;

	constructor(api: ApiPromise) {
		this.api = api;
		this.specVersion = api.createType('u32', -1);
	}

	async fetchBlock(hash: BlockHash) {
		await this.ensureMeta(hash);

		const { api } = this;
		const [{ block }, events] = await Promise.all([
			api.rpc.chain.getBlock(hash),
			this.fetchEvents(hash),
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
		await this.ensureMeta(hash);

		const { api } = this;

		const [header, free, reserved, locks, nonce] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.balances.freeBalance.at(hash, address),
			api.query.balances.reservedBalance.at(hash, address),
			api.query.balances.locks.at(hash, address),
			api.query.system.accountNonce.at(hash, address),
		]);

		const at = {
			hash,
			height: (header as any).number, // TODO: fix this nasty obvious type erasure
		};

		return { at, nonce, free, reserved, locks };
	}

	async fetchEvents(hash: BlockHash): Promise<EventRecord[] | string> {
		try {
			return await await this.api.query.system.events.at(hash);
		} catch (_) {
			return 'Unable to fetch Events, cannot confirm extrinsic status. Check pruning settings on the node.';
		}
	}

	async ensureMeta(hash: BlockHash) {
		const { api } = this;

		try {
			const runtimeVersion = await api.rpc.state.getRuntimeVersion(hash);
			const blockSpecVersion = runtimeVersion.specVersion;

		    // swap metadata if spec version is different
		    if (!this.specVersion.eq(blockSpecVersion)) {
		    	this.specVersion = blockSpecVersion;
				const meta = await api.rpc.state.getMetadata(hash);
				const chain = await api.rpc.system.chain();

				api.registry.register(getSpecTypes(chain, runtimeVersion));
				api.registry.setMetadata(meta);
			}
		} catch (err) {
			console.error(`Failed to get Metadata for block ${hash}, using latest.`);
			console.error(err);
			this.specVersion = api.createType('u32', -1);
		}
	}
}