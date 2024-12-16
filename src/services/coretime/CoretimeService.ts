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
import { Option, StorageKey, U16, U32, u32, Vec } from '@polkadot/types';
import { BlockHash, ParaId } from '@polkadot/types/interfaces';
import {
	PalletBrokerConfigRecord,
	PalletBrokerLeaseRecordItem,
	PalletBrokerPotentialRenewalId,
	PalletBrokerPotentialRenewalRecord,
	PalletBrokerRegionId,
	PalletBrokerRegionRecord,
	PalletBrokerSaleInfoRecord,
	PalletBrokerScheduleItem,
	PolkadotRuntimeParachainsAssignerCoretimeCoreDescriptor,
	PolkadotRuntimeParachainsParasParaLifecycle,
} from '@polkadot/types/lookup';

import {
	ICoretimeCores,
	ICoretimeInfo,
	ICoretimeLeases,
	ICoretimeRegions,
	ICoretimeRenewals,
	ICoretimeReservations,
	LeaseWithCore,
	TConfigInfo,
	TCoreDescriptor,
	TLeaseInfo,
	TParaLifecycle,
	TPotentialRenewalInfo,
	TRegionInfo,
	TReservationInfo,
	TSaleInfo,
	TWorkloadInfo,
	TWorkplanInfo,
} from '../../types/responses';
import { AbstractService } from '../AbstractService';
import {
	extractConfigInfo,
	extractCoreDescriptorInfo,
	extractLeaseInfo,
	extractParachainLifecycleInfo,
	extractPotentialRenewalInfo,
	extractRegionInfo,
	extractReservationInfo,
	extractSaleInfo,
	extractWorkloadInfo,
	extractWorkplanInfo,
	sortByCore,
} from './util';

enum ChainType {
	Relay = 'Relay',
	Parachain = 'Parachain',
}

export class CoretimeService extends AbstractService {
	private getAndDecodeRegions = async (api: ApiDecoration<'promise'>, coreId?: number): Promise<TRegionInfo[]> => {
		const regions = await api.query.broker.regions.entries();
		const regs = regions as unknown as [StorageKey<[PalletBrokerRegionId]>, Option<PalletBrokerRegionRecord>][];

		const regionsInfo = regs.map((region) => {
			return extractRegionInfo([region[0], region[1]]);
		});

		return typeof coreId === 'number' ? regionsInfo.filter((region) => region.core === coreId) : regionsInfo;
	};

	private getAndDecodeLeases = async (api: ApiDecoration<'promise'>): Promise<TLeaseInfo[]> => {
		const leases = await api.query.broker.leases();
		return (leases as unknown as Vec<PalletBrokerLeaseRecordItem>).map((lease) => extractLeaseInfo(lease));
	};

	private getAndDecodeWorkload = async (api: ApiDecoration<'promise'>, coreId?: number): Promise<TWorkloadInfo[]> => {
		if (coreId) {
			const workload = await api.query.broker.workload.multi([coreId]);
			const wls = workload as unknown as [Vec<PalletBrokerScheduleItem>];
			return sortByCore(
				wls.map((workload) => {
					return extractWorkloadInfo(workload, coreId);
				}),
			);
		}

		const workloads = await api.query.broker.workload.entries();

		const wls = workloads as unknown as [StorageKey<[U32]>, Vec<PalletBrokerScheduleItem>][];
		return sortByCore(
			wls.map((workload) => {
				return extractWorkloadInfo(workload[1], workload[0].args[0].toNumber());
			}),
		);
	};

	private getAndDecodeWorkplan = async (api: ApiDecoration<'promise'>, coreId?: number): Promise<TWorkplanInfo[]> => {
		const workplans = await api.query.broker.workplan.entries();
		const wpls = workplans as unknown as [StorageKey<[U32, U16]>, Option<Vec<PalletBrokerScheduleItem>>][];
		const wplsInfo = sortByCore(
			wpls.map(([key, val]) => {
				const [timeslice, core] = key.args[0].toArray();
				return extractWorkplanInfo(val, core, timeslice);
			}),
		);

		return typeof coreId === 'number' ? wplsInfo.filter((workplan) => workplan.core === coreId) : wplsInfo;
	};

	private getAndDecodeSaleInfo = async (api: ApiDecoration<'promise'>): Promise<TSaleInfo | null> => {
		const saleInfo = (await api.query.broker.saleInfo()) as unknown as Option<PalletBrokerSaleInfoRecord>;
		return saleInfo.isSome ? extractSaleInfo(saleInfo.unwrap()) : null;
	};

