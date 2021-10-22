import validWestend from './validWestend.json';

const validWestendStringify = JSON.stringify(validWestend);

export const westendAccountValidateEndpoints = [
	[
		'/accounts/5CdnmxQUfK6WPreBauvetcLh5PZL4RMPHrtd3nPQpQ9Z2qCS/validate',
		validWestendStringify,
	],
	[
		'/accounts/0x2a193ba804b76499944080c91b8b38b749a482471c317ab8bfa43f52d5ff9c04c7f6bf/validate',
		validWestendStringify,
	],
];
