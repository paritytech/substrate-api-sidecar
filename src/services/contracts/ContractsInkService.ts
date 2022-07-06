// Copyright 2017-2022 Parity Technologies (UK) Ltd.
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

import { ContractPromise } from '@polkadot/api-contract';
import { AbstractService } from '../AbstractService';

interface IContractsInkAccountBalance {
    balance: string;
}

export class ContractsInkService extends AbstractService {
    async fetchAccountBalance(
        address: string
    ): Promise<IContractsInkAccountBalance> {
        const { api } = this;

        // TODO: determine where the ABI should come from.
        const contract = new ContractPromise(api, {}, address);
        const res = contract.query.get(
            address,
            {
                gasLimit: -1,
                storageDepositLimit: null
            }
        );
        console.log(res);

        // TODO: What should the response be
        return {
            balance: ''
        }
    }
}
