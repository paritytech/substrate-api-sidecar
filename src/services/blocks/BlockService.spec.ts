/* eslint-disable @typescript-eslint/no-unsafe-call */
import { GenericCall } from '@polkadot/types/generic';

import { createCall, kusamaRegistry } from '../../utils/testTools';
import { BlocksService } from './BlocksService';

const transfer = createCall('balances', 'transfer', {
	value: 12,
	dest: kusamaRegistry.createType(
		'AccountId',
		'14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3'
	), // Bob
});

const transferOutput = {
	method: 'balances.transfer',
	callIndex: new Uint8Array([6, 0]),
	args: {
		dest: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
		value: 12,
	},
};

describe('BlocksService.parseGenericCall', () => {
	it('does not handle an empty object', () =>
		expect(() =>
			BlocksService['parseGenericCall'](({} as unknown) as GenericCall)
		).toThrow());

	it('parses a simple balances.transfer', () => {
		expect(
			JSON.stringify(BlocksService['parseGenericCall'](transfer))
		).toBe(JSON.stringify(transferOutput));
	});

	it('parses utility.batch nested 4 deep', () => {
		const batch1 = createCall('utility', 'batch', {
			calls: [transfer],
		});

		const batch2 = createCall('utility', 'batch', {
			calls: [batch1, transfer],
		});

		const batch3 = createCall('utility', 'batch', {
			calls: [batch2, transfer],
		});

		const batch4 = createCall('utility', 'batch', {
			calls: [batch3, transfer],
		});

		const baseBatch = {
			method: 'utility.batch',
			callIndex: new Uint8Array([1, 0]),
			args: {
				calls: [],
			},
		};

		expect(JSON.stringify(BlocksService['parseGenericCall'](batch4))).toBe(
			JSON.stringify({
				...baseBatch,
				args: {
					calls: [
						{
							...baseBatch,
							args: {
								calls: [
									{
										...baseBatch,
										args: {
											calls: [
												{
													...baseBatch,
													args: {
														calls: [transferOutput],
													},
												},
												transferOutput,
											],
										},
									},
									transferOutput,
								],
							},
						},
						transferOutput,
					],
				},
			})
		);
	});

	it('handles a batch sudo proxy transfer', () => {
		const proxy = createCall('proxy', 'proxy', {
			forceProxyType: 'Any',
			call: transfer,
		});

		const sudo = createCall('sudo', 'sudo', {
			call: proxy,
		});

		const batch = createCall('utility', 'batch', {
			calls: [sudo, sudo, sudo],
		});

		const sudoOutput = {
			method: 'sudo.sudo',
			callIndex: new Uint8Array([18, 0]),
			args: {
				call: {
					method: 'proxy.proxy',
					callIndex: new Uint8Array([28, 0]),
					args: {
						real:
							'5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
						force_proxy_type: 'Any',
						call: transferOutput,
					},
				},
			},
		};

		expect(
			JSON.stringify(BlocksService['parseGenericCall'](batch))
		).toEqual(
			JSON.stringify({
				method: 'utility.batch',
				callIndex: new Uint8Array([1, 0]),
				args: {
					calls: [sudoOutput, sudoOutput, sudoOutput],
				},
			})
		);
	});
});
