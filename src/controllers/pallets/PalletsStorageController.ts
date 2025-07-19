// Copyright 2017-2025 Parity Technologies (UK) Ltd.
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

import { BlockHash } from '@polkadot/types/interfaces';
import { stringCamelCase } from '@polkadot/util';
import { RequestHandler } from 'express-serve-static-core';

import { validateRcAt } from '../../middleware';
import { PalletsStorageService } from '../../services';
import { IPalletsStorageParam, IPalletsStorageQueryParam } from '../../types/requests';
import AbstractController from '../AbstractController';

/**
 * `/pallets/{palletId}/storage`
 *
 * Returns the metadata for each storage item of the pallet.
 *
 * `/pallets/{palletId}/storage/{storageItemId}`
 *
 * Returns the value stored under the storageItemId. If it is a
 * map, query param key1 is required. If the storage item is double map
 * query params key1 and key2 are required.
 *
 * See `docs/src/openapi-v1.yaml` for usage information.
 */
export default class PalletsStorageController extends AbstractController<PalletsStorageService> {
	static controllerName = 'PalletsStorage';
	static requiredPallets = [];
	constructor(api: string) {
		super(api, '/pallets/:palletId/storage', new PalletsStorageService(api));

		this.initRoutes();
	}

	protected initRoutes(): void {
		this.router.use(this.path, validateRcAt);
		this.safeMountAsyncGetHandlers([
			['/:storageItemId', this.getStorageItem as RequestHandler],
			['/', this.getStorage],
		]);
	}

	private getStorageItem: RequestHandler<IPalletsStorageParam, unknown, unknown, IPalletsStorageQueryParam> = async (
		{ query: { at, keys, metadata, rcAt }, params: { palletId, storageItemId } },
		res,
	): Promise<void> => {
		const parsedKeys = Array.isArray(keys) ? keys : [];
		const metadataArg = metadata === 'true';
		let hash: BlockHash;
		let rcBlockNumber: string | undefined;

		if (rcAt) {
			const rcAtResult = await this.getHashFromRcAt(rcAt);
			hash = rcAtResult.ahHash;
			rcBlockNumber = rcAtResult.rcBlockNumber;
		} else {
			hash = await this.getHashFromAt(at);
		}

		const historicApi = await this.api.at(hash);

		const result = await this.service.fetchStorageItem(historicApi, {
			hash,
			// stringCamelCase ensures we don't have snake case or kebab case
			palletId: stringCamelCase(palletId),
			storageItemId: stringCamelCase(storageItemId),
			keys: parsedKeys,
			metadata: metadataArg,
		});

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...result,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			PalletsStorageController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsStorageController.sanitizedSend(res, result);
		}
	};

	private getStorage: RequestHandler = async (
		{ params: { palletId }, query: { at, onlyIds, rcAt } },
		res,
	): Promise<void> => {
		const onlyIdsArg = onlyIds === 'true';
		let hash: BlockHash;
		let rcBlockNumber: string | undefined;

		if (rcAt) {
			const rcAtResult = await this.getHashFromRcAt(rcAt);
			hash = rcAtResult.ahHash;
			rcBlockNumber = rcAtResult.rcBlockNumber;
		} else {
			hash = await this.getHashFromAt(at);
		}

		const historicApi = await this.api.at(hash);

		const result = await this.service.fetchStorage(historicApi, {
			hash,
			palletId: stringCamelCase(palletId),
			onlyIds: onlyIdsArg,
		});

		if (rcBlockNumber) {
			const apiAt = await this.api.at(hash);
			const ahTimestamp = await apiAt.query.timestamp.now();

			const enhancedResult = {
				...result,
				rcBlockNumber,
				ahTimestamp: ahTimestamp.toString(),
			};

			PalletsStorageController.sanitizedSend(res, enhancedResult);
		} else {
			PalletsStorageController.sanitizedSend(res, result);
		}
	};
}
