/**
 * Response types should closely resemble the actual JSON response given by
 * sidecar. This means they should _not_ have Codec types. It is up to the
 * handler functions to apply the proper serialization of Codec types to ensure
 * they are the expected value. Not only does it gives us more fine grain control
 * of sidecar representation of values in response, this also enables us to
 * handle conversion errors on a case by case basis and give rich, meaningful
 * responses to the client.
 *
 * In sum, there should not be Codec types in any of these responses.
 */

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
