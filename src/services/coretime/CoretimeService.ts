// Copyright 2017-2024 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// import { QueryableModuleStorage } from '@polkadot/api/types';
import { BlockHash } from '@polkadot/types/interfaces';

import { AbstractService } from '../AbstractService';

export class CoretimeService extends AbstractService {
	async getCoretimeParachains(hash: BlockHash) {
		const { api } = this;

		const historicApi = await api.at(hash);
		console.log(historicApi.query.broker, api.query.broker?.configuration);
		// this.assertQueryModule(historicApi.query.coretime, 'coretime');

		// this.assertQueryModule(historicApi.query.broker, 'broker');

		// this.assertQueryModule(historicApi.query.paras, 'paras');
		// if older than coretime, return either empty or paras module
	}

	/**
	 * Coretime pallets and modules are not available on all runtimes. This
	 * verifies that by checking if the module exists. If it doesnt it will throw an error
	 *
	 * @param queryFn The QueryModuleStorage key that we want to check exists
	 * @param mod Module we are checking
	 */
	// private assertQueryModule(queryFn: QueryableModuleStorage<'promise'>, mod: string): void {
	// 	if (!queryFn) {
	// 		throw Error(`The runtime does not include the ${mod} module at this block`);
	// 	}
	// }
}
