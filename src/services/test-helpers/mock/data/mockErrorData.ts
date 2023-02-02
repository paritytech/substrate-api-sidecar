import { polkadotRegistryV9300 } from '../../../../test-helpers/registries';

export const getPalletErrors = {
	democracy: {
		ValueLow: {
			meta: {
				name: 'ValueLow',
				fields: [],
				index: polkadotRegistryV9300.createType('u8', 0),
				docs: polkadotRegistryV9300.createType('Vec<Text>', ['Value too low']),
				args: [],
			},
		},
		ProposalMissing: {
			meta: {
				name: 'ProposalMissing',
				fields: [],
				index: polkadotRegistryV9300.createType('u8', 1),
				docs: polkadotRegistryV9300.createType('Vec<Text>', [
					'Proposal does not exist',
				]),
				args: [],
			},
		},
		InsufficientFunds: {
			meta: {
				name: 'InsufficientFunds',
				fields: [],
				index: polkadotRegistryV9300.createType('u8', 26),
				docs: polkadotRegistryV9300.createType('Vec<Text>', [
					'Too high a balance was provided that the account cannot afford.',
				]),
				args: [],
			},
		},
	},
};
