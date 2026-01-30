// Copyright 2017-2026 Parity Technologies (UK) Ltd.
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
import { ApiDecoration } from '@polkadot/api/types';
import type { BlockHash } from '@polkadot/types/interfaces';
import { u8aToHex } from '@polkadot/util';
import { merkleizeMetadata } from '@polkadot-api/merkleize-metadata';
import { BadRequest, InternalServerError } from 'http-errors';
import { ITransactionMetadataBlob } from 'src/types/responses';

import { MetadataBlobParams } from '../../controllers/transaction/TransactionMetadataBlobController';
import { AbstractService } from '../AbstractService';

export class TransactionMetadataBlobService extends AbstractService {
	/**
	 * Fetch metadata blob (proof) for a given transaction.
	 * This returns the minimal metadata needed by offline signers to decode
	 * the transaction, along with the metadata hash for CheckMetadataHash.
	 *
	 * @param api ApiPromise to use for the call
	 * @param hash `BlockHash` hash to query at
	 * @param params Request parameters
	 */
	async fetchMetadataBlob(
		api: ApiPromise,
		hash: BlockHash,
		params: MetadataBlobParams,
	): Promise<ITransactionMetadataBlob> {
		if (!params.tx && !params.callData) {
			throw new BadRequest(
				'Must provide either `tx` (full extrinsic) or `callData` with `includedInExtrinsic` and `includedInSignedData`.',
			);
		}

		if (params.callData && (!params.includedInExtrinsic || !params.includedInSignedData)) {
			throw new BadRequest(
				'When using `callData`, must also provide `includedInExtrinsic` and `includedInSignedData`.',
			);
		}

		const historicApi = await api.at(hash);

		const [header, version, properties, metadataV15Raw] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.system.properties(),
			this.fetchMetadataV15(historicApi),
		]);

		const tokenDecimalsRaw = properties.tokenDecimals.isSome ? properties.tokenDecimals.value : null;
		const tokenSymbolRaw = properties.tokenSymbol.isSome ? properties.tokenSymbol.value : null;
		const ss58Format = properties.ss58Format.isSome ? properties.ss58Format.value : null;

		let decimals = 10;
		if (tokenDecimalsRaw) {
			const decimalsJson = tokenDecimalsRaw.toJSON();
			if (Array.isArray(decimalsJson)) {
				decimals = (decimalsJson[0] as number) ?? 10;
			} else if (typeof decimalsJson === 'number') {
				decimals = decimalsJson;
			}
		}

		let tokenSymbol = 'DOT';
		if (tokenSymbolRaw) {
			const symbolJson = tokenSymbolRaw.toJSON();
			if (Array.isArray(symbolJson)) {
				tokenSymbol = (symbolJson[0] as string) ?? 'DOT';
			} else if (typeof symbolJson === 'string') {
				tokenSymbol = symbolJson;
			}
		}

		const base58Prefix = ss58Format?.toNumber() ?? 42;

		const merkleized = merkleizeMetadata(metadataV15Raw, {
			decimals,
			tokenSymbol,
		});

		const metadataHash = u8aToHex(merkleized.digest());

		let metadataBlobBytes: Uint8Array;

		if (params.tx) {
			metadataBlobBytes = merkleized.getProofForExtrinsic(params.tx, params.txAdditionalSigned);
		} else {
			metadataBlobBytes = merkleized.getProofForExtrinsicParts(
				params.callData!,
				params.includedInExtrinsic!,
				params.includedInSignedData!,
			);
		}

		const metadataBlob = u8aToHex(metadataBlobBytes);

		return {
			at: {
				hash,
				height: header.number.unwrap().toString(10),
			},
			metadataHash,
			metadataBlob,
			specVersion: version.specVersion.toNumber(),
			specName: version.specName.toString(),
			base58Prefix,
			decimals,
			tokenSymbol,
		};
	}

	/**
	 * Fetch V15 metadata from the chain.
	 * V15 metadata is required for RFC-0078 merkleization.
	 */
	private async fetchMetadataV15(apiAt: ApiDecoration<'promise'>): Promise<Uint8Array> {
		try {
			const availableVersions = await apiAt.call.metadata.metadataVersions();
			const versions = availableVersions.toJSON() as number[];

			if (!versions.includes(15)) {
				throw new BadRequest('Metadata V15 is not available on this chain. CheckMetadataHash requires V15 metadata.');
			}

			const metadataOpt = await apiAt.call.metadata.metadataAtVersion(15);

			if (metadataOpt.isNone) {
				throw new InternalServerError('Failed to fetch metadata V15 from the chain.');
			}

			return metadataOpt.unwrap().toU8a();
		} catch (err) {
			if (err instanceof BadRequest || err instanceof InternalServerError) {
				throw err;
			}
			throw new InternalServerError(
				`Failed to fetch metadata V15: ${err instanceof Error ? err.message : 'Unknown error'}`,
			);
		}
	}
}