	private getSalePhase = (blockNumber: number, saleInfo: TSaleInfo): string => {
		if (blockNumber < saleInfo.saleStart) {
			return 'interlude';
		} else if (blockNumber < saleInfo.saleStart + saleInfo.leadinLength) {
			return 'leadin';
		} else {
			return 'regular';
		}
	};

	// private getAndDecodeStatus = async (api: ApiDecoration<'promise'>): Promise<TStatusInfo> => {
	// 	const status = await api.query.broker.status();

	// 	return extractStatusInfo(status as unknown as Option<PalletBrokerStatusRecord>);
	// };

	private getAndDecodeConfiguration = async (api: ApiDecoration<'promise'>): Promise<TConfigInfo> => {
		const configuration = await api.query.broker.configuration();

		return extractConfigInfo(configuration as unknown as Option<PalletBrokerConfigRecord>);
	};

	private getAndDecodePotentialRenewals = async (
		api: ApiDecoration<'promise'>,
		coreId?: number,
	): Promise<TPotentialRenewalInfo[]> => {
		const potentialRenewals = await api.query.broker.potentialRenewals.entries();
		const renewals = potentialRenewals as unknown as [
			StorageKey<[PalletBrokerPotentialRenewalId]>,
			Option<PalletBrokerPotentialRenewalRecord>,
		][];
		const potentialRenewalsInfo = sortByCore(
			renewals.map((renewal) => extractPotentialRenewalInfo(renewal[1], renewal[0])),
		);

		return typeof coreId === 'number'
			? potentialRenewalsInfo.filter((renewal) => renewal.core === coreId)
			: potentialRenewalsInfo;
	};

	private getAndDecodeReservations = async (api: ApiDecoration<'promise'>): Promise<TReservationInfo[]> => {
		const reservations = await api.query.broker.reservations();

		return (reservations as unknown as Vec<Vec<PalletBrokerScheduleItem>>).map((res) => extractReservationInfo(res));
	};

	private getAndDecodeCoreSchedules = async (api: ApiDecoration<'promise'>): Promise<Record<string, unknown>[]> => {
		const coreSchedules = await api.query.coretimeAssignmentProvider.coreSchedules.entries();
		return coreSchedules as unknown as Record<string, unknown>[];
	};

	private getAndDecodeCoreDescriptors = async (api: ApiDecoration<'promise'>): Promise<TCoreDescriptor[]> => {
		const coreDescriptors = await api.query.coretimeAssignmentProvider.coreDescriptors.entries();

		const descriptors = coreDescriptors as unknown as [
			StorageKey<[u32]>,
			PolkadotRuntimeParachainsAssignerCoretimeCoreDescriptor,
		][];
		return descriptors.map((descriptor) => extractCoreDescriptorInfo(descriptor[0], descriptor[1]));
	};

	private getAndDecodeParachainsLifecycle = async (api: ApiDecoration<'promise'>): Promise<TParaLifecycle[]> => {
		const parachains = await api.query.paras.paraLifecycles.entries();
		return parachains.map((para) =>
			extractParachainLifecycleInfo(
				para[0] as unknown as StorageKey<[ParaId]>,
				para[1] as unknown as Option<PolkadotRuntimeParachainsParasParaLifecycle>,
			),
		);
	};

