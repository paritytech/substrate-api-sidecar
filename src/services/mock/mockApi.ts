import { ApiPromise } from '@polkadot/api';
import { Option } from '@polkadot/types/codec';
import {
	ActiveEraInfo,
	Block,
	EraIndex,
	Hash,
	SessionIndex,
} from '@polkadot/types/interfaces';

import { decoratedPolkadotMetadata } from '../../test-helpers/metadata/decorated';
import { polkadotRegistry } from '../../test-helpers/registries';
import * as block789629 from './data/block789629.json';
import { events789629 } from './data/events789629Hex';
import { validators789629Hex } from './data/validators789629Hex';

/**
 * Mock for polkadot block #789629.
 */
export const mockBlock789629 = polkadotRegistry.createType(
	'Block',
	block789629
);

/**
 * BlockHash for polkadot block #789629.
 */
export const blockHash789629 = polkadotRegistry.createType(
	'BlockHash',
	'0x7b713de604a99857f6c25eacc115a4f28d2611a23d9ddff99ab0e4f1c17a8578'
);

/**
 * Address to use with Accounts tests.
 */
export const testAddress = `1zugcapKRuHy2C1PceJxTvXWiq6FHEDm2xa5XSU7KYP3rJE`;

const eventsAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<EventRecord>', events789629)
	);

const chain = () =>
	Promise.resolve().then(() => {
		return polkadotRegistry.createType('Text', ' Polkadot');
	});

export const getBlock = (_hash: Hash): Promise<{ block: Block }> =>
	Promise.resolve().then(() => {
		return { block: mockBlock789629 };
	});

const getHeader = (_hash: Hash) =>
	Promise.resolve().then(() => mockBlock789629.header);

const getRuntimeVersion = () =>
	Promise.resolve().then(() => {
		return {
			specName: polkadotRegistry.createType('Text', 'polkadot'),
			specVersion: polkadotRegistry.createType('u32', 16),
			transactionVersion: polkadotRegistry.createType('u32', 2),
		};
	});

const getMetadata = () =>
	Promise.resolve().then(() => decoratedPolkadotMetadata.metadata);

const deriveGetHeader = () =>
	Promise.resolve().then(() => {
		return {
			author: polkadotRegistry.createType(
				'AccountId',
				'1zugcajGg5yDD9TEqKKzGx7iKuGWZMkRbYcyaFnaUaEkwMK'
			),
		};
	});

const nextFeeMultiplierAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Fixed128', 1000000000)
	);

const validatorCountAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u32', 197));

const forceEraAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Forcing', 'NotForcing')
	);

const eraElectionStatusAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('ElectionStatus', { Close: null })
	);

const validatorsAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<ValidatorId>', validators789629Hex)
	);

const currentSlotAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u64', 265876724));

const epochIndexAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u64', 330));

const genesisSlotAt = (_hash: Hash) =>
	Promise.resolve().then(() => polkadotRegistry.createType('u64', 265084563));

const currentIndexAt = (_hash: Hash) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('SessionIndex', 330)
	);

export const activeEraAt = (_hash: Hash): Promise<Option<ActiveEraInfo>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<ActiveEraInfo>', {
			index: 49,
			start: 1595259378000,
		})
	);

export const erasStartSessionIndexAt = (
	_hash: Hash,
	_activeEra: EraIndex
): Promise<Option<SessionIndex>> =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<SessionIndex>', 330)
	);

const unappliedSlashesAt = (_hash: Hash, _activeEra: EraIndex) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Vec<UnappliedSlash>', [])
	);

const locksAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'Vec<BalanceLock>',
			'0x047374616b696e672000e8764817000000000000000000000002'
		)
	);

const accountAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType(
			'AccountInfo',
			'0x0600000003dbb656ab7400000000000000000000000000000000000000000000000000000000e8764817000000000000000000000000e87648170000000000000000000000'
		)
	);

const vestingAt = (_hash: Hash, _address: string) =>
	Promise.resolve().then(() =>
		polkadotRegistry.createType('Option<VestingInfo>', null)
	);

/**
 * Mock polkadot-js ApiPromise.
 */
export const mockApi = ({
	createType: polkadotRegistry.createType.bind(polkadotRegistry),
	registry: polkadotRegistry,
	query: {
		babe: {
			currentSlot: { at: currentSlotAt },
			epochIndex: { at: epochIndexAt },
			genesisSlot: { at: genesisSlotAt },
		},
		balances: {
			locks: { at: locksAt },
		},
		session: {
			currentIndex: { at: currentIndexAt },
			validators: { at: validatorsAt },
		},
		staking: {
			validatorCount: { at: validatorCountAt },
			forceEra: { at: forceEraAt },
			eraElectionStatus: { at: eraElectionStatusAt },
			activeEra: { at: activeEraAt },
			erasStartSessionIndex: { at: erasStartSessionIndexAt },
			unappliedSlashes: { at: unappliedSlashesAt },
		},
		system: {
			events: { at: eventsAt },
			account: { at: accountAt },
		},
		transactionPayment: {
			nextFeeMultiplier: { at: nextFeeMultiplierAt },
		},
		vesting: {
			vesting: { at: vestingAt },
		},
	},
	consts: {
		babe: {
			epochDuration: polkadotRegistry.createType('u64', 2400),
		},
		transactionPayment: {
			transactionByteFee: polkadotRegistry.createType('Balance', 1000000),
			weightToFee: [
				{
					coeffFrac: 80000000,
					coeffInteger: 0,
					degree: 1,
					negative: false,
				},
			],
		},
		staking: {
			electionLookAhead: polkadotRegistry.createType('BlockNumber'),
			sessionsPerEra: polkadotRegistry.createType('SessionIndex', 6),
		},
		system: {
			extrinsicBaseWeight: polkadotRegistry.createType('u64', 125000000),
		},
	},
	rpc: {
		chain: {
			getHeader,
			getBlock,
		},
		state: {
			getRuntimeVersion,
			getMetadata,
		},
		system: {
			chain,
		},
	},
	derive: {
		chain: {
			getHeader: deriveGetHeader,
		},
	},
} as unknown) as ApiPromise;
