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

import { Option } from '@polkadot/types';
import { Hash } from '@polkadot/types/interfaces';
import type {
	PalletStakingRewardDestination,
	PalletStakingSlashingSlashingSpans,
	SpStakingExposure,
	SpStakingExposurePage,
	SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';

import { kusamaRegistryV1002000, polkadotRegistryV1002000 } from '../../../../test-helpers/registries';
import { erasStakersPagedHex } from '../data/erasStakersPaged';

export const stakingClaimedRewardsMockedCall = (era: number): string[] => {
	if (era === 6512 || era === 6555) {
		return [];
	} else {
		return ['0'];
	}
};

export const stakingerasStakersOverviewMockedCall = (era: number): Promise<Option<SpStakingPagedExposureMetadata>> => {
	return Promise.resolve().then(() => {
		if (era === 6512 || era === 6513) {
			return kusamaRegistryV1002000.createType('Option<SpStakingPagedExposureMetadata>', null);
		} else {
			return kusamaRegistryV1002000.createType('Option<SpStakingPagedExposureMetadata>', {
				total: 140425643066389,
				own: 5340420989561,
				nominatorCount: 187,
				pageCount: 1,
			});
		}
	});
};

export const stakingslashingSpansMockedCall = (
	_hash: Hash,
	_address: string,
): Promise<Option<PalletStakingSlashingSlashingSpans>> =>
	Promise.resolve().then(() =>
		kusamaRegistryV1002000.createType('Option<PalletStakingSlashingSlashingSpans>', {
			spanIndex: 9,
			lastStart: 2251,
			lastNonzeroSlash: 2249,
			prior: [1, 750],
		}),
	);

export const stakingPayeeMockedCall = (
	_hash: Hash,
	_address: string,
): Promise<Option<PalletStakingRewardDestination>> =>
	Promise.resolve().then(() =>
		kusamaRegistryV1002000.createType('Option<PalletStakingRewardDestination>', {
			Account: 'GLEJRAEdGxLhNEH2AWAtjhUYVrcRWxbYSemvVv2JwxBG2fg',
		}),
	);

const kusamaStakersTotal = kusamaRegistryV1002000.createType('Compact<u128>', 1362722538670121);
const kusamaStakersOwn = kusamaRegistryV1002000.createType('Compact<u128>', 5340420989561);
const kusamaStakersOthers = kusamaRegistryV1002000.createType('Vec<SpStakingIndividualExposure>', []);

export const kusamaErasStakersMockedCall = (_era: number, _address: string): Promise<SpStakingExposure> => {
	return Promise.resolve().then(() => {
		return polkadotRegistryV1002000.createType('SpStakingExposure', {
			total: kusamaStakersTotal,
			own: kusamaStakersOwn,
			others: kusamaStakersOthers,
		});
	});
};

export const polkadotClaimedRewardsMockedCall = (era: number): string[] => {
	if (
		era === 1419 ||
		era === 1421 ||
		era === 1423 ||
		(era >= 1426 && era <= 1449) ||
		era === 1458 ||
		(era >= 1460 && era <= 1465) ||
		era === 1468
	) {
		return ['0'];
	} else if (
		era === 1420 ||
		era === 1422 ||
		era === 1424 ||
		era === 1425 ||
		(era >= 1450 && era <= 1457) ||
		era === 1459 ||
		era === 1466 ||
		era === 1467
	) {
		return ['0', '1'];
	} else {
		return [];
	}
};

export const polkadotErasStakersOverviewMockedCall = (era: number): Promise<Option<SpStakingPagedExposureMetadata>> => {
	return Promise.resolve().then(() => {
		if (era === 1421 || era === 1423 || (era >= 1426 && era <= 1449) || era === 1458 || (era >= 1460 && era <= 1465)) {
			return polkadotRegistryV1002000.createType('Option<SpStakingPagedExposureMetadata>', {
				total: 140425643066389,
				own: 5340420989561,
				nominatorCount: 187,
				pageCount: 1,
			});
		} else if (
			era === 1420 ||
			era === 1422 ||
			era === 1424 ||
			era === 1425 ||
			(era >= 1450 && era <= 1457) ||
			era === 1459 ||
			(era >= 1466 && era <= 1470)
		) {
			return polkadotRegistryV1002000.createType('Option<SpStakingPagedExposureMetadata>', {
				total: 140425643066389,
				own: 5340420989561,
				nominatorCount: 187,
				pageCount: 2,
			});
		} else {
			return polkadotRegistryV1002000.createType('Option<SpStakingPagedExposureMetadata>', null);
		}
	});
};

const stakersTotal = polkadotRegistryV1002000.createType('Compact<u128>', 140425643066389);
const stakersOwn = polkadotRegistryV1002000.createType('Compact<u128>', 7749798828817);
const stakersOthers = polkadotRegistryV1002000.createType('Vec<SpStakingIndividualExposure>', []);

export const polkadotErasStakersMockedCall = (_era: number, _address: string): Promise<SpStakingExposure> => {
	return Promise.resolve().then(() => {
		return polkadotRegistryV1002000.createType('SpStakingExposure', {
			total: stakersTotal,
			own: stakersOwn,
			others: stakersOthers,
		});
	});
};

export const polkadotErasStakersPagedMockedCall = (
	_era: number,
	_address: string,
): Promise<Option<SpStakingExposurePage>> => {
	return Promise.resolve().then(() => {
		return polkadotRegistryV1002000.createType('Option<SpStakingExposurePage>', erasStakersPagedHex);
	});
};

export const polkadotPayeeMockedCall = (
	_hash: Hash,
	_address: string,
): Promise<Option<PalletStakingRewardDestination>> =>
	Promise.resolve().then(() =>
		polkadotRegistryV1002000.createType('Option<PalletStakingRewardDestination>', {
			Account: '144A3ErZsuQsHauKCRxbrcySvTPEnQNVshpxa2kQ1DrYPPG',
		}),
	);

export const polkadotSlashingSpansMockedCall = (
	_hash: Hash,
	_address: string,
): Promise<Option<PalletStakingSlashingSlashingSpans>> =>
	Promise.resolve().then(() =>
		kusamaRegistryV1002000.createType('Option<PalletStakingSlashingSlashingSpans>', {
			spanIndex: 1,
			lastStart: 225,
			lastNonzeroSlash: 0,
			prior: [29],
		}),
	);
