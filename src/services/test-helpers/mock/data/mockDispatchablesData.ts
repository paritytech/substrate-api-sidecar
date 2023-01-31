// import { polkadotRegistryV9300 } from '../../../../test-helpers/registries';

export const getPalletDispatchables = {
	democracy: {
		propose: {
			name: "propose",
			fields: [
				{
					name: "proposal",
					type: "180",
					typeName: "BoundedCallOf<T>",
					docs: []
				},
				{
					name: "value",
					type: "58",
					typeName: "BalanceOf<T>",
					docs: []
				}
			],
			index: "0",
			docs: [
				"Propose a sensitive action to be taken.",
				"",
				"The dispatch origin of this call must be _Signed_ and the sender must",
				"have funds to cover the deposit.",
				"",
				"- `proposal_hash`: The hash of the proposal preimage.",
				"- `value`: The amount of deposit (must be at least `MinimumDeposit`).",
				"",
				"Emits `Proposed`."
			],
			args: [
				{
					name: "proposal",
					type: "FrameSupportPreimagesBounded",
					typeName: "BoundedCallOf"
				},
				{
					name: "value",
					type: "Compact<u128>",
					typeName: "BalanceOf"
				}
			]
		},
		second: {
			name: "second",
			fields: [
				{
					name: "proposal",
					type: "125",
					typeName: "PropIndex",
					docs: []
				}
			],
			index: "1",
			docs: [
				"Signals agreement with a particular proposal.",
				"",
				"The dispatch origin of this call must be _Signed_ and the sender",
				"must have funds to cover the deposit, equal to the original deposit.",
				"",
				"- `proposal`: The index of the proposal to second."
			],
			args: [
				{
					name: "proposal",
					type: "Compact<u32>",
					typeName: "PropIndex"
				}
			]
		},
		vote: {
			name: "vote",
			fields: [
				{
					name: "ref_index",
					type: "125",
					typeName: "ReferendumIndex",
					docs: []
				},
				{
					name: "vote",
					type: "63",
					typeName: "AccountVote<BalanceOf<T>>",
					docs: []
				}
			],
			index: "2",
			docs: [
				"Vote in a referendum. If `vote.is_aye()`, the vote is to enact the proposal;",
				"otherwise it is a vote to keep the status quo.",
				"",
				"The dispatch origin of this call must be _Signed_.",
				"",
				"- `ref_index`: The index of the referendum to vote for.",
				"- `vote`: The vote configuration."
			],
			args: [
				{
					name: "refIndex",
					type: "Compact<u32>",
					typeName: "ReferendumIndex"
				},
				{
					name: "vote",
					type: "PalletDemocracyVoteAccountVote",
					typeName: "AccountVote"
				}
			]
		},
	},
};
