import {
	BTreeMap,
	BTreeSet,
	Bytes,
	Compact,
	Data,
	Enum,
	GenericCall,
	HashMap,
	Int,
	Json,
	Null,
	Raw,
	Result,
	Set as CodecSet,
	StorageKey,
	Struct,
	Text,
	Tuple,
	u8,
	U8aFixed,
	u32,
	u64,
	u128,
	Vec,
	VecFixed,
} from '@polkadot/types';
import { CodecDate } from '@polkadot/types/codec/Date';
import { UInt } from '@polkadot/types/codec/UInt';
import BN from 'bn.js';

import {
	MAX_I8,
	MAX_I16,
	MAX_I32,
	MAX_I64,
	MAX_I128,
	MAX_U8,
	MAX_U16,
	MAX_U32,
	MAX_U64,
	MAX_U128,
	MIN_I8,
	MIN_I16,
	MIN_I32,
	MIN_I64,
	MIN_I128,
} from '../test-helpers/constants';
import { kusamaRegistry } from '../test-helpers/registries';
import {
	PRE_SANITIZED_BALANCE_LOCK,
	PRE_SANITIZED_OPTION_VESTING_INFO,
	PRE_SANITIZED_RUNTIME_DISPATCH_INFO,
	PRE_SANITIZED_STAKING_RESPONSE,
} from './mockData';
import { sanitizeNumbers } from './sanitizeNumbers';

