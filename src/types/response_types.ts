import { AnyJson } from '@polkadot/types/types';

interface At {
	hash: string;
	height: string;
}

export interface StakingInfo {
	at: At;
	validatorCount: string; // of validators in the set
	activeEra: string | null; //ActiveEra.index
	forceEra: AnyJson; // status of era forcing
	nextEra: AnyJson;
	nextSession: string | null;
	unappliedSlashes: AnyJson[] | null;
	queuedElected: AnyJson; // contains an array of stashes elected
	electionStatus: {
		status: AnyJson;
		toggle: string | null;
	};
	validatorSet: string[];
}