	// both relay and coretime chain
	async getCoretimeInfo(hash: BlockHash): Promise<ICoretimeInfo> {
		const { api } = this;

		const [{ specName }, { number }, historicApi] = await Promise.all([
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.chain.getHeader(hash),
			api.at(hash),
		]);

		const blockNumber = number.unwrap();

		if (this.getChainType(specName.toString()) === ChainType.Relay) {
			this.assertCoretimeModule(historicApi, ChainType.Relay);

			const [brokerId, maxHistoricalRevenue, palletVersion] = await Promise.all([
				historicApi.consts.coretime.brokerId,
				historicApi.consts.onDemandAssignmentProvider.maxHistoricalRevenue,
				historicApi.query.coretimeAssignmentProvider.palletVersion(),
			]);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				brokerId: brokerId as unknown as number,
				palletVersion: palletVersion as unknown as number,
				maxHistoricalRevenue: maxHistoricalRevenue as unknown as number,
			};
		} else {
			// coretime chain or parachain
			this.assertCoretimeModule(historicApi, ChainType.Parachain);
			const [config, saleInfo, timeslicePeriod] = await Promise.all([
				this.getAndDecodeConfiguration(historicApi),
				this.getAndDecodeSaleInfo(historicApi),
				historicApi.consts.broker.timeslicePeriod,
			]);

			const blocksPerTimeslice = timeslicePeriod as unknown as U32;

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				configuration: config,
				...(saleInfo && {
					saleInfo: {
						phase: saleInfo ? this.getSalePhase(blockNumber.toNumber(), saleInfo) : 'unknown',
						...saleInfo,
						RelayBlocksPerTimeslice: blocksPerTimeslice.toNumber(),
					},
				}),
			};
		}
	}

	async getCoretimeLeases(hash: BlockHash): Promise<ICoretimeLeases> {
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
				const core = workload.find((wl) => wl.info.task.includes(lease.task))?.core;
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

	async getCoretimeRegions(hash: BlockHash, coreId?: number): Promise<ICoretimeRegions> {
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

			const regions = await this.getAndDecodeRegions(historicApi, coreId);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				regions: sortByCore(regions),
			};
		}
	}

	async getCoretimeReservations(hash: BlockHash): Promise<ICoretimeReservations> {
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

			const reservations = await this.getAndDecodeReservations(historicApi);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				reservations,
			};
		}
	}

	async getCoretimeRenewals(hash: BlockHash, coreId?: number): Promise<ICoretimeRenewals> {
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

			const renewals = await this.getAndDecodePotentialRenewals(historicApi, coreId);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				renewals: sortByCore(renewals),
			};
		}
	}

	async getCoretimeCores(hash: BlockHash, coreId?: string): Promise<ICoretimeCores> {
		const { api } = this;

		const [{ specName }, { number }, historicApi] = await Promise.all([
			api.rpc.state.getRuntimeVersion(hash),
			api.rpc.chain.getHeader(hash),
			api.at(hash),
		]);

		const blockNumber = number.unwrap();

		if (this.getChainType(specName.toString()) === ChainType.Relay) {
			const [parachains, schedules, descriptors] = await Promise.all([
				this.getAndDecodeParachainsLifecycle(historicApi),
				this.getAndDecodeCoreSchedules(historicApi),
				this.getAndDecodeCoreDescriptors(historicApi),
			]);

			const descriptorsWithParas = parachains.reduce<(TParaLifecycle & TCoreDescriptor)[]>((acc, para) => {
				const core = descriptors.find((f) => {
					const assignments = f.info.currentWork.assignments.find((assgn) => assgn.task === para.paraId.toString());
					return !!assignments;
				});
				if (core) {
					acc.push({
						...para,
						...core,
					});
				}
				return acc;
			}, []);

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				coreDescriptors: descriptorsWithParas,
				coreSchedules: schedules,
			};
		} else {
			const [workload, workplan, leases, reservations, regions] = await Promise.all([
				this.getAndDecodeWorkload(historicApi, coreId ? parseInt(coreId, 10) : undefined),
				coreId ? this.getAndDecodeWorkplan(historicApi, parseInt(coreId, 10)) : [],
				this.getAndDecodeLeases(historicApi),
				this.getAndDecodeReservations(historicApi),
				this.getAndDecodeRegions(historicApi, coreId ? parseInt(coreId, 10) : undefined),
			]);

			const systemParas = reservations.map((el) => el.task);
			const cores = [];

			if (coreId) {
				const coreType = systemParas.includes(workload[0].info.task)
					? workload[0].info.task === 'Pool'
						? 'ondemand'
						: 'reservation'
					: leases.map((f) => f.task).includes(workload[0].info.task)
						? 'lease'
						: 'bulk';

				cores.push({
					coreId,
					taskId: workload[0].info.task,
					workload: workload[0].info,
					workplan: workplan,
					type: {
						condition: coreType,
						details:
							coreType === 'reservation'
								? { mask: reservations.find((f) => f.task === workload[0].info.task)?.mask }
								: coreType === 'lease'
									? { until: leases.find((f) => f.task === workload[0].info.task)?.until }
									: undefined,
					},
					regions,
				});
			} else {
				workload.map((wl) => {
					const coreType = systemParas.includes(wl.info.task)
						? wl.info.task === 'Pool'
							? 'ondemand'
							: 'reservation'
						: leases.map((f) => f.task).includes(wl.info.task)
							? 'lease'
							: 'bulk';

					let details = undefined;

					if (coreType === 'reservation') {
						details = { mask: reservations.find((f) => f.task === wl.info.task)?.mask };
					} else if (coreType === 'lease') {
						details = { until: leases.find((f) => f.task === wl.info.task)?.until };
					}

					const coreRegions = regions.filter((region) => region.core === wl.core);
					cores.push({
						coreId: wl.core,
						taskId: wl.info.task,
						workload: wl.info,
						type: { condition: coreType, details },
						regions: coreRegions,
					});
				});
			}

			return {
				at: {
					hash,
					height: blockNumber.toString(10),
				},
				cores,
			};
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
