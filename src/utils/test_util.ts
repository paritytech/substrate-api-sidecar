import metadataRpc from '@polkadot/metadata/Metadata/v11/static';
import { Metadata, TypeRegistry } from '@polkadot/types';
import { getSpecTypes } from '@polkadot/types-known';

/**
 * Create a type registry for Kusama.
 * Useful for creating types in order to facilitate testing.
 */
function createKusamaRegistry(): TypeRegistry {
	const registry = new TypeRegistry();

	registry.register(getSpecTypes(registry, 'Kusama', 'kusama', 2008));

	registry.createType('ChainProperties', {
		ss58Format: 2,
		tokenDecimals: 12,
		tokenSymbol: 'KSM',
	});

	registry.setMetadata(new Metadata(registry, metadataRpc));

	return registry;
}

export const kusamaRegistry = createKusamaRegistry();

export const MAX_U128 = '340282366920938463463374607431768211455';

export const MAX_I128 = '170141183460469231731687303715884105727';
export const MIN_I128 = '-170141183460469231731687303715884105728';

export const MAX_U64 = '18446744073709551615';

export const MAX_I64 = '9223372036854775807';
export const MIN_I64 = '-9223372036854775808';

export const MAX_U32 = '4294967295';

export const MAX_I32 = '2147483647';
export const MIN_I32 = '-2147483648';

export const MAX_U16 = '65535';

export const MAX_I16 = '65535';
export const MIN_I16 = '-32768';

export const MAX_U8 = '255';

export const MAX_I8 = '127';
export const MIN_I8 = '-128';

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
