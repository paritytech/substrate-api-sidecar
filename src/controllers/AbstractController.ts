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

import { ApiPromise } from '@polkadot/api';
import { Bytes } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces';
import { PolkadotPrimitivesVstagingCommittedCandidateReceiptV2 } from '@polkadot/types/lookup';
import { isHex } from '@polkadot/util';
import { RequestHandler, Response, Router } from 'express';
import * as express from 'express';
import { BadRequest, HttpError, InternalServerError } from 'http-errors';
import { AbstractService } from 'src/services/AbstractService';
import { AnyJson } from 'src/types/polkadot-js';
import {
	IAddressNumberParams,
	IAddressParam,
	IConvertQueryParams,
	INumberParam,
	IParaIdParam,
	IRangeQueryParam,
} from 'src/types/requests';

import { ApiPromiseRegistry } from '../../src/apiRegistry';
import type { AssetHubInfo } from '../apiRegistry';
import { sanitizeNumbers } from '../sanitize';
import { isBasicLegacyError } from '../types/errors';
import { ISanitizeOptions } from '../types/sanitize';
import { verifyNonZeroUInt, verifyUInt } from '../util/integers/verifyInt';

type SidecarRequestHandler =
	| RequestHandler<unknown, unknown, unknown, IRangeQueryParam>
	| RequestHandler<IAddressParam, unknown, unknown, IConvertQueryParams>
	| RequestHandler<IAddressParam>
	| RequestHandler<IAddressNumberParams>
	| RequestHandler<INumberParam>
	| RequestHandler<IParaIdParam>
	| RequestHandler;

/*
 * The required pallets for a controller can be a list of pallets in string, or a list of list of pallets, which represents an OR statement.
 * Example:
 * 		- [['pallet1', 'pallet2']] => Requires pallet1 AND pallet2
 *      - [['pallet1', 'pallet2'], ['pallet1', 'pallet3']] => Requires (pallet1 AND pallet2) OR (pallet1 AND pallet3)
 */
export type RequiredPallets = string[][];

/**
 * Abstract base class for creating controller classes.
 */
export default abstract class AbstractController<T extends AbstractService> {
	private _router: Router = express.Router();
	public ASSET_HUB_ID = 1000;
	static controllerName: string;
	static requiredPallets: RequiredPallets;

	constructor(
		private _specName: string,
		private _path: string,
		protected service: T,
	) {}
	get path(): string {
		return this._path;
	}

	get router(): Router {
		return this._router;
	}

	get api(): ApiPromise {
		const api = ApiPromiseRegistry.getApi(this._specName);
		if (!api) {
			throw new InternalServerError('API not found during controller initilization');
		}
		return api;
	}

	get assetHubInfo(): AssetHubInfo {
		return ApiPromiseRegistry.assetHubInfo;
	}

	get specName(): string {
		return this._specName;
	}
	/**
	 * Mount all controller handler methods on the class's private router.
	 *
	 * Keep in mind that asynchronous errors in the RequestHandlers need to be
	 * dealt with manually.
	 */
	protected abstract initRoutes(): void;

	/**
	 * Safely mount async GET routes by wrapping them with an express
	 * handler friendly try / catch block and then mounting on the controllers
	 * router.
	 *
	 * @param pathsAndHandlers array of tuples containing the suffix to the controller
	 * base path (use empty string if no suffix) and the get request handler function.
	 */
	protected safeMountAsyncGetHandlers(pathsAndHandlers: [string, SidecarRequestHandler][]): void {
		for (const pathAndHandler of pathsAndHandlers) {
			const [pathSuffix, handler] = pathAndHandler;
			this.router.get(`${this.path}${pathSuffix}`, AbstractController.catchWrap(handler as RequestHandler));
		}
	}

	/**
	 * Safely mount async POST routes by wrapping them with an express
	 * handler friendly try / catch block and then mounting on the controllers
	 * router.
	 *
	 * @param pathsAndHandlers array of tuples containing the suffix to the controller
	 * base path (use empty string if no suffix) and the get request handler function.
	 */
	protected safeMountAsyncPostHandlers(pathsAndHandlers: [string, SidecarRequestHandler][]): void {
		for (const pathAndHandler of pathsAndHandlers) {
			const [pathSuffix, handler] = pathAndHandler;
			this.router.post(`${this.path}${pathSuffix}`, AbstractController.catchWrap(handler as RequestHandler));
		}
	}

