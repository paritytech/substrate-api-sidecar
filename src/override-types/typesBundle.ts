import { OverrideBundleDefinition } from '@polkadot/types/types';

const definitionsWestmint: OverrideBundleDefinition = {
	types: [
		{
			minmax: [0, 9434],
			types: {
				TempAssetId: 'Option<AssetId>',
			},
		},
		{
			minmax: [9435, undefined],
			types: {
				TempAssetId: 'Option<MultiLocation>',
			},
		},
	],
	signedExtensions: {
		ChargeAssetTxPayment: {
			extrinsic: {
				tip: 'Compact<Balance>',
				// eslint-disable-next-line sort-keys
				assetId: 'TempAssetId',
			},
			payload: {},
		},
	},
};

const definitionsStatemine: OverrideBundleDefinition = {
	types: [
		{
			minmax: [0, 9999],
			types: {
				TempAssetId: 'Option<AssetId>',
			},
		},
		{
			minmax: [10000, undefined],
			types: {
				TempAssetId: 'Option<MultiLocation>',
			},
		},
	],
	signedExtensions: {
		ChargeAssetTxPayment: {
			extrinsic: {
				tip: 'Compact<Balance>',
				// eslint-disable-next-line sort-keys
				assetId: 'TempAssetId',
			},
			payload: {},
		},
	},
};

export default {
	spec: { statemine: definitionsStatemine, westmint: definitionsWestmint },
};
