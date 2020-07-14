import { AnyJson } from '@polkadot/types/types';

import { IAt } from './At';

export interface IPalletStakingProgress {
	at: IAt;
	idealValidatorCount?: string | null;
	activeEra: string | null;
	forceEra: AnyJson;
	nextActiveEraEstimate?: AnyJson;
	nextSessionEstimate: string | null;
	unappliedSlashes: AnyJson[] | null;
	electionStatus?: {
		status: AnyJson;
		toggleEstimate: string | null;
	};
	validatorSet?: string[] | null;
}
