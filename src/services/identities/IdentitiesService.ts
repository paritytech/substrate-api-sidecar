import { Data, Option } from '@polkadot/types';
import { AccountId, Registration } from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';
import { u8aToString } from '@polkadot/util';
import { IIdentity } from 'src/types/responses';

import { AbstractService } from '../AbstractService';

/**
 * @source https://github.com/polkadot-js/api/blob/master/packages/api-derive/src/accounts/info.ts
 */
function dataAsString(data: Data): string | undefined {
	return data.isRaw
		? u8aToString(data.asRaw.toU8a(true))
		: data.isNone
		? undefined
		: data.toHex();
}

export class IdentitiesService extends AbstractService {
	/**
	 * Fetch a single identity
	 *
	 * @param address - the account address
	 */
	async fetchIdentity(address: AccountId | string): Promise<IIdentity> {
		const { api } = this;

		const [identity, superOfOpt] = await Promise.all([
			api.query.identity.identityOf(address),
			api.query.identity.superOf(address),
		]);

		const unwrappedSuperOf = superOfOpt?.isSome
			? superOfOpt?.unwrap()
			: undefined;

		const parentIdentities = await this.fetchParentIdentityMap([
			unwrappedSuperOf,
		]);

		return this.extractIdentity(
			identity,
			unwrappedSuperOf,
			parentIdentities
		);
	}

	/**
	 * Fetch a list of identities
	 *
	 * @param addresses - list of addresses to fetch identities
	 */
	async multiIdentities(
		addresses: AccountId[] | string[]
	): Promise<IIdentity[]> {
		const { api } = this;

		const [identities, superOfOpts] = await Promise.all([
			api.query.identity.identityOf.multi<Option<Registration>>(
				addresses
			),
			api.query.identity.superOf.multi<Option<ITuple<[AccountId, Data]>>>(
				addresses
			),
		]);

		const unwrappedSuperOfs = superOfOpts.map((superOfOpt) =>
			superOfOpt?.isSome ? superOfOpt?.unwrap() : undefined
		);

		const parentIdentities = await this.fetchParentIdentityMap(
			unwrappedSuperOfs
		);

		return identities.map((identity, index) =>
			this.extractIdentity(
				identity,
				unwrappedSuperOfs[index],
				parentIdentities
			)
		);
	}

	/**
	 * Early loading of identities of all parent, mapped by address.
	 *
	 * @param unwrappedSuperOfs - the superOf array after unwrap()
	 */
	private async fetchParentIdentityMap(
		unwrappedSuperOfs: (ITuple<[AccountId, Data]> | undefined)[]
	): Promise<Map<String, Option<Registration>>> {
		const addresses = unwrappedSuperOfs
			.map((superOf) => superOf && superOf[0])
			.filter(Boolean) as AccountId[]; // Remove undefineds

		const uniqAddresses = [...new Set(addresses)]; // Avoid querying the same address multiple times

		const parentIdentities = await this.api.query.identity.identityOf.multi<
			Option<Registration>
		>(uniqAddresses);

		const map = new Map<String, Option<Registration>>(
			addresses.map((addr, index) => [
				addr.toString(),
				parentIdentities[index],
			])
		);

		return map;
	}

	/**
	 * Format Identity from identityOf, superOf and a map of parent identities early loaded
	 *
	 * @param identityOfOpt
	 * @param superOfOpt
	 *
	 * @source https://github.com/polkadot-js/api/blob/master/packages/api-derive/src/accounts/info.ts
	 */
	private extractIdentity(
		identityOfOpt?: Option<Registration>,
		superOf?: ITuple<[AccountId, Data]>,
		parentIdentities?: Map<String, Option<Registration>>
	): IIdentity {
		// Choose best identity, parent identity as a fallback if any.
		const identity = identityOfOpt?.isSome
			? identityOfOpt
			: superOf && parentIdentities
			? parentIdentities.get(superOf[0].toString())
			: null;

		if (!identity) {
			return null;
		}

		const { info, judgements } = identity.unwrap();
		const topDisplay = dataAsString(info.display);

		return {
			display: superOf
				? dataAsString(superOf[1]) || topDisplay
				: topDisplay,
			displayParent: superOf ? topDisplay : undefined,
			email: dataAsString(info.email),
			image: dataAsString(info.image),
			judgements,
			legal: dataAsString(info.legal),
			other: info.additional.reduce(
				(
					other: Record<string, string>,
					[_key, _value]
				): Record<string, string> => {
					const key = dataAsString(_key);
					const value = dataAsString(_value);

					if (key && value) {
						other[key] = value;
					}

					return other;
				},
				{}
			),
			parent: superOf ? superOf[0] : undefined,
			pgp: info.pgpFingerprint.isSome
				? info.pgpFingerprint.unwrap().toHex()
				: undefined,
			riot: dataAsString(info.riot),
			twitter: dataAsString(info.twitter),
			web: dataAsString(info.web),
		};
	}
}
