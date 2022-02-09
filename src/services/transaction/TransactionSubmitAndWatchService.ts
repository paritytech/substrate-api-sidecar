import { AugmentedRpc, PromiseRpcResult } from '@polkadot/api/types';
import { CodecHash, ExtrinsicStatus } from '@polkadot/types/interfaces';
import { Extrinsic } from '@polkadot/types/interfaces';
import { AnyTuple, IExtrinsic } from '@polkadot/types/types';
import { Observable } from 'rxjs';

import { AbstractService } from '../AbstractService';
import { extractCauseAndStack } from './extractCauseAndStack';

interface ExtrinsicResult {
	hash: CodecHash;
	index: number;
	isFinalized: boolean;
	isInBlock: boolean;
	blockHash: ExtrinsicStatus;
}

export class TransactionSubmitAndWatchService extends AbstractService {
	async submitAndWatchTransaction(
		transaction: string
	): Promise<ExtrinsicResult> {
		const { api } = this;

		let tx;
		try {
			tx = api.tx(transaction);
		} catch (err) {
			const { cause, stack } = extractCauseAndStack(err);

			throw {
				error: 'Failed to parse transaction.',
				transaction,
				cause,
				stack,
			};
		}

		try {
			const result = await this.subscribe(
				api.rpc.author.submitAndWatchExtrinsic,
				2,
				tx
			);

			return {
				hash: result.hash,
				index: result.index,
				isFinalized: result.isFinalized,
				isInBlock: result.isInBlock,
				blockHash: result,
			};
		} catch (err) {
			const { cause, stack } = extractCauseAndStack(err);

			throw {
				error: 'Failed to submit transaction.',
				transaction,
				cause,
				stack,
			};
		}
	}

	/**
	 * Helper function for any subscriptions that are tested.
	 *
	 * @param apiFn The substrate subscription rpc method to be passed in
	 * @param reqCounter How many req's to test for, when the number is met the test
	 * will return true
	 * @param timeCounter How many seconds to wait for the subscriptions before timing
	 * out and return false
	 */
	private async subscribe(
		apiFn: PromiseRpcResult<
			AugmentedRpc<
				(extrinsic: IExtrinsic<AnyTuple>) => Observable<ExtrinsicStatus>
			>
		>,
		reqCounter: number,
		tx: Extrinsic,
		timeCounter = 30
	): Promise<ExtrinsicStatus> {
		let count = 0;
		let whileCounter = 0;
		let isSubscribed = true;

		const arr: ExtrinsicStatus[] = [];
		const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

		/**
		 * Subscribe to an api call.
		 */
		const unsub = await apiFn(tx, (res: ExtrinsicStatus) => {
			arr.push(res);

			if (++count === reqCounter) {
				isSubscribed = false;
				unsub();
			} else if (res.isInBlock && res.isFinalized) {
				isSubscribed = false;
				unsub();
			}
		});

		/**
		 * Timer: DEFAULT 30s
		 *
		 * This is a timer that keeps the subscription alive for a given maximum amount of time.
		 * If the `reqCounter` does not equal the `count` in this given amount of time, then it will exit
		 * the subscription with a fail.
		 */
		while (isSubscribed) {
			await timer(1000);
			whileCounter += 1;

			// 30 Seconds has gone by so we exit the subscription
			if (whileCounter === timeCounter) {
				isSubscribed = false;
				unsub();
			}
		}

		return arr[arr.length - 1];
	}
}
