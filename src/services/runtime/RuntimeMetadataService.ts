// Copyright 2017-2024 Parity Technologies (UK) Ltd.
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

import { ApiDecoration } from '@polkadot/api/types';
import { Metadata } from '@polkadot/types';
import type { Option } from '@polkadot/types/codec';
import type { BlockHash, OpaqueMetadata } from '@polkadot/types/interfaces';
import { InternalServerError } from 'http-errors';

import { AbstractService } from '../AbstractService';

export class RuntimeMetadataService extends AbstractService {
	/**
	 * Fetch `Metadata` in decoded JSON form.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async fetchMetadata(hash: BlockHash): Promise<Metadata> {
		const { api } = this;

		const metadata = await api.rpc.state.getMetadata(hash);

		return metadata;
	}

	/**
	 * Fetch the requested version of `Metadata` in decoded JSON form.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async fetchMetadataVersioned(apiAt: ApiDecoration<'promise'>, metadataVersion: number): Promise<Metadata> {
		let metadata: Option<OpaqueMetadata> | undefined;
		let metadataVersioned: Metadata | undefined;
		try {
			metadata = await apiAt.call.metadata.metadataAtVersion(metadataVersion);
			if (metadata) {
				metadataVersioned = new Metadata(apiAt.registry, metadata.unwrap());
			} else {
				throw new Error(`Metadata for version ${metadataVersion} is not available.`);
			}
		} catch {
			throw new InternalServerError(
				`An error occured while attempting to fetch ${metadataVersion.toString()} metadata.`,
			);
		}

		return metadataVersioned;
	}

	/**
	 * Fetch the available `Metadata` versions.
	 *
	 * @param hash `BlockHash` to make call at
	 */
	async fetchMetadataVersions(hash: BlockHash): Promise<string[]> {
		const { api } = this;
		const apiAt = await api.at(hash);

		const availableVersions = (await apiAt.call.metadata.metadataVersions()).toHuman() as string[];

		return availableVersions;
	}
}
