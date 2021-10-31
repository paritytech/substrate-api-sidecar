import accountsStakingInfo350000 from './350000.json';
import accountsStakingInfo1000000 from './1000000.json';
import accountsStakingInfo3000000 from './3000000.json';
import accountsStakingInfo6000000 from './6000000.json';
import accountsStakingInfo7000000 from './7000000.json';
import accountsStakingInfo7472552 from './7472552.json';

export const polkadotAccountStakingInfoEndpoints = [
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=350000',
		JSON.stringify(accountsStakingInfo350000),
	], // v11
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=1000000',
		JSON.stringify(accountsStakingInfo1000000),
	], // v17
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=3000000',
		JSON.stringify(accountsStakingInfo3000000),
	], // v26
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=6000000',
		JSON.stringify(accountsStakingInfo6000000),
	], // v9050
	[
		'/accounts/16SpacegeUTft9v3ts27CEC3tJaxgvE4uZeCctThFH3Vb24p/staking-info?at=7000000',
		JSON.stringify(accountsStakingInfo7000000),
	], // v9090
	[
		'/accounts/13HtFCrxyz55KgkPWcnhHPwE8f8GmZrfXR3uC6jNrihGzmqz/staking-info?at=7472552',
		JSON.stringify(accountsStakingInfo7472552),
	], // v9110
];
