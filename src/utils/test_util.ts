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

