import accountsStakingInfo6000000 from './6000000.json';
import accountsStakingInfo8041521 from './8041521.json';

export const westendAccountStakingInfoEndpoints = [
	[
		'/accounts/5Ek5JCnrRsyUGYNRaEvkufG1i1EUxEE9cytuWBBjA9oNZVsf/staking-info?at=6000000',
		JSON.stringify(accountsStakingInfo6000000),
	], // v9033
	[
		'/accounts/5ENXqYmc5m6VLMm5i1mun832xAv2Qm9t3M4PWAFvvyCJLNoR/staking-info?at=8041521',
		JSON.stringify(accountsStakingInfo8041521),
	], // v9122
];
