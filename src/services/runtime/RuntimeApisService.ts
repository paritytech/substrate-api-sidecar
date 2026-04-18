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
import type { BlockHash, ItemDeprecationInfoV16 } from '@polkadot/types/interfaces';
import { stringCamelCase } from '@polkadot/util';
import { BadRequest } from 'http-errors';

import {
	IDeprecationInfo,
	IRuntimeApi,
	IRuntimeApiCall,
	IRuntimeApiDescription,
	IRuntimeApiMethod,
	IRuntimeApis,
} from '../../types/responses';
import { AbstractService } from '../AbstractService';

type RuntimeQueryableApi = ApiPromise | ApiDecoration<'promise'>;
type RegistryRuntimeApiMetadata = ReturnType<ApiPromise['registry']['metadata']['apis']['toArray']>[number];
type RegistryRuntimeApiMethodMetadata = RegistryRuntimeApiMetadata['methods'][number];
type RegistryRuntimeApiMethodInputMetadata = RegistryRuntimeApiMethodMetadata['inputs'][number];

export class RuntimeApisService extends AbstractService {
	async fetchRuntimeApis(hash: BlockHash, apiAt?: RuntimeQueryableApi): Promise<IRuntimeApis> {
		const api = apiAt || this.api;
		const runtimeApis = this.extractRuntimeApis(api);
		return {
			at: await this.getAt(hash),
			apis: runtimeApis.map((runtimeApi) => ({
				name: runtimeApi.name,
				id: runtimeApi.id,
				docs: runtimeApi.docs,
				methodCount: runtimeApi.methods.length,
				methods: runtimeApi.methods.map((method) => ({
					name: method.name,
					id: method.id,
				})),
			})),
		};
	}

	async fetchRuntimeApi(hash: BlockHash, apiId: string, apiAt?: RuntimeQueryableApi): Promise<IRuntimeApi> {
		const api = apiAt || this.api;
		const runtimeApis = this.extractRuntimeApis(api);
		const runtimeApi = this.resolveRuntimeApi(runtimeApis, apiId);

		return {
			at: await this.getAt(hash),
			api: runtimeApi,
		};
	}

	async callRuntimeApi(
		hash: BlockHash,
		apiId: string,
		methodId: string,
		params: unknown,
		apiAt?: RuntimeQueryableApi,
	): Promise<IRuntimeApiCall> {
		const api = apiAt || this.api;
		const runtimeApis = this.extractRuntimeApis(api);
		const runtimeApi = this.resolveRuntimeApi(runtimeApis, apiId);
		const runtimeMethod = this.resolveRuntimeMethod(runtimeApi, methodId);
		const orderedParams = this.orderMethodParams(runtimeMethod, params);

		const callApi = api.call;
		const runtimeCallApi = callApi[runtimeApi.id];

		if (!runtimeCallApi) {
			throw new BadRequest(
				`Runtime API '${runtimeApi.name}' exists in metadata but is not callable via api.call.${runtimeApi.id}.`,
			);
		}

		const runtimeCallMethod = runtimeCallApi[runtimeMethod.id];

		if (!runtimeCallMethod) {
			throw new BadRequest(
				`Runtime API method '${runtimeMethod.name}' exists in metadata but is not callable via api.call.${runtimeApi.id}.${runtimeMethod.id}.`,
			);
		}

		const result = await runtimeCallMethod(...orderedParams);

		return {
			at: await this.getAt(hash),
			api: {
				name: runtimeApi.name,
				id: runtimeApi.id,
			},
			method: {
				name: runtimeMethod.name,
				id: runtimeMethod.id,
			},
			result: result.toJSON(),
		};
	}

	private extractRuntimeApis(api: RuntimeQueryableApi): IRuntimeApiDescription[] {
		const runtimeApis = api.registry.metadata.apis.toArray();

		if (runtimeApis.length === 0) {
			throw new BadRequest('Runtime API metadata is not available. This endpoint requires metadata v15 or higher.');
		}

		return runtimeApis.map((runtimeApi) => this.mapRuntimeApi(api, runtimeApi));
	}

	private mapRuntimeApi(api: RuntimeQueryableApi, runtimeApi: RegistryRuntimeApiMetadata): IRuntimeApiDescription {
		const runtimeApiName = runtimeApi.name.toString();
		const runtimeApiId = stringCamelCase(runtimeApiName);
		const version = 'version' in runtimeApi ? runtimeApi.version.toNumber() : null;
		const deprecationInfo =
			'deprecationInfo' in runtimeApi ? this.mapDeprecationInfo(runtimeApi.deprecationInfo) : null;

		return {
			name: runtimeApiName,
			id: runtimeApiId,
			docs: this.sanitizeMetadataDocs(runtimeApi.docs),
			version,
			deprecationInfo,
			methods: runtimeApi.methods.map((method) => this.mapRuntimeApiMethod(api, method)),
		};
	}

	private mapRuntimeApiMethod(api: RuntimeQueryableApi, method: RegistryRuntimeApiMethodMetadata): IRuntimeApiMethod {
		const methodName = method.name.toString();
		const methodId = stringCamelCase(methodName);
		const outputTypeId = method.output.toString();
		const deprecationInfo = 'deprecationInfo' in method ? this.mapDeprecationInfo(method.deprecationInfo) : null;

		return {
			name: methodName,
			id: methodId,
			docs: this.sanitizeMetadataDocs(method.docs),
			inputs: method.inputs.map((input, index) => this.mapRuntimeApiMethodInput(api, input, index)),
			output: {
				typeId: outputTypeId,
				type: this.resolveLookupType(api, outputTypeId),
			},
			deprecationInfo,
		};
	}

