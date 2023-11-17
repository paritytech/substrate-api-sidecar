// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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

import { assetHubKusamaV14 } from '../../../../test-helpers/metadata/assetHubKusamaMetadata';
import { createApiWithAugmentations, TypeFactory } from '../../../../test-helpers/typeFactory';
import { foreignAssetsInfo } from '../assets/mockAssetHubKusamaData';
import { foreignAssetsLocations } from './foreignAssets';

const typeFactoryApiV9430 = createApiWithAugmentations(assetHubKusamaV14);
const factory = new TypeFactory(typeFactoryApiV9430);

export const foreignAssetsEntries = () => {
	return foreignAssetsLocations.map((location, idx) => {
		const storage = factory.storageKeyMultilocation(
			location,
			'XcmV3MultiLocation',
			typeFactoryApiV9430.query.foreignAssets.asset,
		);

		const assetInfo = foreignAssetsInfo[idx]();
		return [storage, assetInfo];
	});
};
