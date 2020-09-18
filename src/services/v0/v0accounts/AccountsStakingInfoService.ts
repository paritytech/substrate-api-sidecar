import { BlockHash } from '@polkadot/types/interfaces';
import { IAccountStakingInfo } from 'src/types/responses';

import { AbstractService } from '../../AbstractService';

export class AccountsStakingInfoService extends AbstractService {
	/**
	 * Fetch staking information for a _Stash_ account at a given block.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param stash address of the _Stash_  account to get the staking info of
	 */
	async fetchAccountStakingInfo(
		hash: BlockHash,
		stash: string
	): Promise<IAccountStakingInfo> {
		const { api } = this;

		const [header, controllerOption] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			api.query.staking.bonded.at(hash, stash), // Option<AccountId> representing the controller
		]);

		const at = {
			hash,
			height: header.number.unwrap().toString(10),
		};

		if (controllerOption.isNone) {
			throw {
				// TODO convert to newer type error
				error: `The address ${stash} is not a stash address.`,
				statusCode: 400,
			};
		}

		const controller = controllerOption.unwrap();

		const [
			stakingLedgerOption,
			rewardDestination,
			slashingSpansOption,
		] = await Promise.all([
			api.query.staking.ledger.at(hash, controller),
			api.query.staking.payee.at(hash, stash),
			api.query.staking.slashingSpans.at(hash, stash),
		]);

		const stakingLedger = stakingLedgerOption.unwrapOr(null);

		if (stakingLedger === null) {
			// TODO convert to newer type error
			// should never throw because by time we get here we know we have a bonded pair
			throw {
				error: `Staking ledger could not be found for controller address "${controller.toString()}"`,
				statusCode: 404,
			};
		}

		const numSlashingSpans = slashingSpansOption.isSome
			? slashingSpansOption.unwrap().prior.length + 1
			: 0;

		return {
			at,
			controller,
			rewardDestination,
			numSlashingSpans,
			staking: stakingLedger,
		};
	}
}
