import { AnyJson } from '@polkadot/types/types';

interface At {
	hash: string;
	height: string;
}

export interface StakingInfo {
	at: At;
	validatorCount: string | null; // of validators in the set
	activeEra: string | null; //ActiveEra.index
	forceEra: AnyJson; // status of era forcing
	nextEra: AnyJson;
	nextSession: string | null;
	unappliedSlashes: AnyJson[] | null;
	electionStatus: {
		status: AnyJson;
		toggle: string | null;
	};
	validatorSet: string[] | null;
}
