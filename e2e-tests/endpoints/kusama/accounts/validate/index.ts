import validKusama from './validKusama.json';

const validKusamaStringify = JSON.stringify(validKusama);

export const kusamaAccountValidateEndpoints = [
	[
		'/accounts/DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc/validate',
		validKusamaStringify,
	],
	[
		'/accounts/0x02ce046d43fc4c0fb8b3b754028515e5020f5f1d8d620b4ef0f983c5df34b1952909e9/validate',
		validKusamaStringify,
	],
];