	/**
	 * Wrapper for any asynchronous RequestHandler function. Pipes errors
	 * to downstream error handling middleware.
	 *
	 * @param cb ExpressHandler
	 */
	protected static catchWrap =
		(cb: RequestHandler): RequestHandler =>
		async (req, res, next): Promise<void> => {
			try {
				// eslint-disable-next-line @typescript-eslint/await-thenable
				await cb(req, res, next);
			} catch (err) {
				next(err);
			}
		};

	/**
	 * Create or retrieve the corresponding BlockHash for the given block identifier.
	 * This also acts as a validation for string based block identifiers.
	 *
	 * @param blockId string representing a hash or number block identifier.
	 */
	protected async getHashForBlock(blockId: string, opts: { api?: ApiPromise } = {}): Promise<BlockHash> {
		let blockNumber;

		// isHex, as imported, returns "value is string", which undersells what it
		// is checking for (it's not only checking that value is string, but that it's
		// valid looking hex). So, we vaguen up the type signature here to avoid breakage
		// below (see https://github.com/polkadot-js/common/issues/1102).
		function isHexBool(value: unknown): boolean {
			return isHex(value);
		}

		const chosenApi = opts?.api ? opts.api : this.api;

		try {
			const isHexStr = isHexBool(blockId);
			if (isHexStr && blockId.length === 66) {
				// This is a block hash
				return chosenApi.createType('BlockHash', blockId);
			} else if (isHexStr) {
				throw new BadRequest(
					`Cannot get block hash for ${blockId}. ` + `Hex string block IDs must be 32-bytes (66-characters) in length.`,
				);
			} else if (blockId.slice(0, 2) === '0x') {
				throw new BadRequest(
					`Cannot get block hash for ${blockId}. ` +
						`Hex string block IDs must be a valid hex string ` +
						`and must be 32-bytes (66-characters) in length.`,
				);
			}

			// Not a block hash, must be a block height
			try {
				blockNumber = this.parseNumberOrThrow(blockId, 'Invalid block number');
			} catch (err) {
				throw new BadRequest(
					`Cannot get block hash for ${blockId}. ` +
						`Block IDs must be either 32-byte hex strings or non-negative decimal integers.`,
				);
			}

			return await chosenApi.rpc.chain.getBlockHash(blockNumber);
		} catch (err) {
			if (err instanceof HttpError) {
				// Throw errors we created in the above try block
				throw err;
			}

			const { number } = await chosenApi.rpc.chain.getHeader().catch(() => {
				throw new InternalServerError('Failed while trying to get the latest header.');
			});
			if (blockNumber && number.toNumber() < blockNumber) {
				throw new BadRequest(
					`Specified block number is larger than the current largest block. ` +
						`The largest known block number is ${number.toString()}.`,
				);
			}

			// This should never be used, but here just in case
			if (isBasicLegacyError(err)) {
				throw err;
			}

			throw new InternalServerError(`Cannot get block hash for ${blockId}.`);
		}
	}

	protected parseNumberOrThrow(n: string, errorMessage: string): number {
		const num = Number(n);

		if (!verifyUInt(num)) {
			throw new BadRequest(errorMessage);
		}

		return num;
	}

	/**
	 * Expected format ie: 0-999
	 */
	protected parseRangeOfNumbersOrThrow(n: string, maxRange: number): number[] {
		const splitRange = n.split('-');
		if (splitRange.length !== 2) {
			throw new BadRequest('Incorrect range format. Expected example: 0-999');
		}

		const min = Number(splitRange[0]);
		const max = Number(splitRange[1]);

		if (!verifyUInt(min)) {
			throw new BadRequest('Inputted min value for range must be an unsigned integer.');
		}

		if (!verifyNonZeroUInt(max)) {
			throw new BadRequest('Inputted max value for range must be an unsigned non zero integer.');
		}

		if (min >= max) {
			throw new BadRequest('Inputted min value cannot be greater than or equal to the max value.');
		}

		if (max - min > maxRange) {
			throw new BadRequest(`Inputted range is greater than the ${maxRange} range limit.`);
		}

		return [...Array(max - min + 1).keys()].map((i) => i + min);
	}

