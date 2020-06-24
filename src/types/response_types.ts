import { AnyJson } from '@polkadot/types/types';

interface At {
	hash: string;
	height: string;
}

export interface StakingInfo {
	at: At;
	validatorCount: string | null;
	activeEra: string | null;
	forceEra: AnyJson;
	nextEra: AnyJson;
	nextSession: string | null;
	unappliedSlashes: AnyJson[] | null;
	electionStatus: {
		status: AnyJson;
		toggle: string | null;
	};
	validatorSet: string[] | null;
}
