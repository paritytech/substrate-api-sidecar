/**
 * Response types should closely resemble the actual JSON response given by
 * sidecar. This means they should _not_ have Codec types. It is up to the
 * handler functions to apply the proper serialization of Codec types to ensure
 * they are the expected value. Not only does it gives us more fine grain control
 * of sidecar representation of values in response, this also enables us to
 * handle conversion errors on a case by case basis and give rich, meaningful
 * responses to the client.
 *
 * tl;dr there should not be Codec types in any of these responses. Most of the
 * time the value type should either be `string` or `string | null`.
 */

interface At {
	hash: string;
	height: string;
}

interface StakingInfo {
	at: At;
	validatorCount: string; // of validators in the set
	activeEra: string | null; //ActiveEra.index
	forceEra: string; // status of era forcing
	nextEra: string | null;
	nextSession?: string | null;
	unappliedSlashes: string | null;
	queuedElected: string | null; // contains an array of stashes elected
	electionStatus: {
		status?: string;
		toggle?: string;
	};
}
