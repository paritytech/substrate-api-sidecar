import { polkadotRegistryV9122 } from '../../../../test-helpers/registries';

const value = polkadotRegistryV9122.createType(
	'Compact<u128>',
	BigInt(33223051661066606)
);

export const mockDeriveValidatorExposure = {
	'12JZr1HgK8w6zsbBj6oAEVRkvisn8j3MrkXugqtvc4E8uwLo': {
		total: polkadotRegistryV9122.createType(
			'Compact<u128>',
			BigInt(33223251661066606)
		),
		own: polkadotRegistryV9122.createType('Compact<u128>', 200000000000),
		others: [
			{
				who: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
				value,
			},
		],
	},
	'1HDgY7vpDjafR5NM8dbwm1b3Rrs4zATuSCHHbe7YgpKUKFw': {
		total: polkadotRegistryV9122.createType(
			'Compact<u128>',
			BigInt(33223061661066606)
		),
		own: polkadotRegistryV9122.createType('Compact<u128>', 10000000000),
		others: [
			{
				who: '15j4dg5GzsL1bw2U2AWgeyAk6QTxq43V7ZPbXdAmbVLjvDCK',
				value,
			},
		],
	},
};
