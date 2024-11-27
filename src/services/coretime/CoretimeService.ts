/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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

// import { QueryableModuleStorage } from '@polkadot/api/types';
import { ApiDecoration, QueryableModuleStorage } from '@polkadot/api/types';
import { Option, StorageKey, U16, U32, Vec } from '@polkadot/types';
import { BlockHash } from '@polkadot/types/interfaces';
import {
	PalletBrokerConfigRecord,
	PalletBrokerLeaseRecordItem,
	PalletBrokerPotentialRenewalId,
	PalletBrokerPotentialRenewalRecord,
	PalletBrokerRegionId,
	PalletBrokerRegionRecord,
	PalletBrokerSaleInfoRecord,
	PalletBrokerScheduleItem,
	PalletBrokerStatusRecord,
	PolkadotRuntimeParachainsAssignerCoretimeQueueDescriptor,
	PolkadotRuntimeParachainsAssignerCoretimeWorkState,
} from '@polkadot/types/lookup';

import { AbstractService } from '../AbstractService';
import {
	extractConfigInfo,
	extractLeaseInfo,
	extractPotentialRenewalInfo,
	extractRegionInfo,
	extractReservationInfo,
	extractSaleInfo,
	extractStatusInfo,
	extractWorkloadInfo,
	extractWorkplanInfo,
	sortByCore,
	TLeaseInfo,
	TPotentialRenewalInfo,
	TRegionInfo,
	TReservationInfo,
	TSaleInfo,
	TWorkloadInfo,
	TWorkplanInfo,
} from './util';

enum ChainType {
	Relay = 'Relay',
	Parachain = 'Parachain',
}

interface LeaseWithCore extends TLeaseInfo {
	core: number;
}

export class CoretimeService extends AbstractService {
	private getAndDecodeRegions = async (api: ApiDecoration<'promise'>, coreId?: number): Promise<TRegionInfo[]> => {
		const regions = await api.query.broker.regions.entries();
		const regs = regions as unknown as [StorageKey<[PalletBrokerRegionId]>, Option<PalletBrokerRegionRecord>][];
		return regs.map((region) => {
			return extractRegionInfo([region[0], region[1]]);
		});
	};

	private getAndDecodeLeases = async (api: ApiDecoration<'promise'>, coreId?: number): Promise<TLeaseInfo[]> => {
		const leases = await api.query.broker.leases();

		return (leases as unknown as Vec<PalletBrokerLeaseRecordItem>).map((lease) => extractLeaseInfo(lease));
	};

	private getAndDecodeWorkload = async (api: ApiDecoration<'promise'>, coreId?: number): Promise<TWorkloadInfo[]> => {
		const workloads = await api.query.broker.workload.entries();

		const wls = workloads as unknown as [StorageKey<[U32]>, Vec<PalletBrokerScheduleItem>][];
		return sortByCore(
			wls.map((workload) => {
				return extractWorkloadInfo(workload[1], workload[0]);
			}),
		);
	};

	private getAndDecodeWorkplan = async (api: ApiDecoration<'promise'>, coreId?: number): Promise<TWorkplanInfo[]> => {
		const workplans = await api.query.broker.workplan.entries();
		const wpls = workplans as unknown as [StorageKey<[U32, U16]>, Option<Vec<PalletBrokerScheduleItem>>][];
		return sortByCore(
			wpls.map(([key, val]) => {
				const [timeslice, core] = key.args[0].toArray();
				return extractWorkplanInfo(val, core, timeslice);
			}),
		);
	};

	private getAndDecodeSaleInfo = async (api: ApiDecoration<'promise'>): Promise<TSaleInfo | {}> => {
		const saleInfo = (await api.query.broker.saleInfo()) as unknown as Option<PalletBrokerSaleInfoRecord>;
		return saleInfo.unwrap() ? extractSaleInfo(saleInfo.unwrap()) : {};
	};

	private getAndDecodeStatus = async (api: ApiDecoration<'promise'>): Promise<Record<string, unknown>> => {
		const status = await api.query.broker.status();

		return extractStatusInfo(status as unknown as Option<PalletBrokerStatusRecord>);
	};

