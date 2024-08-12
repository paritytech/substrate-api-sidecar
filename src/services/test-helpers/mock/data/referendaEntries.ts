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

import { polkadotMetadataRpcV1000001 } from '../../../../test-helpers/metadata/polkadotV1000001Metadata';
import { polkadotRegistryV1000001 } from '../../../../test-helpers/registries';
import { createApiWithAugmentations, TypeFactory } from '../../../../test-helpers/typeFactory';

const typeFactoryApiV9370 = createApiWithAugmentations(polkadotMetadataRpcV1000001);
const factory = new TypeFactory(typeFactoryApiV9370);

export const referendaEntries = () => {
	function createReferendumKey(key: string) {
		return factory.storageKey(key, 'u32', typeFactoryApiV9370.query.referenda.referendumInfoFor);
	}

	function createReferendumInfo(
		decisionDeposit: { who: string; amount: string } | null,
		submitted: number,
		deciding: { since: number; confirming: number | null } | null,
		enactment: { after: number } | { at: number },
	) {
		const decisionDepositVal =
			decisionDeposit === null
				? null
				: {
						amount:
							decisionDeposit.amount === null
								? null
								: polkadotRegistryV1000001.createType('Balance', decisionDeposit.amount),
						who: polkadotRegistryV1000001.createType('AccountId', decisionDeposit.who),
				  };
		const decidingVal =
			deciding === null
				? null
				: {
						confirming:
							deciding.confirming === null
								? null
								: polkadotRegistryV1000001.createType('Compact<BlockNumber>', deciding.confirming),
						since: polkadotRegistryV1000001.createType('Compact<BlockNumber>', deciding.since),
				  };

		const onGoingRefInfo = {
			ongoing: {
				decisionDeposit: decisionDepositVal,
				enactment: enactment,
				submitted: polkadotRegistryV1000001.createType('Compact<BlockNumber>', submitted),
				deciding: decidingVal,
			},
		};
		const onGoingRefInfoEntry = polkadotRegistryV1000001.createType(
			'Option<PalletReferendaReferendumInfo>',
			onGoingRefInfo,
		);
		return onGoingRefInfoEntry;
	}

	const referendaEntries = [];
	for (let i = 0; i < 7; i++) {
		const referendaIds = ['890', '857', '841', '852', '872', '832', '888'];
		const referendumKey = createReferendumKey(referendaIds[i]);

		const decisionDeposit = [
			null,
			{ who: '1EpEiYpWRAWmte4oPLtR5B1TZFxcBShBdjK4X9wWnq2KfLK', amount: '1000000000000000' },
			{ who: '13sDzot2hwoEAzXJiNe3cBiMEq19XRqrS3DMAxt9jiSNKMkA', amount: '100000000000000' },
			null,
			{ who: '13sDzot2hwoEAzXJiNe3cBiMEq19XRqrS3DMAxt9jiSNKMkA', amount: '100000000000000' },
			{ who: '13sDzot2hwoEAzXJiNe3cBiMEq19XRqrS3DMAxt9jiSNKMkA', amount: '1000000000000000' },
			{ who: '13RKipguGKrVofVeLgMJTThA8dzJvT6Ce1jycY4Nm8cwitsQ', amount: '100000000000000' },
		];
		const enactment = [
			{ after: 10 },
			{ after: 100 },
			{ at: 21455000 },
			{ after: 100 },
			{ at: 21558000 },
			{ after: 10 },
			{ after: 10 },
		];
		const submitted = [21274219, 21171395, 21108384, 21157690, 21212837, 21070067, 21268637];
		const deciding = [
			null,
			null,
			{ since: 21109667, confirming: 21275466 },
			null,
			{ since: 21214334, confirming: null },
			{ since: 21071802, confirming: null },
			{ since: 21269732, confirming: null },
		];
		const referendumInfo = createReferendumInfo(decisionDeposit[i], submitted[i], deciding[i], enactment[i]);

		referendaEntries.push([referendumKey, referendumInfo]);
	}

	return referendaEntries;
};
