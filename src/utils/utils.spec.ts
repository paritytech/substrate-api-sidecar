import Int from '@polkadot/types/codec/Int';
import UInt from '@polkadot/types/codec/UInt';

import { kusamaRegistry, PRE_SANITIZED_STAKING_RESPONSE } from './test_util';
import { sanitizeNumbers } from './utils';

// TODO just change all registry to kusamaRegistry
const registry = kusamaRegistry;

describe('sanitizeNumbers', () => {
	it('does not affect non-numbers', () => {
		expect(sanitizeNumbers('Hello world')).toBe('Hello world');
	});

	it('does not convert plain hexadecimal', () => {
		expect(sanitizeNumbers('40C0A7')).toBe('40C0A7');
		expect(sanitizeNumbers('0x40C0A7')).toBe('0x40C0A7');
	});

	test.todo('converts AbstractInt to decimal');
	// We can't actually directly create and test AbstractInt
	// because it has a protected constructor.

	it('converts Int and Uint to decimal', () => {
		const intTen = new Int(registry, 10);
		expect(sanitizeNumbers(intTen)).toBe('10');

		const intPaddedHex = new Int(
			registry,
			'0x000000000000000004fe9f24a6a9c00'
		);
		expect(sanitizeNumbers(intPaddedHex)).toBe('22493750000000000');

		const uIntTen = new UInt(registry, 10);
		expect(sanitizeNumbers(uIntTen)).toBe('10');

		const uIntPaddedHex = new UInt(
			registry,
			'0x000000000000000004fe9f24a6a9c00'
		);
		expect(sanitizeNumbers(uIntPaddedHex)).toBe('22493750000000000');
	});

	it('converts Balance to decimal', () => {
		const balanceTen = registry.createType('Balance', 10);
		expect(sanitizeNumbers(balanceTen)).toBe('10');

		const balancePaddedHex = registry.createType(
			'Balance',
			'0x000000000000000004fe9f24a6a9c00'
		);
		expect(sanitizeNumbers(balancePaddedHex)).toBe('22493750000000000');
	});

	it('it converts Compact<Balance>', () => {
		const compactBalancePaddedHex = registry.createType(
			'Compact<Balance>',
			'0x000000000000000004fe9f24a6a9c00'
		);
		expect(sanitizeNumbers(compactBalancePaddedHex)).toBe(
			'22493750000000000'
		);
		// expect(sanitizeNumbers(compactBalancePaddedHex)).toBe(
		// 	'0x000000000000000004fe9f24a6a9c00'
		// );

		const compactBalancePaddedHex2 = registry.createType(
			'Compact<Balance>',
			'0x0000000000000000ff49f24a6a9c00'
		);
		expect(sanitizeNumbers(compactBalancePaddedHex2)).toBe(
			'71857424040631296'
		);
		// expect(sanitizeNumbers(compactBalancePaddedHex2)).toBe(
		// 	'0x0000000000000000ff49f24a6a9c00'
		// );
	});

	it('converts Compact<Balance> that are values in an object', () => {
		const totalBalance = registry.createType(
			'Compact<Balance>',
			'0x0000000000000000ff49f24a6a9c00'
		);

		const activeBalance = registry.createType(
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
		// expect(sanitizeNumbers(arbitraryObject)).toStrictEqual({
		// 	active: '0x000000000000000000ff49f24a6a9100',
		// 	total: '0x000000000000000000ff49f24a6a9c00',
		// });
	});

	it('correctly serializes a staking response', () => {
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

	test.todo('sanitizes arrays of elements');

	test.todo(
		'sanitize deeply nested object and arrays with other arbitrary types'
	);
});
