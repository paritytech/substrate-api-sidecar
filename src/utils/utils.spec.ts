import Int from '@polkadot/types/codec/Int';
import UInt from '@polkadot/types/codec/UInt';

import {
	kusamaRegistry,
	PRE_SANITIZED_BALANCE_LOCK,
	PRE_SANITIZED_OPTION_VESTING_INFO,
	PRE_SANITIZED_RUNTIME_DISPATCH_INFO,
	PRE_SANITIZED_STAKING_RESPONSE,
} from './test_util';
import { sanitizeNumbers } from './utils';

describe('sanitizeNumbers', () => {
	it('does not affect non-numbers', () => {
		expect(sanitizeNumbers('Hello world')).toBe('Hello world');
	});

	it('does not convert plain hexadecimal', () => {
		expect(sanitizeNumbers('40C0A7')).toBe('40C0A7');
		expect(sanitizeNumbers('0x40C0A7')).toBe('0x40C0A7');
	});

	it('converts U32 Int and Uint', () => {
		const intTen = new Int(kusamaRegistry, 10);
		expect(sanitizeNumbers(intTen)).toBe('10');

		const intPaddedHex = new Int(
			kusamaRegistry,
			'0x000000000000000004fe9f24a6a9c00'
		);
		expect(sanitizeNumbers(intPaddedHex)).toBe('22493750000000000');

		const uIntTen = new UInt(kusamaRegistry, 10);
		expect(sanitizeNumbers(uIntTen)).toBe('10');

		const uIntPaddedHex = new UInt(
			kusamaRegistry,
			'0x000000000000000004fe9f24a6a9c00'
		);
		expect(sanitizeNumbers(uIntPaddedHex)).toBe('22493750000000000');

		const u32Max = kusamaRegistry.createType('u32', '0x7FFFFFFF');
		expect(sanitizeNumbers(u32Max)).toBe('2147483647');
	});

	it('converts Balance to decimal', () => {
		const balanceTen = kusamaRegistry.createType('Balance', 10);
		expect(sanitizeNumbers(balanceTen)).toBe('10');

		const balancePaddedHex = kusamaRegistry.createType(
			'Balance',
			'0x000000000000000004fe9f24a6a9c00'
		);
		expect(sanitizeNumbers(balancePaddedHex)).toBe('22493750000000000');

		const balanceMax = kusamaRegistry.createType(
			'Balance',
			'340282366920938463463374607431768211455'
		);
		expect(sanitizeNumbers(balanceMax)).toBe(
			'340282366920938463463374607431768211455'
		);
	});

	it('converts Compact<Balance>', () => {
		const compactBalancePaddedHex = kusamaRegistry.createType(
			'Compact<Balance>',
			'0x000000000000000004fe9f24a6a9c00'
		);
		expect(sanitizeNumbers(compactBalancePaddedHex)).toBe(
			'22493750000000000'
		);

		const compactBalancePaddedHex2 = kusamaRegistry.createType(
			'Compact<Balance>',
			'0x0000000000000000ff49f24a6a9c00'
		);
		expect(sanitizeNumbers(compactBalancePaddedHex2)).toBe(
			'71857424040631296'
		);

		const compactBalanceMax = kusamaRegistry.createType(
			'Compact<Balance>',
			'340282366920938463463374607431768211455'
		);
		expect(sanitizeNumbers(compactBalanceMax)).toBe(
			'340282366920938463463374607431768211455'
		);
	});

	it('converts Index and Compact<Index>', () => {
		const IndexPadded = kusamaRegistry.createType('Index', '0x00000384');
		expect(sanitizeNumbers(IndexPadded)).toBe('900');

		const IndexMax = kusamaRegistry.createType('Index', '0x7FFFFFFF');
		expect(sanitizeNumbers(IndexMax)).toBe('2147483647');

		const CompactIndexPadded = kusamaRegistry.createType(
			'Compact<Index>',
			'0x00000384'
		);
		expect(sanitizeNumbers(CompactIndexPadded)).toBe('900');

		const CompactIndexMax = kusamaRegistry.createType(
			'Compact<Index>',
			'0x7FFFFFFF'
		);
		expect(sanitizeNumbers(CompactIndexMax)).toBe('2147483647');
	});

	it('converts Compact<Balance> that are values in an object', () => {
		const totalBalance = kusamaRegistry.createType(
			'Compact<Balance>',
			'0x0000000000000000ff49f24a6a9c00'
		);

		const activeBalance = kusamaRegistry.createType(
			'Compact<Balance>',
			'0x0000000000000000ff49f24a6a9100'
		);

		const arbitraryObject = {
			total: totalBalance,
			active: activeBalance,
		};

		const sanitizedArbitraryObject = {
			total: '71857424040631296',
			active: '71857424040628480',
		};

		expect(sanitizeNumbers(arbitraryObject)).toStrictEqual(
			sanitizedArbitraryObject
		);
	});

	it('converts a staking response', () => {
		expect(sanitizeNumbers(PRE_SANITIZED_STAKING_RESPONSE)).toStrictEqual({
			at: {
				hash:
					'0x5f2a8b33c24368148982c37aefe77d5724f5aca0bcae1a599e2a4634c1f0fab2',
				height: '2669784',
			},
			staking: {
				active: '71857424040628480',
				claimedRewards: [],
				stash: '5DRihWfVSmhbk25D4VRSjacZTtrnv8w8qnGttLmfro5MCPgm',
				total: '71857424040631296',
				unlocking: [],
			},
		});
	});

	it('converts Vec<BalanceLock>', () => {
		expect(sanitizeNumbers(PRE_SANITIZED_BALANCE_LOCK)).toStrictEqual([
			{
				id: '0x4c6f636b49640000',
				amount: '71857424040631296',
				reasons: 'Misc',
			},
		]);
	});

	it('converts Option<VestingInfo>', () => {
		expect(
			sanitizeNumbers(PRE_SANITIZED_OPTION_VESTING_INFO)
		).toStrictEqual({
			locked: '71857424040631296',
			perBlock: '71857424040628480',
			startingBlock: '299694200',
		});
	});

	it('converts RuntimeDispatchInfo', () => {
		expect(
			sanitizeNumbers(PRE_SANITIZED_RUNTIME_DISPATCH_INFO)
		).toStrictEqual({
			weight: '9223372036854775807',
			class: 'Operational',
			partialFee: '9223372036854775807',
		});
	});

	it('handles enum ElectionStatus', () => {
		const open = kusamaRegistry.createType('ElectionStatus', {
			open: 420420,
		});
		expect(sanitizeNumbers(open)).toStrictEqual({ Open: '420420' });

		const close = kusamaRegistry.createType('ElectionStatus', 'close');
		expect(sanitizeNumbers(close)).toStrictEqual({ Close: null });
	});

	test.todo('sanitizes arrays of elements');

	test.todo(
		'sanitize deeply nested object and arrays with other arbitrary types'
	);
});
