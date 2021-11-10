import validPolkadot from './validPolkadot.json';

const validPolkadotStringify = JSON.stringify(validPolkadot);

export const polkadotAccountValidateEndpoints = [
	[
		'/accounts/1xN1Q5eKQmS5AzASdjt6R6sHF76611vKR4PFpFjy1kXau4m/validate',
		validPolkadotStringify,
	],
	[
		'/accounts/0x002a39366f6620a6c2e2fed5990a3d419e6a19dd127fc7a50b515cf17e2dc5cc592312/validate',
		validPolkadotStringify,
	],
];
