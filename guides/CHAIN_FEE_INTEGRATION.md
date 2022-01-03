# Substrate Api Sidecar Fee integration for chain builders

This will serve as a guide to add fee calculation support for a given chain. 

## @substrate/calc-fee

First, in order to get your chain to support fee calculation in sidecar you will need to add your chains calculation spec to `impl Multiplier` inside of `<ROOT>/calc/src/calc_fee.rs`. Specifically inside of the `fn new` functions `match` statement you will add your chains spec name, and the supported calculation method. See other chains configs as reference. 

Make sure you have the latest stable rust version before running:

```bash
# Compile the build to make sure it build correctly
cargo build --release
```

```bash
# Build the wasm package
`sh ./build.sh`
```

## @substrate/api-sidecar blockWeightStore

First, we need to add your chain to the `<ROOT>/src/chains-config/metadata-consts` directory. Start by creating a file called `<chainName>Consts.ts`. There are currently two types of weights we support as can be seen in `<ROOT>/src/chains-config/metadata-consts/substrateConsts.ts`, ie. (`extrinsicBaseWeight`, and `perClass`). This file will map out what runtime versions belong to which weight. 

NOTE: This file does not need to be actively updated with your runtime versions as once this is generated, if the runtime does not exist, sidecar will search for the weight and then cache it inside of the respected field.  

Example file:
```typescript
import { MetadataConsts } from '../../types/chains-config';
import { extrinsicBaseWeight, perClass } from './substrateConsts';

export const exampleDefinitions: MetadataConsts[] = [
	{
		runtimeVersions: [
			1, 2, 3
		],
		extrinsicBaseWeight,
	},
	{
		runtimeVersions: [
			4, 5, 6
		],
		perClass,
	},
];
```

We then need to update the `index.ts` file inside of `<ROOT>/src/chains-config/metadata-consts` with your chains config. Start by importing your definitions from the file we just created above:

```typescript
import { exampleDefinitions } from './exampleConsts.ts
```

After importing your definitions, we need to add your case to the switch statement inside of `getBlockWeight`.

```typescript
export function getBlockWeight(specName: string): BlockWeightStore {
	switch (specName) {
        ...
		case 'exampleChainName':
			return generateBlockWeightStore(exampleDefinitions);
        ...
		default:
			return {};
	}
}
```

Now that we have added your chains weight config to `metadata-consts` we now need to add it to your chains controller `options`. Inside of `<ROOT>/src/chains-config`, go to your respected chains controller config, and update two fields inside of the `options` object. `blockWeightStore`, and `minCalcFeeRuntime`. 

Example: 
```typescript
import { getBlockWeight } from './metadata-consts';
...
{
    ...,
    options: {
        minCalcFeeRuntime: 1,
        blockWeightStore: getBlockWeight('exampleChainName')
    }
}
```

`blockWeightStore`: This will call the `getBlockWeight` function we updated earlier and initialize an oject with your chains weight config. 

`minCalcFeeRuntime`: This will set the minimum runtime that supports weights for your chain.  

## Submitting your PR

Before submitting your PR, run the following and make sure they pass:

```bash
yarn lint --fix
yarn test
```
