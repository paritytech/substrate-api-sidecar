// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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

import { polkadotRegistryV9300 } from '../../../../test-helpers/registries';

export const getPalletDispatchables = {
	democracy: {
		propose: {
			meta: {
				name: 'propose',
				fields: [
					{
						name: 'proposal',
						type: '180',
						typeName: 'BoundedCallOf<T>',
						docs: [],
					},
					{
						name: 'value',
						type: '58',
						typeName: 'BalanceOf<T>',
						docs: [],
					},
				],
				index: polkadotRegistryV9300.createType('u8', 0),
				docs: [
					'Propose a sensitive action to be taken.',
					'',
					'The dispatch origin of this call must be _Signed_ and the sender must',
					'have funds to cover the deposit.',
					'',
					'- `proposal_hash`: The hash of the proposal preimage.',
					'- `value`: The amount of deposit (must be at least `MinimumDeposit`).',
					'',
					'Emits `Proposed`.',
				],
				args: [
					{
						name: 'proposal',
						type: 'FrameSupportPreimagesBounded',
						typeName: 'BoundedCallOf',
					},
					{
						name: 'value',
						type: 'Compact<u128>',
						typeName: 'BalanceOf',
					},
				],
			},
		},
		second: {
			meta: {
				name: 'second',
				fields: [
					{
						name: 'proposal',
						type: '125',
						typeName: 'PropIndex',
						docs: [],
					},
				],
				index: polkadotRegistryV9300.createType('u8', 1),
				docs: [
					'Signals agreement with a particular proposal.',
					'',
					'The dispatch origin of this call must be _Signed_ and the sender',
					'must have funds to cover the deposit, equal to the original deposit.',
					'',
					'- `proposal`: The index of the proposal to second.',
				],
				args: [
					{
						name: 'proposal',
						type: 'Compact<u32>',
						typeName: 'PropIndex',
					},
				],
			},
		},
		vote: {
			meta: {
				name: 'vote',
				fields: [
					{
						name: 'ref_index',
						type: '125',
						typeName: 'ReferendumIndex',
						docs: [],
					},
					{
						name: 'vote',
						type: '63',
						typeName: 'AccountVote<BalanceOf<T>>',
						docs: [],
					},
				],
				index: polkadotRegistryV9300.createType('u8', 2),
				docs: [
					'Vote in a referendum. If `vote.is_aye()`, the vote is to enact the proposal;',
					'otherwise it is a vote to keep the status quo.',
					'',
					'The dispatch origin of this call must be _Signed_.',
					'',
					'- `ref_index`: The index of the referendum to vote for.',
					'- `vote`: The vote configuration.',
				],
				args: [
					{
						name: 'refIndex',
						type: 'Compact<u32>',
						typeName: 'ReferendumIndex',
					},
					{
						name: 'vote',
						type: 'PalletDemocracyVoteAccountVote',
						typeName: 'AccountVote',
					},
				],
			},
		},
	},
};
