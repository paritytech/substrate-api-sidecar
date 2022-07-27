# Substrate Api Sidecar chain integration guide

This guide aims to help chain builders integrate their Substrate FRAME based chain with Substrate API Sidecar.

## Table of contents

- [Polkadot-js API type definition support](#polkadot-js-API-type-definition-support)
- [Controller configuration](controller-configuration)

## Polkadot-js API type definition support

In order decode the SCALE encoded data from a substrate based node, polkadot-js needs to have a registry of type definitions. This information can be decorated via the metadata, but if there are any custom substrate types that must be added to sidecar you can via [Custom substrate types](../README.md/#custom-substrate-types).

## Controller configuration

Sidecar offers the ability to configure which controllers to mount. Sidecar uses a chain's spec name to determine which controller config to use, and if no config is linked to a spec name, then the [default config](/src/chains-config/defaultControllers.ts) is used.

A chain builder can follow the steps below and submit a chain's controller config via PR, where it will be reviewed and merged once deemed ready by the maintainers.

#### 1) Create a controller config

 Create a controller config for your chain. The shape of the controller config is specified [here](/src/types/chains-config/ControllerConfig.ts). The `controllers` property has keys from the [controller export](/src/controllers/index.ts), which is an exhaustive collection of the available controller classes. In order to see the path(s) associated with a controller one must look in the controller source code.

 The easiest way to start creating a controller config would be to copy [defaultControllers.ts](/src/chains-config/ControllerConfig.ts) and name the file and export `{specName}Controllers`. Then remove or add any of the controllers you want inside of the `controllers` array. Ensure to export the controller config from `chains-config` by adding `export * from './{specName}Controllers.ts'` in [/src/chains-config/index.ts](/src/chains-config/index.ts).

 To determine what controllers to include, one must consider the runtime logic, specifically what pallets the chain uses. It is important to keep in mind the assumptions the service's logic makes and what exact pallets the service queries.

An example is in order. If we want to use [`PalletsStakingProgressController`](/src/controllers/pallets/PalletsStakingProgressController.ts), first check [`PalletsStakingProgressService.ts`](/src/services/pallets/PalletsStakingProgressService.ts); here we see it queries `staking`, `sessions`, `babe` pallets and makes certain assumptions about how the pallets are used together in the runtime. If we determine that both have all storage items queried, and the assumptions made about the staking system are correct, we can then declare in `{specName}Controllers` (the controller config object) that we want to mount the controller by adding `PalletsStakingProgressController` to the `controllers` array [... `PalletsStakingProgressController`... ]. Finally, we can test it out by starting up Sidecar against our chain and accessing the `pallets/staking/progress` endpoint, verifying that the information returned is correct.

In some circumstances, a chain may need a new path, modify a path or alter business logic for a path. Path changes that help a chain support wallets will be given priority. Breaking changes to paths are usually rejected.

##### Basic balance transfer support

In order to support traditional balance transfers the chain's Sidecar endpoints should support account balance lookup, transaction submission, transaction material retrieval, and block queries.

To support these features the following endpoints are necessary:

|                   Path                   |           Controller          |                                 Description                                |
|:----------------------------------------:|:-----------------------------:|:--------------------------------------------------------------------------:|
|       GET  `/transaction/material`       | TransactionMaterialController | Get all the network information needed to construct a transaction offline. |
|            POST `/transaction`           |  TransactionSubmitController  |            Submit a transaction to the node's transaction pool.            |
| GET `/blocks/head`  & `/blocks/{number}` |        BlocksController       |                                Get a block.                                |
|  GET `accounts/{accountId}/balance-info` | AccountsBalanceInfoController |                   Get balance information for an account.                  |

#### 2) Update `specToControllerMap`

In order for Sidecar to use your controller config, the `specToControllerMap` in [/src/chains-config/index.ts](/src/chains-config/index.ts) must be updated with the chain's `specName` and controller config by adding them as a property to `specToControllerMap`:

```javascript
const specToControllerMap = {
  kulupu: kulupuControllers,
  mandala: mandalaControllers,
  {specName}: {specName}Controllers,
};
```

#### 3) Test

Run it against a node running your chain in archive mode:

- Ensure all the expected paths work, including the root path, preferably with tests
- Exercise each query param of every path
- Make sure transaction submission works
- Try out historic queries across runtimes where types might change

#### 4) Submit your PR

Make sure it passes lint with `yarn lint --fix` and tests with `yarn test`. Then submit a PR for review.

#### 5) Maintenance

- If the business logic or storage of a chain's pallet queried by a Sidecar endpoint is changed, ensure that the corresponding service logic is updated in Sidecar as well
