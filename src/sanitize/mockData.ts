import { MAX_U64, MAX_U128 } from '../test-helpers/constants';
import { kusamaRegistry } from '../test-helpers/registries';

/**
 * An 'at' object, which has not been sanitized by `sanitizeNumbers`.
 */
export const PRE_SANITIZED_AT = {
	height: '2669784',
	hash: kusamaRegistry.createType(
		'BlockHash',
		'0x5f2a8b33c24368148982c37aefe77d5724f5aca0bcae1a599e2a4634c1f0fab2'
	),
};

/**
 * A dummy return value to fetchStakingLedger which has not been run through `sanitizeNumbers`.
 */
export const PRE_SANITIZED_STAKING_RESPONSE = {
	at: PRE_SANITIZED_AT,
	staking: kusamaRegistry.createType('StakingLedger', {
		stash: '5DRihWfVSmhbk25D4VRSjacZTtrnv8w8qnGttLmfro5MCPgm',
		total: '0x0000000000000000ff49f24a6a9c00',
		active: '0x0000000000000000ff49f24a6a9100',
		unlocking: [],
		claimedRewards: [],
	}),
};

export const PRE_SANITIZED_BALANCE_LOCK = kusamaRegistry.createType(
	'Vec<BalanceLock>',
	[
		{
			id: 'LockId',
			amount: kusamaRegistry.createType(
				'Balance',
				'0x0000000000000000ff49f24a6a9c00'
			),
			reasons: 'misc',
		},
	]
);

export const PRE_SANITIZED_OPTION_VESTING_INFO = kusamaRegistry.createType(
	'Option<VestingInfo>',
	{
		locked: '0x0000000000000000ff49f24a6a9c00',
		perBlock: '0x0000000000000000ff49f24a6a9100',
		startingBlock: '299694200',
	}
);

export const PRE_SANITIZED_RUNTIME_DISPATCH_INFO = kusamaRegistry.createType(
	'RuntimeDispatchInfo',
	{
		weight: MAX_U64,
		class: 'operational',
		partialFee: MAX_U128,
	}
);
