import { BlockHash } from '@polkadot/types/interfaces';
import { BadRequest } from 'http-errors';
import { IAccountVestingInfo } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class AccountsVestingInfoService extends AbstractService {
	/**
	 * Fetch vesting information for an account at a given block.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address address of the account to get the vesting info of
	 */
	async fetchAccountVestingInfo(
		hash: BlockHash,
		address: string
	): Promise<IAccountVestingInfo> {
		const { api } = this;

		const historicApi = await api.at(hash);

		if (!historicApi.query.vesting) {
			throw new BadRequest(
				`Vesting pallet does not exist on the specified blocks runtime version`
			);
		}

		const [{ number }, vesting] = await Promise.all([
			api.rpc.chain.getHeader(hash),
			historicApi.query.vesting.vesting(address),
		]);

		const at = {
			hash,
			height: number.unwrap().toString(10),
		};

		if (vesting.isNone) {
			return {
				at,
				vesting: [],
			};
		} else {
			const unwrapVesting = vesting.unwrap();

			return {
				at,
				vesting: Array.isArray(unwrapVesting) ? unwrapVesting : [unwrapVesting],
			};
		}
	}
}