	private mapRuntimeApiMethodInput(
		api: RuntimeQueryableApi,
		input: RegistryRuntimeApiMethodInputMetadata,
		index: number,
	): IRuntimeApiMethod['inputs'][number] {
		const inputName = input.name.toString() || `arg${index}`;
		const inputTypeId = input.type.toString();

		return {
			name: inputName,
			id: stringCamelCase(inputName),
			typeId: inputTypeId,
			type: this.resolveLookupType(api, inputTypeId),
		};
	}

	private resolveRuntimeApi(runtimeApis: IRuntimeApiDescription[], apiId: string): IRuntimeApiDescription {
		const normalizedApiId = apiId.toLowerCase();
		const runtimeApi = runtimeApis.find(
			(api) => api.id.toLowerCase() === normalizedApiId || api.name.toLowerCase() === normalizedApiId,
		);

		if (!runtimeApi) {
			throw new BadRequest(`Runtime API '${apiId}' not found.`);
		}

		return runtimeApi;
	}

	private resolveRuntimeMethod(runtimeApi: IRuntimeApiDescription, methodId: string): IRuntimeApiMethod {
		const normalizedMethodId = methodId.toLowerCase();
		const runtimeMethod = runtimeApi.methods.find(
			(method) => method.id.toLowerCase() === normalizedMethodId || method.name.toLowerCase() === normalizedMethodId,
		);

		if (!runtimeMethod) {
			throw new BadRequest(`Runtime API method '${methodId}' not found in '${runtimeApi.name}'.`);
		}

		return runtimeMethod;
	}

	private orderMethodParams(runtimeMethod: IRuntimeApiMethod, params: unknown): unknown[] {
		const paramsObj = this.parseParamsObject(params);
		const entries = Object.entries(paramsObj);
		const providedParams = new Map<string, unknown>();

		for (const [key, value] of entries) {
			providedParams.set(this.normalizeParamKey(key), value);
		}

		if (!runtimeMethod.inputs.length) {
			if (entries.length) {
				throw new BadRequest(
					`Runtime API method '${runtimeMethod.name}' does not take parameters, but ${entries.length.toString()} were provided.`,
				);
			}

			return [];
		}

		const consumed = new Set<string>();
		const ordered = runtimeMethod.inputs.map((input, index) => {
			const acceptedInputKeys = [input.name, input.id, `arg${index}`];
			const acceptedKeys = new Set<string>(acceptedInputKeys.map((key) => this.normalizeParamKey(key)));

			for (const acceptedKey of acceptedKeys) {
				if (providedParams.has(acceptedKey)) {
					consumed.add(acceptedKey);
					return providedParams.get(acceptedKey);
				}
			}

			if (this.isOptionalRuntimeMethodInput(input)) {
				return null;
			}

			throw new BadRequest(
				`Missing parameter for input '${input.name}' on '${runtimeMethod.name}'. Accepted keys: ${acceptedInputKeys
					.map((key) => `'${key}'`)
					.join(', ')}.`,
			);
		});

		const unknownKeys = entries
			.map(([key]) => key)
			.filter((key) => {
				return !consumed.has(this.normalizeParamKey(key));
			});

		if (unknownKeys.length) {
			throw new BadRequest(`Unknown parameter keys for '${runtimeMethod.name}': ${unknownKeys.join(', ')}.`);
		}

		return ordered;
	}

	private parseParamsObject(params: unknown): Record<string, unknown> {
		if (params === undefined || params === null) {
			return {};
		}

		if (typeof params !== 'object' || Array.isArray(params)) {
			throw new BadRequest('Field `params` must be an object keyed by method argument names.');
		}

		return params as Record<string, unknown>;
	}

	private normalizeParamKey(key: string): string {
		return key.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
	}

	private isOptionalRuntimeMethodInput(input: IRuntimeApiMethod['inputs'][number]): boolean {
		return input.type.startsWith('Option<') || input.type === 'Option';
	}

	private mapDeprecationInfo(deprecationInfo: ItemDeprecationInfoV16): IDeprecationInfo {
		if (deprecationInfo.isDeprecated) {
			const { note, since } = deprecationInfo.asDeprecated;
			return {
				type: 'Deprecated',
				note: note.toString(),
				since: since.isSome ? since.unwrap().toString() : null,
			};
		}

		return {
			type: deprecationInfo.type,
			note: null,
			since: null,
		};
	}

	private sanitizeMetadataDocs(docs: { toArray: () => Array<{ toString: () => string }> }): string {
		const docLines = docs
			.toArray()
			.map((doc) => doc.toString())
			.filter(Boolean);

		if (!docLines.length) {
			return '';
		}

		return docLines.join('\n');
	}

	private resolveLookupType(api: RuntimeQueryableApi, typeId: string): string {
		const lookupId = Number(typeId);

		if (!Number.isFinite(lookupId)) {
			return typeId;
		}

		try {
			const typeDef = api.registry.lookup.getTypeDef(lookupId);

			return typeDef.type || 'Unknown';
		} catch {
			return typeId;
		}
	}

	private async getAt(hash: BlockHash) {
		const { number } = await this.api.rpc.chain.getHeader(hash);

		return {
			hash,
			height: number.unwrap().toString(10),
		};
	}
}