describe('sanitizeNumbers', () => {
	it('does not affect non-numbers', () => {
		expect(sanitizeNumbers('Hello world')).toBe('Hello world');
	});

	it('does not convert plain hexadecimal', () => {
		expect(sanitizeNumbers('40C0A7')).toBe('40C0A7');
		expect(sanitizeNumbers('0x40C0A7')).toBe('0x40C0A7');
	});

	describe('javscript native', () => {
		describe('javascript types it cannot handle properly', () => {
			it('does not handle WeakMap', () => {
				const compact = new (Compact.with(u128))(
					kusamaRegistry,
					MAX_U128
				);
				const map = new WeakMap()
					.set({ x: 'x' }, compact)
					.set(
						{ y: 'y' },
						kusamaRegistry.createType('u128', MAX_U128)
					);

				expect(sanitizeNumbers(map)).toStrictEqual({});
			});

			it('does not handle WeakSet', () => {
				const negInt = new Int(kusamaRegistry, MIN_I32, 32);
				const maxInt = new Int(kusamaRegistry, MAX_I64, 64);
				const set = new WeakSet([maxInt, negInt]);
				expect(sanitizeNumbers(set)).toStrictEqual({});
			});

			it('does not handle Number', () => {
				expect(sanitizeNumbers(new Number(MAX_U128))).toStrictEqual({});
			});

			it('handles BigInt but outputs to console.errors because not convert to AnyJson', () => {
				const temp = console.error;
				console.error = jest.fn();
				expect(sanitizeNumbers(BigInt(MAX_U128))?.toString()).toBe(
					'340282366920938463463374607431768211455'
				);
				expect(console.error).toHaveBeenCalled();
				console.error = temp;
			});

			it('handles Symbol but outputs to console.error because does not convert to AnyJson', () => {
				const temp = console.error;
				console.error = jest.fn();
				const s = Symbol('sym');
				expect(sanitizeNumbers(s)?.toString()).toEqual('Symbol(sym)');
				expect(console.error).toHaveBeenCalled();
				console.error = temp;
			});

			it('does not handle String', () => {
				expect(sanitizeNumbers(new String('abc'))).toStrictEqual({
					0: 'a',
					1: 'b',
					2: 'c',
				});
			});
		});

		it('handles Date', () => {
			const date = new Date();
			expect(sanitizeNumbers(date)).toBe(date.toJSON());
		});

		it('converts Array', () => {
			expect(
				sanitizeNumbers([
					kusamaRegistry.createType('u128', MAX_U128),
					kusamaRegistry.createType('u64', MAX_U64),
				])
			).toStrictEqual([MAX_U128, MAX_U64]);

			expect(sanitizeNumbers(new Array(2))).toStrictEqual(new Array(2));
		});

		it('converts nested POJO', () => {
			const pojo = {
				three: kusamaRegistry.createType('u32', MAX_U32),
				x: {
					six: kusamaRegistry.createType('u64', MAX_U64),
					x: {
						one: kusamaRegistry.createType('u128', MAX_U128),
						b: kusamaRegistry.createType('Balance', MAX_U128),
					},
				},
			};
			expect(sanitizeNumbers(pojo)).toStrictEqual({
				three: MAX_U32,
				x: {
					six: MAX_U64,
					x: {
						one: MAX_U128,
						b: MAX_U128,
					},
				},
			});
		});

		it('handles undefined', () => {
			const arr = [undefined, undefined, undefined];
			expect(sanitizeNumbers(arr)).toStrictEqual(arr);

			const obj = {
				x: undefined,
				y: undefined,
				a: arr,
			};
			expect(sanitizeNumbers(obj)).toStrictEqual(obj);
		});

		it('converts javascript Set', () => {
			const negInt = kusamaRegistry.createType('i32', MIN_I32);

			const maxInt = kusamaRegistry.createType('i64', MAX_I64);

			const struct = new Struct(
				kusamaRegistry,
				{
					foo: Text,
					bar: 'u32',
				},
				{ foo: 'hi :)', bar: MAX_U32 }
			);

			const set = new Set([struct, maxInt, negInt]);
			expect(sanitizeNumbers(set)).toStrictEqual([
				{
					foo: 'hi :)',
					bar: MAX_U32,
				},
				MAX_I64,
				MIN_I32,
			]);
		});

		it('converts nested javascript Map', () => {
			const struct = new Struct(
				kusamaRegistry,
				{
					foo: 'Text',
					bar: 'u32',
				},
				{ foo: 'hi :)', bar: MAX_U32 }
			);
			const compact = new (Compact.with(u128))(kusamaRegistry, MAX_U128);
			const nest = new Map().set('s', struct).set('b', new BN(MAX_U128));
			const outer = new Map().set('c', compact).set('n', nest);
			expect(sanitizeNumbers(outer)).toStrictEqual({
				c: MAX_U128,
				n: {
					s: {
						foo: 'hi :)',
						bar: MAX_U32,
					},
					b: MAX_U128,
				},
			});
		});
	});

	describe('primitives and Codec base types', () => {
		// https://github.com/polkadot-js/api/tree/master/packages/types

		it('converts AnyStruct', () => {
			const struct = new Struct(
				kusamaRegistry,
				{
					foo: 'Text',
					bar: 'u32',
				},
				{ foo: 'hi :)', bar: MAX_U32 }
			);

			expect(sanitizeNumbers(struct)).toStrictEqual({
				foo: 'hi :)',
				bar: MAX_U32,
			});

			const json = new Json(kusamaRegistry, {
				b: kusamaRegistry.createType('Bool', true),
				i: kusamaRegistry.createType('i128', MAX_I128),
				o: kusamaRegistry.createType('Option<i128>', MAX_I128),
				s: struct,
			});

			expect(sanitizeNumbers(json)).toStrictEqual({
				b: true,
				i: MAX_I128,
				o: MAX_I128,
				s: {
					foo: 'hi :)',
					bar: MAX_U32,
				},
			});
		});

		it('handles H512', () => {
			const h = kusamaRegistry.createType('H512', MAX_U64);
			expect(sanitizeNumbers(h)).toBe(
				'0x31383434363734343037333730393535313631350000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
			);
		});

		it('handles H256', () => {
			const h = kusamaRegistry.createType('H256', MAX_U32);
			expect(sanitizeNumbers(h)).toBe(
				'0x3432393439363732393500000000000000000000000000000000000000000000'
			);
		});

		it('handles H160', () => {
			const h = kusamaRegistry.createType('H160', MAX_U16);
			expect(sanitizeNumbers(h)).toBe(
				'0x3635353335000000000000000000000000000000'
			);
		});

		it('handles CodecDate', () => {
			const d = new CodecDate(kusamaRegistry, new Date(1594441868));
			expect(sanitizeNumbers(d)).toBe(1594442);
		});

		it('handles Codec Bool', () => {
			const t = kusamaRegistry.createType('Bool', true);
			expect(sanitizeNumbers(t)).toBe(true);

			const f = kusamaRegistry.createType('Bool', false);
			expect(sanitizeNumbers(f)).toBe(false);
		});

		it('handles Codec Bytes', () => {
			const code = new Bytes(kusamaRegistry, ':code');
			expect(sanitizeNumbers(code)).toBe('0x3a636f6465');
		});

		it('handles Codec Data', () => {
			const data = new Data(kusamaRegistry, {
				Keccak256:
					'0x0102030405060708091011121314151617181920212223242526272829303132',
			});
			expect(sanitizeNumbers(data)).toStrictEqual({
				keccak256:
					'0x0102030405060708091011121314151617181920212223242526272829303132',
			});
		});

		it('handles Codec Null', () => {
			expect(sanitizeNumbers(new Null(kusamaRegistry))).toBe(null);
		});

		it('handles StorageKey', () => {
			const key = new StorageKey(
				kusamaRegistry,
				'0x426e15054d267946093858132eb537f191ca57b0c4b20b29ae7e99d6201d680cc906f7710aa165d62c709012f807af8fc3f0d2abb0c51ca9a88d4ef24d1a092bf89dacf5ce63ea1d'
			);
			expect(sanitizeNumbers(key)).toStrictEqual(
				'0x426e15054d267946093858132eb537f191ca57b0c4b20b29ae7e99d6201d680cc906f7710aa165d62c709012f807af8fc3f0d2abb0c51ca9a88d4ef24d1a092bf89dacf5ce63ea1d'
			);
		});

		it('handles Text', () => {
			const notEnglish = kusamaRegistry.createType('Text', '中文');
			expect(sanitizeNumbers(notEnglish)).toBe('中文');
		});

		describe('number primitives', () => {
			it('converts u8', () => {
				const z = kusamaRegistry.createType('u8', 0);
				expect(sanitizeNumbers(z)).toBe('0');

				const m = new u8(kusamaRegistry, MAX_U8);
				expect(sanitizeNumbers(m)).toBe(MAX_U8);
			});

			it('converts i8', () => {
				const z = kusamaRegistry.createType('i8', 0);
				expect(sanitizeNumbers(z)).toBe('0');

				const min = kusamaRegistry.createType('i8', MIN_I8);
				expect(sanitizeNumbers(min)).toBe(MIN_I8);

				const max = kusamaRegistry.createType('i8', MAX_I8);
				expect(sanitizeNumbers(max)).toBe(MAX_I8);
			});

			it('converts u16', () => {
				const z = kusamaRegistry.createType('u16', 0);
				expect(sanitizeNumbers(z)).toBe('0');

				const max = kusamaRegistry.createType('u16', MAX_U16);
				expect(sanitizeNumbers(max)).toBe(MAX_U16);
			});

			it('converts i16', () => {
				const z = kusamaRegistry.createType('i16', 0);
				expect(sanitizeNumbers(z)).toBe('0');

				const min = kusamaRegistry.createType('i16', MIN_I16);
				expect(sanitizeNumbers(min)).toBe(MIN_I16);

				const max = kusamaRegistry.createType('i16', MAX_I16);
				expect(sanitizeNumbers(max)).toBe(MAX_I16);
			});
			it('converts Int', () => {
				const intTen = new Int(kusamaRegistry, 10);
				expect(sanitizeNumbers(intTen)).toBe('10');

				const intPaddedHex = new Int(
					kusamaRegistry,
					'0x000000000000000004fe9f24a6a9c00'
				);
				expect(sanitizeNumbers(intPaddedHex)).toBe('22493750000000000');

				const maxInt = new Int(kusamaRegistry, MAX_I64, 64);
				expect(sanitizeNumbers(maxInt)).toBe(MAX_I64);

				const negInt = new Int(kusamaRegistry, MIN_I32, 32);
				expect(sanitizeNumbers(negInt)).toBe(MIN_I32);
			});

			it('converts UInt', () => {
				const uIntTen = new UInt(kusamaRegistry, 10);
				expect(sanitizeNumbers(uIntTen)).toBe('10');

				const uIntPaddedHex = new UInt(
					kusamaRegistry,
					'0x000000000000000004fe9f24a6a9c00'
				);
				expect(sanitizeNumbers(uIntPaddedHex)).toBe(
					'22493750000000000'
				);
			});

			it('converts U32', () => {
				const u32Zero = kusamaRegistry.createType('u32', '0x0');
				expect(sanitizeNumbers(u32Zero)).toBe('0');

				const u32Max = kusamaRegistry.createType('u32', MAX_U32);
				expect(sanitizeNumbers(u32Max)).toBe(MAX_U32);
			});

			it('converts I32', () => {
				expect(
					sanitizeNumbers(kusamaRegistry.createType('i32', MIN_I32))
				).toBe(MIN_I32);

				expect(
					sanitizeNumbers(kusamaRegistry.createType('i32', MAX_I32))
				).toBe(MAX_I32);
			});

			it('converts U64', () => {
				const u64Zero = kusamaRegistry.createType('u64', '0x0');
				expect(sanitizeNumbers(u64Zero)).toBe('0');

				const u64Max = kusamaRegistry.createType('u64', MAX_U64);
				expect(sanitizeNumbers(u64Max)).toBe(MAX_U64);
			});

			it('converts I64', () => {
				expect(
					sanitizeNumbers(kusamaRegistry.createType('i64', MIN_I64))
				).toBe(MIN_I64);

				expect(
					sanitizeNumbers(kusamaRegistry.createType('i64', MAX_I64))
				).toBe(MAX_I64);
			});

			it('converts U128', () => {
				const u128Zero = kusamaRegistry.createType('u128', '0x0');
				expect(sanitizeNumbers(u128Zero)).toBe('0');

				const u128Max = kusamaRegistry.createType('u128', MAX_U128);
				expect(sanitizeNumbers(u128Max)).toBe(MAX_U128);
			});

			it('converts II28', () => {
				expect(
					sanitizeNumbers(kusamaRegistry.createType('I128', MAX_I128))
				).toBe(MAX_I128);

				expect(
					sanitizeNumbers(kusamaRegistry.createType('I128', MIN_I128))
				).toBe(MIN_I128);
			});
		});

		describe('BTreeMap', () => {
			const mockU32TextMap = new Map<Text, u32>()
				.set(
					(kusamaRegistry.createType(
						'Text',
						'u32Max'
					) as unknown) as Text,
					kusamaRegistry.createType('u32', '0xffffffff')
				)
				.set(
					(kusamaRegistry.createType(
						'Text',
						'zero'
					) as unknown) as Text,
					kusamaRegistry.createType('u32', 0)
				);
			const bTreeMapConstructor = BTreeMap.with('Text', 'u32');

			it('converts BTreeMap and nested BTreeMap', () => {
				const sanitizedBTreeMap = {
					u32Max: MAX_U32,
					zero: '0',
				};

				expect(
					sanitizeNumbers(
						new bTreeMapConstructor(kusamaRegistry, mockU32TextMap)
					)
				).toStrictEqual(sanitizedBTreeMap);
			});

			it('converts a nested BTreeMap', () => {
				const structWithBTreeMap = new Struct(kusamaRegistry, {
					foo: u32,
					value: 'BTreeMap<Text, u32>' as 'u32',
				})
					.set('foo', kusamaRegistry.createType('u32', 50))
					.set(
						'value',
						new bTreeMapConstructor(kusamaRegistry, mockU32TextMap)
					);

				expect(sanitizeNumbers(structWithBTreeMap)).toStrictEqual({
					foo: '50',
					value: {
						u32Max: MAX_U32,
						zero: '0',
					},
				});
			});
		});

		describe('BTreeSet', () => {
			const U64Set = new Set<u64>()
				.add(kusamaRegistry.createType('u64', '0x0'))
				.add(kusamaRegistry.createType('u64', '24'))
				.add(kusamaRegistry.createType('u64', '30'))
				.add(kusamaRegistry.createType('u64', MAX_U64));

			const sanitizedBTreeSet = ['0', '24', '30', MAX_U64];

			it('converts BTreeSet', () => {
				const bTreeSet = new BTreeSet(kusamaRegistry, 'u64', U64Set);
				expect(sanitizeNumbers(bTreeSet)).toStrictEqual(
					sanitizedBTreeSet
				);
			});

			it('converts nested BTreeSet', () => {
				const structWithBTreeSet = new Struct(kusamaRegistry, {
					foo: 'u64',
					value: BTreeSet.with('u64'),
				})
					.set('foo', kusamaRegistry.createType('u64', 50))
					.set('value', new BTreeSet(kusamaRegistry, 'u64', U64Set));

				expect(sanitizeNumbers(structWithBTreeSet)).toStrictEqual({
					foo: '50',
					value: sanitizedBTreeSet,
				});
			});
		});

		it('converts an assortment of Compact values', () => {
			const wednesday = kusamaRegistry.createType('Moment', 1537968546);
			expect(
				sanitizeNumbers(
					new (Compact.with('Moment'))(kusamaRegistry, wednesday)
				)
			).toBe('1537968546');

			expect(
				sanitizeNumbers(
					new (Compact.with(u32))(kusamaRegistry, MAX_U32)
				)
			).toBe(MAX_U32);

			expect(
				sanitizeNumbers(
					new (Compact.with('u128'))(kusamaRegistry, MAX_U128)
				)
			).toBe(MAX_U128);
		});

		it('converts nested Enum', () => {
			const Nest = Enum.with({
				C: 'u64',
				D: 'u64',
			});
			const Test = Enum.with({
				A: 'u64',
				B: Nest,
			});
			const test = new Test(
				kusamaRegistry,
				new Nest(kusamaRegistry, '0xFFFFFFFFFFFFFFFF', 1),
				1
			);

			expect(sanitizeNumbers(test)).toStrictEqual({
				b: {
					d: MAX_U64,
				},
			});
		});

		it('handles Linkage', () => {
			const linkage = kusamaRegistry.createType(
				'(ValidatorPrefs, Linkage<AccountId>)' as 'u32',
				'0x0284d7170001da30b68f54f686f586ddb29de12b682dd8bd1404566fb8a8db5dec20aa5b6b36'
			);
			expect(sanitizeNumbers(linkage)).toStrictEqual([
				{ commission: '100000000' },
				{
					previous: null,
					next: '5GznmRvdi5htUJKnMSWJgJUzSJJXSvWuHRSEdyUbHJZDNcwU',
				},
			]);
		});

		describe('Option', () => {
			it('converts None to null', () => {
				const none = kusamaRegistry.createType('Option<Text>', null);
				expect(sanitizeNumbers(none)).toBe(null);
			});

			it('handles wrapped Some(Text)', () => {
				const hi = kusamaRegistry.createType('Text', 'hi');
				expect(sanitizeNumbers(hi)).toBe('hi');
			});

			it('converts Some(U128)', () => {
				const u128MaxOption = kusamaRegistry.createType(
					'Option<u128>',
					MAX_U128
				);
				expect(sanitizeNumbers(u128MaxOption)).toBe(MAX_U128);
			});
		});

		it('handles Raw', () => {
			const u8a = new Raw(kusamaRegistry, [1, 2, 3, 4, 5]);
			expect(sanitizeNumbers(u8a)).toBe('0x0102030405');
		});

		it('converts nested HashMap', () => {
			const outer = HashMap.with('Text', HashMap);
			const inner = HashMap.with('Text', 'U128');

			const map = new outer(kusamaRegistry, {
				nest: new inner(kusamaRegistry, { n: MAX_U128 }),
			});
			expect(sanitizeNumbers(map)).toStrictEqual({
				nest: { n: MAX_U128 },
			});
		});

		describe('Result', () => {
			const ResultConstructor = Result.with({
				Err: 'Text',
				Ok: 'u128',
			});
			const message = kusamaRegistry.createType('Text', 'message');
			const maxU128 = kusamaRegistry.createType('u128', MAX_U128);

			// it('handles Ok()', () => {
			// 	const ok = kusamaRegistry.createType('DispatchResult');
			// 	expect(sanitizeNumbers(ok)).toStrictEqual([]);
			// });
			it('handles Ok()', () => {
				const ok = kusamaRegistry.createType('DispatchResult');
				expect(sanitizeNumbers(ok)).toStrictEqual({ ok: [] });
			});

			// it('converts Error(u128)', () => {
			// 	const error = new ResultConstructor(kusamaRegistry, {
			// 		Error: maxU128,
			// 	});
			// 	expect(sanitizeNumbers(error)).toBe(MAX_U128);
			// });
			it('converts Error(u128)', () => {
				const error = new ResultConstructor(kusamaRegistry, {
					Err: maxU128,
				});
				expect(sanitizeNumbers(error)).toStrictEqual({
					err: MAX_U128,
				});
			});

			// it('handles Error(Text)', () => {
			// 	const error = new ResultConstructor(kusamaRegistry, {
			// 		Error: message,
			// 	});
			// 	expect(sanitizeNumbers(error)).toBe(message.toString());
			// });
			it('handles Error(Text)', () => {
				const error = new ResultConstructor(kusamaRegistry, {
					err: message,
				});
				expect(sanitizeNumbers(error)).toStrictEqual({
					err: message.toString(),
				});
			});

			// it('converts Ok(u128)', () => {
			// 	const ok = new ResultConstructor(kusamaRegistry, {
			// 		ok: maxU128,
			// 	});

			// 	expect(sanitizeNumbers(ok)).toBe(MAX_U128);
			// });
			it('converts Ok(u128)', () => {
				const ok = new ResultConstructor(kusamaRegistry, {
					ok: maxU128,
				});

				expect(sanitizeNumbers(ok)).toStrictEqual({ ok: MAX_U128 });
			});

			// it('handles Ok(Text)', () => {
			// 	const R = Result.with({ Error: Text, Ok: Text });
			// 	const ok = new R(kusamaRegistry, {
			// 		Ok: message,
			// 	});
			// 	expect(sanitizeNumbers(ok)).toBe(message.toString());
			// });
			it('handles Ok(Text)', () => {
				const R = Result.with({ Err: 'Text', Ok: 'Text' });
				const ok = new R(kusamaRegistry, {
					ok: message,
				});
				expect(sanitizeNumbers(ok)).toStrictEqual({
					ok: message.toString(),
				});
			});
		});

		it('converts CodecSet', () => {
			const setRoles = {
				full: 1,
				authority: 3,
			};
			const set = new CodecSet(kusamaRegistry, setRoles, [
				'full',
				'authority',
			]);
			expect(sanitizeNumbers(set)).toStrictEqual(['full', 'authority']);
		});

		describe('Struct', () => {
			it('converts a simple Struct', () => {
				const struct = new Struct(
					kusamaRegistry,
					{
						foo: 'Text',
						bar: 'u32',
					},
					{ foo: 'hi :)', bar: MAX_U32 }
				);

				expect(sanitizeNumbers(struct)).toStrictEqual({
					foo: 'hi :)',
					bar: MAX_U32,
				});
			});

			it('converts a more complex Struct', () => {
				const struct = new Struct(
					kusamaRegistry,
					{
						foo: Vec.with(
							Struct.with({
								w: 'Text',
								bar: 'u32',
							})
						),
					},
					{
						foo: [
							{ bar: MAX_U32, w: 'x' },
							{ bar: '0', w: 'X' },
						],
					}
				);

				expect(sanitizeNumbers(struct)).toStrictEqual({
					foo: [
						{ bar: MAX_U32, w: 'x' },
						{ bar: '0', w: 'X' },
					],
				});
			});

			it('converts a five deep nested struct', () => {
				const content = {
					n: MAX_U32,
					x: {
						n: MAX_U32,
						x: {
							n: MAX_U32,
							x: {
								n: MAX_U32,
								x: {
									n: MAX_U128,
									w: 'sorry',
								},
							},
						},
					},
				};
				const struct = new Struct(
					kusamaRegistry,
					{
						n: 'u32',
						x: Struct.with({
							n: 'u32',
							x: Struct.with({
								n: 'u32',
								x: Struct.with({
									n: 'u32',
									x: Struct.with({
										n: 'u128',
										w: 'Text',
									}),
								}),
							}),
						}),
					},
					content
				);

				expect(sanitizeNumbers(struct)).toStrictEqual(content);
			});
		});

		describe('Tuple', () => {
			it('converts a simple Tuple', () => {
				const tuple = new Tuple(
					kusamaRegistry,
					['Text', 'u128'],
					['xX', MAX_U128]
				);

				expect(sanitizeNumbers(tuple)).toStrictEqual(['xX', MAX_U128]);
			});

			it('converts a 3 deep nested Tuple', () => {
				const tuple = new Tuple(
					kusamaRegistry,
					[Tuple.with([Tuple.with(['u32', 'u128']), 'u128']), 'u32'],
					[[0, 6074317682114550], 0]
				);

				expect(sanitizeNumbers(tuple)).toStrictEqual([
					[['0', '0'], '6074317682114550'],
					'0',
				]);
			});
		});

		it('converts U8a fixed', () => {
			const u8a = new (U8aFixed.with(32))(kusamaRegistry, [0x02, 0x03]);
			expect(sanitizeNumbers(u8a)).toStrictEqual('0x02030000');
		});

		it('converts Vec<U128>', () => {
			const vec = new (Vec.with('u128'))(kusamaRegistry, [
				'0',
				'366920938463463374607431768211455',
				MAX_U128,
			]);
			expect(sanitizeNumbers(vec)).toStrictEqual([
				'0',
				'366920938463463374607431768211455',
				MAX_U128,
			]);
		});

		it('converts VecFixed<U128>', () => {
			const vec = new (VecFixed.with('u128', 3))(kusamaRegistry, [
				'0',
				'366920938463463374607431768211455',
				MAX_U128,
			]);

			expect(sanitizeNumbers(vec)).toStrictEqual([
				'0',
				'366920938463463374607431768211455',
				MAX_U128,
			]);
		});
	});

	describe('substrate specific types', () => {
		it('handles AccountId', () => {
			const id = kusamaRegistry.createType(
				'AccountId',
				'5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw'
			);
			expect(sanitizeNumbers(id)).toBe(
				'5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw'
			);
		});

		it('handles AccountIndex', () => {
			const i = kusamaRegistry.createType('AccountIndex', 256);
			expect(sanitizeNumbers(i)).toBe('25GUyv');
		});

		it('handles Call', () => {
			const c = new GenericCall(kusamaRegistry, {
				args: [
					'5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
					100000,
				],
				callIndex: [6, 0], // balances.transfer
			});
			expect(sanitizeNumbers(c)).toStrictEqual({
				args: {
					dest: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
					value: '100000',
				},
				callIndex: '0x0600',
			});
		});

		it('handles Event', () => {
			const event = kusamaRegistry.createType(
				'Event',
				new Uint8Array([6, 1, 1, 1])
			);
			expect(sanitizeNumbers(event)).toStrictEqual({
				data: ['257', '0', []],
				index: '0x0601',
			});
		});

		it('handles EventRecord', () => {
			const eventRecord = kusamaRegistry.createType(
				'Vec<EventRecord>',
				'0x0800000000000000000001000000000000'
			);
			expect(sanitizeNumbers(eventRecord)).toStrictEqual([
				{
					event: {
						data: [
							{
								class: 'Normal',
								paysFee: 'Yes',
								weight: '65536',
							},
						],
						index: '0x0000',
					},
					phase: { applyExtrinsic: '0' },
					topics: [],
				},
				{
					event: { data: null, index: '0x0000' },
					phase: { applyExtrinsic: '0' },
					topics: [],
				},
			]);
		});

		it('handles Extrinsic', () => {
			const extrinsic = kusamaRegistry.createType(
				'Extrinsic',
				'0x250284d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d0182630bcec823e017e7ae576feda0dae3bf76f74049f3b8f72884dcb41169154bc7d179d47b50453f4f8865a5f3030c1e78ed8eff624765d0ff5eb0136a46538e1502000005008eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a4830'
			);
			expect(sanitizeNumbers(extrinsic)).toBe(
				'0xb10184d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d0182630bcec823e017e7ae576feda0dae3bf76f74049f3b8f72884dcb41169154bc7d179d47b50453f4f8865a5f3030c1e78ed8eff624765d0ff5eb0136a46538e1502000005008eaf0415'
			);
		});

		it('handles ExtrinsicEra', () => {
			const extrinsicEra = kusamaRegistry.createType(
				'ExtrinsicEra',
				'0x6502'
			);
			expect(sanitizeNumbers(extrinsicEra)).toStrictEqual({
				mortalEra: ['64', '38'],
			});
		});

		it('ExtrinsicPayload', () => {
			const load = {
				address: '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE',
				blockHash:
					'0xde8f69eeb5e065e18c6950ff708d7e551f68dc9bf59a07c52367c0280f805ec7',
				era: '0x0703',
				genesisHash:
					'0xdcd1346701ca8396496e52aa2785b1748deb6db09551b72159dcb3e08991025b',
				method:
					'0x0600ffd7568e5f0a7eda67a82691ff379ac4bba4f9c9b859fe779b5d46363b61ad2db9e56c',
				nonce: '0x00001234',
				specVersion: 123,
				tip: '0x00000000000000000000000000005678',
			};

			const extrinsicPayload = kusamaRegistry.createType(
				'ExtrinsicPayload',
				load,
				{
					version: 4,
				}
			);
			expect(sanitizeNumbers(extrinsicPayload)).toBe(
				'0x940600ffd7568e5f0a7eda67a82691ff379ac4bba4f9c9b859fe779b5d46363b61ad2db9e56c0703d148e25901007b00000000000000dcd1346701ca8396496e52aa2785b1748deb6db09551b72159dcb3e08991025bde8f69eeb5e065e18c6950ff708d7e551f68dc9bf59a07c52367c0280f805ec7'
			);
		});

		it('handles Vote', () => {
			const aye = kusamaRegistry.createType('Vote', {
				aye: true,
				conviction: 'Locked2x',
			});
			expect(sanitizeNumbers(aye)).toBe('0x82');

			const nay = kusamaRegistry.createType('Vote', {
				aye: false,
				conviction: 'Locked2x',
			});
			expect(sanitizeNumbers(nay)).toBe('0x02');
		});

		it('converts Moment', () => {
			const m = kusamaRegistry.createType('Moment', MAX_U64);
			expect(sanitizeNumbers(m)).toBe(MAX_U64);

			const z = kusamaRegistry.createType('Moment', 0);
			expect(sanitizeNumbers(z)).toBe('0');
		});

		it('converts Signature', () => {
			const s = kusamaRegistry.createType('Signature', MAX_U64);
			expect(sanitizeNumbers(s)).toBe(
				'0x31383434363734343037333730393535313631350000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
			);
		});

		it('StorageData', () => {
			const d = kusamaRegistry.createType(
				'StorageData',
				'0x2082c39b31a2b79a90f8e66e7a77fdb85a4ed5517f2ae39f6a80565e8ecae85cf54de37a07567ebcbf8c64568428a835269a566723687058e017b6d69db00a77e758d67e0f9be62dce75adbb005e8097de5c45f32b1ba7264717df2db4ae9f276e8101764f45778d4980dadaceee6e8af2517d3ab91ac9bec9cd1714fa5994081ca070532405ebf20fba389cbabfe1885cc134ee18028d488714eae621b47baf9d227cee94fa4e88d8d25abe706f15aca03b1d753d433f5ef9aa9ad1bcf5e5b81e040c8dc048a6d129803caa851c4c9633610068e4ef9eaa0bfbf40dfbfd43d9222347812ef77d9fd3cca1673e1b2bde54da96fddcf79d92832b1e2a819724f140'
			);
			expect(sanitizeNumbers(d)).toBe(
				'0x2082c39b31a2b79a90f8e66e7a77fdb85a4ed5517f2ae39f6a80565e8ecae85cf54de37a07567ebcbf8c64568428a835269a566723687058e017b6d69db00a77e758d67e0f9be62dce75adbb005e8097de5c45f32b1ba7264717df2db4ae9f276e8101764f45778d4980dadaceee6e8af2517d3ab91ac9bec9cd1714fa5994081ca070532405ebf20fba389cbabfe1885cc134ee18028d488714eae621b47baf9d227cee94fa4e88d8d25abe706f15aca03b1d753d433f5ef9aa9ad1bcf5e5b81e040c8dc048a6d129803caa851c4c9633610068e4ef9eaa0bfbf40dfbfd43d9222347812ef77d9fd3cca1673e1b2bde54da96fddcf79d92832b1e2a819724f140'
			);
		});

		it('converts Balance', () => {
			const balanceZero = kusamaRegistry.createType('Balance', '0x0');
			expect(sanitizeNumbers(balanceZero)).toBe('0');

			const balanceTen = kusamaRegistry.createType('Balance', 10);
			expect(sanitizeNumbers(balanceTen)).toBe('10');

			const balancePaddedHex = kusamaRegistry.createType(
				'Balance',
				'0x000000000000000004fe9f24a6a9c00'
			);
			expect(sanitizeNumbers(balancePaddedHex)).toBe('22493750000000000');

			const balanceMax = kusamaRegistry.createType('Balance', MAX_U128);
			expect(sanitizeNumbers(balanceMax)).toBe(MAX_U128);
		});

		it('converts Compact<Balance>', () => {
			const compactBalanceZero = kusamaRegistry.createType(
				'Compact<Balance>',
				'0x0'
			);
			expect(sanitizeNumbers(compactBalanceZero)).toBe('0');

			const compactBalancePaddedHex = kusamaRegistry.createType(
				'Compact<Balance>',
				'0x0000000000000000004fe9f24a6a9c00'
			);
			expect(sanitizeNumbers(compactBalancePaddedHex)).toBe(
				'22493750000000000'
			);

			const compactBalancePaddedHex2 = kusamaRegistry.createType(
				'Compact<Balance>',
				'0x000000000000000000ff49f24a6a9c00'
			);
			expect(sanitizeNumbers(compactBalancePaddedHex2)).toBe(
				'71857424040631296'
			);

			const compactBalanceMax = kusamaRegistry.createType(
				'Compact<Balance>',
				MAX_U128
			);
			expect(sanitizeNumbers(compactBalanceMax)).toBe(MAX_U128);
		});

		it('converts Index and Compact<Index>', () => {
			const IndexPadded = kusamaRegistry.createType(
				'Index',
				'0x00000384'
			);
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
				MAX_U128
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
				total: MAX_U128,
				active: '71857424040628480',
			};

			expect(sanitizeNumbers(arbitraryObject)).toStrictEqual(
				sanitizedArbitraryObject
			);
		});

		it('converts a staking response', () => {
			expect(
				sanitizeNumbers(PRE_SANITIZED_STAKING_RESPONSE)
			).toStrictEqual({
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
				weight: MAX_U64,
				class: 'Operational',
				partialFee: MAX_U128,
			});
		});

		it('handles enum ElectionStatus', () => {
			const open = kusamaRegistry.createType('ElectionStatus', {
				open: 420420,
			});
			expect(sanitizeNumbers(open)).toStrictEqual({ open: '420420' });

			const close = kusamaRegistry.createType('ElectionStatus', 'close');
			expect(sanitizeNumbers(close)).toStrictEqual({ close: null });
		});
	});

	it('handles Vec<AccountId>', () => {
		const vec = new Vec(kusamaRegistry, 'AccountId', [
			'5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
			'5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
			'5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
		]);

		expect(sanitizeNumbers(vec)).toStrictEqual([
			'5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
			'5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
			'5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
		]);
	});
});