	private getAndDecodeConfiguration = async (api: ApiDecoration<'promise'>): Promise<Record<string, unknown>> => {
		const configuration = await api.query.broker.configuration();

		return extractConfigInfo(configuration as unknown as Option<PalletBrokerConfigRecord>);
	};

	private getAndDecodePotentialRenewals = async (
		api: ApiDecoration<'promise'>,
		coreId?: number,
	): Promise<(TPotentialRenewalInfo | undefined)[]> => {
		const potentialRenewals = await api.query.broker.potentialRenewals.entries();
		const renewals = potentialRenewals as unknown as [
			StorageKey<[PalletBrokerPotentialRenewalId]>,
			Option<PalletBrokerPotentialRenewalRecord>,
		][];

		return sortByCore(renewals.map((renewal) => extractPotentialRenewalInfo(renewal[1], renewal[0])));
	};

	private getAndDecodeReservations = async (
		api: ApiDecoration<'promise'>,
		coreId?: number,
	): Promise<TReservationInfo[]> => {
		const reservations = await api.query.broker.reservations();

		return (reservations as unknown as Vec<Vec<PalletBrokerScheduleItem>>).map((res) => extractReservationInfo(res));
	};

	// both relay and coretime chain
	async getCoretimeInfo(hash: BlockHash): Promise<unknown> {
		const { api } = this;

		const [{ specName }, { number }, historicApi] = await Promise.all([
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.chain.getHeader(hash),
			api.at(hash),
		]);

		const blockNumber = number.unwrap();

		if (this.getChainType(specName.toString()) === ChainType.Relay) {
			this.assertCoretimeModule(historicApi, ChainType.Relay);

			const [brokerId, palletVersion, coreSchedules, coreDescriptors] = await Promise.all([
				historicApi.consts.coretime.brokerId,
				historicApi.query.coretimeAssignmentProvider.palletVersion(),
				historicApi.query.coretimeAssignmentProvider.coreSchedules.entries(),
				historicApi.query.coretimeAssignmentProvider.coreDescriptors.entries(),
			]);

			const schedules = coreSchedules.reduce((acc, core) => {
				return [...acc, [core[0].toHuman(), core[1].toHuman()]];
			}, []);

			const cores = {
				total: coreDescriptors.length,
				systemReserved: 0,
				leased: 0,
				renewal: 0,
				generalSale: 0,
				availableToPurchase: 0,
			};

			const descriptors = coreDescriptors.reduce((acc, core) => {
				const coreKey = core[0].toHuman();
				const coreValue = core[1] as unknown as {
					queue: Option<PolkadotRuntimeParachainsAssignerCoretimeQueueDescriptor>;
					currentWork: Option<PolkadotRuntimeParachainsAssignerCoretimeWorkState>;
				};

				const currentWork = coreValue.currentWork.unwrapOr(null);
				if (currentWork?.assignments[0].length && currentWork?.assignments[0].length) {
					if (
						coreValue?.currentWork.unwrapOr(null)?.assignments[0][0] &&
						typeof coreValue?.currentWork.unwrapOr(null)?.assignments[0][0] === 'object'
					) {
						if (coreValue?.currentWork.unwrapOr(null)?.assignments[0][0]) {
							const assignment = coreValue?.currentWork.unwrapOr(null)?.assignments[0][0]?.toJSON() as unknown as
								| string
								| Record<string, number>;
							if ('task' in assignment && assignment.task < 2000) {
								cores.systemReserved += 1;
							} else if ('task' in assignment && assignment.task >= 2000 && assignment.task >= 2000) {
								cores.leased += 1;
							}
						}
					}
				}

				return [...acc, [coreKey, coreValue]];
			}, []);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				brokerId: brokerId as unknown,
				palletVersion: palletVersion as unknown,
				coreSchedules: coreSchedules as unknown,
				cores,
			};
		} else {
			// coretime chain or parachain
			this.assertCoretimeModule(historicApi, ChainType.Parachain);
			const [config, status, saleInfo] = await Promise.all([
				this.getAndDecodeConfiguration(historicApi),
				this.getAndDecodeStatus(historicApi),
				this.getAndDecodeSaleInfo(historicApi),
			]);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				configuration: config,
				saleInfo: saleInfo,
				status: status,
			};
		}
	}

	// coretime chain only

	async getCoretimeSaleInfo(hash: BlockHash) {
		const { api } = this;

		const [{ specName }, { number }, historicApi] = await Promise.all([
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.chain.getHeader(hash),
			api.at(hash),
		]);

		const blockNumber = number.unwrap();

		if (this.getChainType(specName.toString()) === ChainType.Relay) {
			throw new Error('This endpoint is only available on coretime chains.');
		} else {
			// coretime chain or parachain
			this.assertCoretimeModule(historicApi, ChainType.Parachain);
			const saleInfo = await this.getAndDecodeSaleInfo(historicApi);
			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				saleInfo: saleInfo,
			};
		}
	}

	async getCoretimeLeases(hash: BlockHash) {
		const { api } = this;

		const [{ specName }, { number }, historicApi] = await Promise.all([
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.chain.getHeader(hash),
			api.at(hash),
		]);

		const blockNumber = number.unwrap();

		if (this.getChainType(specName.toString()) === ChainType.Relay) {
			throw new Error('This endpoint is only available on coretime chains.');
		} else {
			// coretime chain or parachain
			this.assertCoretimeModule(historicApi, ChainType.Parachain);
			const [leases, workload] = await Promise.all([
				this.getAndDecodeLeases(historicApi),
				this.getAndDecodeWorkload(historicApi),
			]);

			const leasesWithCore: LeaseWithCore[] = leases.reduce((acc: LeaseWithCore[], lease) => {
				const core = workload.find((wl) => wl.info.map((el) => el.task).includes(lease.task))?.core;
				return [
					...acc,
					{
						...lease,
						core: core!,
					},
				];
			}, []);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				leases: sortByCore(leasesWithCore),
			};
		}
	}

	async getCoretimeRegions(hash: BlockHash, coreId?: number): Promise<Record<string, unknown>> {
		const { api } = this;

		const [{ specName }, { number }, historicApi] = await Promise.all([
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.chain.getHeader(hash),
			api.at(hash),
		]);
		//  by core? by region? by broker?

		const blockNumber = number.unwrap();

		if (this.getChainType(specName.toString()) === ChainType.Relay) {
			throw new Error('This endpoint is only available on coretime chains.');
		} else {
			// coretime chain or parachain
			this.assertCoretimeModule(historicApi, ChainType.Parachain);

			const regions = await this.getAndDecodeRegions(historicApi);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				regions: regions,
			};
		}
	}

	async getBulkInfo(hash: BlockHash): Promise<Record<string, unknown>> {
		const { api } = this;

		const [{ specName }, { number }, historicApi] = await Promise.all([
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.chain.getHeader(hash),
			api.at(hash),
		]);

		const blockNumber = number.unwrap();

		if (this.getChainType(specName.toString()) === ChainType.Relay) {
			throw new Error('This endpoint is only available on coretime chains.');
		} else {
			// coretime chain or parachain
			this.assertCoretimeModule(historicApi, ChainType.Parachain);
			const [config, potentialRenewals, reservations] = await Promise.all([
				this.getAndDecodeConfiguration(historicApi),
				this.getAndDecodePotentialRenewals(historicApi),
				this.getAndDecodeReservations(historicApi),
			]);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				configuration: config,
				renewals: potentialRenewals,
				reservations: reservations,
			};
		}
	}

	async getCoretimeCores(hash: BlockHash, coreId?: string): Promise<Record<string, unknown>> {
		const { api } = this;

		const [{ specName }, { number }, historicApi] = await Promise.all([
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.chain.getHeader(hash),
			api.at(hash),
		]);

		const blockNumber = number.unwrap();

		if (this.getChainType(specName.toString()) === ChainType.Relay) {
			throw new Error('This endpoint is only available on coretime chains.');
		} else {
			const [workload, workplan, leases, reservations, regions] = await Promise.all([
				this.getAndDecodeWorkload(historicApi, coreId ? parseInt(coreId, 10) : undefined),
				coreId ? this.getAndDecodeWorkplan(historicApi, parseInt(coreId, 10)) : [],
				this.getAndDecodeLeases(historicApi, coreId ? parseInt(coreId, 10) : undefined),
				this.getAndDecodeReservations(historicApi, coreId ? parseInt(coreId, 10) : undefined),
				this.getAndDecodeRegions(historicApi, coreId ? parseInt(coreId, 10) : undefined),
			]);

			const cores = workload.reduce(
				(
					acc: Record<
						number,
						{
							workload: TWorkloadInfo;
							workplan?: TWorkplanInfo[];
							type: {
								condition: 'reservation' | 'lease' | 'ondemand' | 'idle';
								details: typeof reservations | typeof leases;
							};
							regions?: TRegionInfo[];
						}[]
					>,
					wl,
				) => {
					const tasks = wl.info.map((info) => info.task);

					let type = 'unknown';
					let details: unknown[] = [];
					if (leases.find((f) => tasks.includes(f.task))) {
						type = 'lease';
						details = leases.filter((f) => tasks.includes(f.task));
					}
					if (reservations.find((f) => tasks.includes(f.task))) {
						type = 'reservation';
						details = reservations.filter((f) => tasks.includes(f.task));
					}
					const coreRegions = regions.filter((region) => region.core === wl.core);
					console.log(wl.core, type, details, coreRegions);
					// workload
					// workplan,
					// type
					// leases
					// reservations
					/* 
						cores => 
							current load
							regions	
							type of core

						core/:id => 
							current load
							regions	
							type of core
							workplan
							leases
							reservations
					*/
					// if (acc[wl.core]) {
					// 	acc[wl.core] = [
					// 		...acc[wl.core],
					// 		{
					// 			workload: wl,
					// 			workplan: workplan.filter((wp) => wp.core === wl.core),
					// 			regions: regions.filter((region) => region.core === wl.core),
					// 		},
					// 	];
					// } else {
					// 	acc[wl.core] = [
					// 		{
					// 			workload: wl,
					// 			workplan: workplan.filter((wp) => wp.core === wl.core) || [],
					// 			regions: regions.filter((region) => region.core === wl.core) || [],
					// 		},
					// 	];
					// }
					// return acc;
					return acc;
				},
				{},
			);
			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				cores,
			};
		}
	}

	// relay chain only
	async getCoretimeParachains(hash: BlockHash) {
		const { api } = this;

		const [{ specName }, { number }, historicApi] = await Promise.all([
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.chain.getHeader(hash),
			api.at(hash),
		]);

		const blockNumber = number.unwrap();

		if (this.getChainType(specName.toString()) === ChainType.Relay) {
			this.assertCoretimeModule(historicApi, ChainType.Relay);

			const [coreSchedules, coreDescriptors] = await Promise.all([
				historicApi.query.coretimeAssignmentProvider.coreSchedules.entries(),
				historicApi.query.coretimeAssignmentProvider.coreDescriptors.multi,
			]);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				coreSchedules: coreSchedules as unknown,
				coreDescriptors: coreDescriptors as unknown,
			};
		} else {
			throw new Error('This endpoint is only available on relay chains.');
		}
	}
	/**
	 * Coretime pallets and modules are not available on all runtimes. This
	 * verifies that by checking if the module exists. If it doesnt it will throw an error
	 *
	 * @param queryFn The QueryModuleStorage key that we want to check exists
	 * @param mod Module we are checking
	 */
	private assertQueryModule(queryFn: QueryableModuleStorage<'promise'>, mod: string): void {
		if (!queryFn) {
			throw Error(`The runtime does not include the ${mod} module at this block`);
		}
	}

	private getChainType(specName: string): ChainType {
		const relay = ['polkadot', 'kusama', 'westend', 'rococo', 'paseo'];
		if (relay.includes(specName.toLowerCase())) {
			return ChainType.Relay;
		} else {
			return ChainType.Parachain;
		}
	}

	private assertCoretimeModule = (api: ApiDecoration<'promise'>, chainType: ChainType) => {
		if (chainType === ChainType.Relay) {
			this.assertQueryModule(api.query.onDemandAssignmentProvider, 'onDemandAssignmentProvider');
			this.assertQueryModule(api.query.coretimeAssignmentProvider, 'coretimeAssignmentProvider');
			return;
		} else if (chainType === ChainType.Parachain) {
			this.assertQueryModule(api.query.broker, 'broker');
			return;
		}
		throw new Error('Unsupported network type.');
	};
}