	protected parseQueryParamArrayOrThrow(n: string[]): number[] {
		return n.map((str) => this.parseNumberOrThrow(str, `Incorrect AssetId format: ${str} is not a positive integer.`));
	}

	protected verifyAndCastOr(name: string, str: unknown, or: number | undefined): number | undefined {
		if (!str) {
			return or;
		}

		if (!(typeof str === 'string')) {
			throw new BadRequest(`Incorrect argument quantity or type passed in for ${name} query param`);
		}

		return this.parseNumberOrThrow(str, `${name} query param is an invalid number`);
	}

	/**
	 * Get a BlockHash based on the `at` query param.
	 *
	 * @param at should be a block height, hash, or undefined from the `at` query param
	 */
	protected async getHashFromAt(at: unknown, opts: { api?: ApiPromise } = {}): Promise<BlockHash> {
		const chosenApi = opts?.api ? opts.api : this.api;
		return typeof at === 'string'
			? await this.getHashForBlock(at, { api: chosenApi })
			: await chosenApi.rpc.chain.getFinalizedHead();
	}

	protected async getAhAtFromRcAt(at: unknown, maxDepth: number = 2): Promise<BlockHash> {
		const rcApi = ApiPromiseRegistry.getApiByType('relay')[0]?.api;

		if (!rcApi) {
			throw new Error('Relay chain api must be available');
		}

		const rcHash = await this.getHashFromAt(at, { api: rcApi });

		return this.findAhBlockInRcBlock(rcHash, rcApi, maxDepth);
	}

	private async findAhBlockInRcBlock(rcHash: BlockHash, rcApi: ApiPromise, remainingDepth: number): Promise<BlockHash> {
		if (remainingDepth <= 0) {
			throw new Error('Maximum search depth reached while looking for Asset Hub inclusion');
		}

		const rcApiAt = await rcApi.at(rcHash);
		const events = await rcApiAt.query.system.events();

		const paraInclusion = events.filter((record) => {
			return record.event.section === 'paraInclusion' && record.event.method === 'CandidateIncluded';
		});

		const ahInfo = paraInclusion.find(({ event }) => {
			const { data } = event;
			const paraData = data[0] as PolkadotPrimitivesVstagingCommittedCandidateReceiptV2;
			const { paraId } = paraData.descriptor;

			return paraId.toNumber() === this.ASSET_HUB_ID;
		});

		if (ahInfo) {
			const headerData = ahInfo.event.data[1] as Bytes;
			const header = rcApiAt.registry.createType('Header', headerData);
			const ahBlockHash = header.hash;
			return rcApi.createType('BlockHash', ahBlockHash);
		}

		const rcHeader = await rcApiAt.query.system.parentHash();
		const previousRcHash = rcApi.createType('BlockHash', rcHeader);

		return this.findAhBlockInRcBlock(previousRcHash, rcApi, remainingDepth - 1);
	}

	protected async getHashFromRcAt(rcAt: unknown): Promise<{ ahHash: BlockHash; rcBlockNumber: string }> {
		const ahHash = await this.getAhAtFromRcAt(rcAt);
		const rcBlockNumber = typeof rcAt === 'string' ? rcAt : 'latest';

		return { ahHash, rcBlockNumber };
	}

	/**
	 * Sanitize the numbers within the response body and then send the response
	 * body using the original Express Response object.
	 *
	 * @param res Response
	 * @param body response body
	 */
	static sanitizedSend<T>(res: Response<AnyJson>, body: T, options: ISanitizeOptions = {}): void {
		res.send(sanitizeNumbers(body, options));
	}

	static canInjectByPallets(availablePallets: string[]): boolean {
		if (!this.requiredPallets) {
			return true;
		}
		if (this.requiredPallets.length === 1) {
			if (this.requiredPallets[0].length === 0) {
				return true;
			}
			return this.requiredPallets[0].every((pallet) => availablePallets.includes(pallet));
		} else if (this.requiredPallets.length > 1) {
			return this.requiredPallets.some((pallets) => pallets.every((p) => availablePallets.includes(p)));
		}
		// If requiredPallets is empty, then we can inject
		return true;
	}
}
