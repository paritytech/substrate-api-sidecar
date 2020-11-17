import { BlockHash, Exposure } from '@polkadot/types/interfaces';
import { InternalServerError } from 'http-errors';
import { INominations } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

export class AccountsNominationsService extends AbstractService {
	/**
	 * Fetch nominations for an account at a given block.
	 *
	 * @param hash `BlockHash` to make call at
	 * @param address address of the account to get the vesting info of
	 */
	async fetchNominations(
		hash: BlockHash,
		address: string
	): Promise<INominations | null> {
		const { api } = this;

		const [
			activeEraOption,
			nominationsOpt,
			{ number },
		] = await Promise.all([
			api.query.staking.activeEra.at(hash),
			api.query.staking.nominators.at(hash, address),
			api.rpc.chain.getHeader(hash),
		]);

		if (activeEraOption.isNone) {
			// TODO refactor to newer error type
			throw new InternalServerError(
				'ActiveEra is None when Some was expected.'
			);
		}

		const { index: activeEra } = activeEraOption.unwrap();
		const at = {
			height: number.unwrap().toString(10),
			hash,
		};

		if (nominationsOpt.isNone) {
			return {
				at,
				submittedIn: null,
				targets: [],
			};
		}

		const { targets, submittedIn } = nominationsOpt.unwrap();

		const [exposures, stashes] = await Promise.all([
			api.query.staking.erasStakers.multi<Exposure>(
				targets.map((target) => [activeEra, target])
			),
			api.derive.staking.stashes(),
		]);

		const allStashes = stashes.map((stash) => stash.toString());

		return {
			at,
			submittedIn: submittedIn,
			targets: targets.map((target, index) => {
				const exposure = exposures[index];

				const individualExposure = exposure?.others.find(
					(o) => o.who.toString() === address
				);
				const value = individualExposure
					? individualExposure.value
					: null;

				const status = exposure.others.length
					? individualExposure
						? 'active'
						: 'inactive'
					: allStashes.includes(target.toString())
					? 'waiting'
					: null;

				return {
					address: target.toString(),
					value,
					status,
				};
			}),
		};
	}
}
