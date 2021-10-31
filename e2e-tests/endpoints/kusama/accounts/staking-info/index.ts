import accountsStakingInfo1500000 from './1500000.json';
import accountsStakingInfo3000000 from './3000000.json';
import accountsStakingInfo5000000 from './5000000.json';
import accountsStakingInfo8000000 from './8000000.json';
import accountsStakingInfo9500000 from './9500000.json';
import accountsStakingInfo9894877 from './9894877.json';

export const kusamaAccountStakingInfoEndpoints = [
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=1500000',
		JSON.stringify(accountsStakingInfo1500000),
	], // v1054
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=3000000',
		JSON.stringify(accountsStakingInfo3000000),
	], // v2012
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=5000000',
		JSON.stringify(accountsStakingInfo5000000),
	], // v2026
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=8000000',
		JSON.stringify(accountsStakingInfo8000000),
	], // v9040
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=9500000',
		JSON.stringify(accountsStakingInfo9500000),
	], // v9090
	[
		'/accounts/HP8qJ8P4u4W2QgsJ8jzVuSsjfFTT6orQomFD6eTRSGEbiTK/staking-info?at=9894877',
		JSON.stringify(accountsStakingInfo9894877),
	], // v9122
];
