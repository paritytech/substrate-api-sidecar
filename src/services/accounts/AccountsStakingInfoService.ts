import { BlockHash } from '@polkadot/types/interfaces';
import { BadRequest, InternalServerError } from 'http-errors';
import { IAccountStakingInfo } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

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
		const historicApi = await api.at(hash);

		const [header, controllerOption] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.staking.bonded(stash), // Option<AccountId> representing the controller
		]).catch((err: Error) => {
			throw this.createHttpErrorForAddr(stash, err);
		});

		const at = {
			hash,
			height: header.number.unwrap().toString(10),
		};

		if (controllerOption.isNone) {
			throw new BadRequest(`The address ${stash} is not a stash address.`);
		}

		const controller = controllerOption.unwrap();

		const [stakingLedgerOption, rewardDestination, slashingSpansOption] =
			await Promise.all([
				historicApi.query.staking.ledger(controller),
				historicApi.query.staking.payee(stash),
				historicApi.query.staking.slashingSpans(stash),
			]).catch((err: Error) => {
				throw this.createHttpErrorForAddr(stash, err);
			});

		const stakingLedger = stakingLedgerOption.unwrapOr(null);

		if (stakingLedger === null) {
			// should never throw because by time we get here we know we have a bonded pair
			throw new InternalServerError(
				`Staking ledger could not be found for controller address "${controller.toString()}"`
			);
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
