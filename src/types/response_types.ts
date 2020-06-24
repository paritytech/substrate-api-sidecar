import { AnyJson } from '@polkadot/types/types';

interface At {
	hash: string;
	height: string;
}

export interface StakingInfo {
	at: At;
	idealValidatorCount: string | null;
	activeEra: string | null;
	forceEra: AnyJson;
	nextEraEstimate: AnyJson;
	nextSessionEstimate: string | null;
	unappliedSlashes: AnyJson[] | null;
	electionStatus: {
		status: AnyJson;
		toggleEstimate: string | null;
	};
	validatorSet: string[] | null;
}
