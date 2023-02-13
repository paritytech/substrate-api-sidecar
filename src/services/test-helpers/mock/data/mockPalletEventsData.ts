import { polkadotRegistryV9300 } from '../../../../test-helpers/registries';

export const getPalletEvents = {
	democracy: {
		Proposed: {
			meta: {
				name: 'Proposed',
				fields: polkadotRegistryV9300.createType('Vec<Si1Field>', [
					{
						name: null,
						type: '127',
						typeName: null,
						docs: [],
					},
					{
						name: null,
						type: '41',
						typeName: null,
						docs: [],
					},
				]),
				index: polkadotRegistryV9300.createType('u8', 0),
				docs: polkadotRegistryV9300.createType('Vec<Text>', [
					' A motion has been proposed by a public account.',
				]),
				args: polkadotRegistryV9300.createType('Vec<Text>', [
					'PropIndex',
					'Balance',
				]),
			},
		},
		Tabled: {
			meta: {
				name: 'Tabled',
				fields: polkadotRegistryV9300.createType('Vec<Si1Field>', [
					{
						name: null,
						type: '127',
						typeName: null,
						docs: [],
					},
					{
						name: null,
						type: '41',
						typeName: null,
						docs: [],
					},
					{
						name: null,
						type: '37',
						typeName: null,
						docs: [],
					},
				]),
				index: polkadotRegistryV9300.createType('u8', 1),
				docs: polkadotRegistryV9300.createType('Vec<Text>', [
					' A public proposal has been tabled for referendum vote.',
				]),
				args: polkadotRegistryV9300.createType('Vec<Type>', [
					'PropIndex',
					'Balance',
					'Vec<AccountId>',
				]),
			},
		},
		ExternalTabled: {
			meta: {
				name: 'ExternalTabled',
				fields: polkadotRegistryV9300.createType('Vec<Si1Field>', []),
				index: polkadotRegistryV9300.createType('u8', 2),
				docs: polkadotRegistryV9300.createType('Vec<Text>', [
					' An external proposal has been tabled.',
				]),
				args: polkadotRegistryV9300.createType('Vec<Text>', []),
			},
		},
	},
};
