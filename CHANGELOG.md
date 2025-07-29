# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [20.4.1](https://github.com/paritytech/substrate-api-sidecar/compare/v20.4.0..v20.4.1) (2025-07-29)

### Fix

- fix: rc specific endpoints initialisation ([#1720](https://github.com/paritytech/substrate-api-sidecar/pull/1720)) ([ca04ee7](https://github.com/paritytech/substrate-api-sidecar/commit/ca04ee7001a6bee5e3d749cc6daf5d8c27d30449))

## Compatibility

Tested against the following node releases:
- Polkadot v1.18.0 (Polkadot stable2503-5)
- Kusama v1.18.0 (Polkadot stable2503-5)
- Westend v1.18.0 (Polkadot stable2503-5)

Tested against the following runtime releases:
- Polkadot v1006001
- Kusama v1006001
- Westend v1018013
- Polkadot Asset Hub v1005001
- Kusama Asset Hub v1006000
- Westend Asset Hub v1018013

## [20.4.0](https://github.com/paritytech/substrate-api-sidecar/compare/v20.3.2..v20.4.0) (2025-07-24)

### Features

- feat: Support /rc for remaining endpoints ([#1713](https://github.com/paritytech/substrate-api-sidecar/pull/1713)) ([82fd9b2](https://github.com/paritytech/substrate-api-sidecar/commit/82fd9b2))
    - Adds comprehensive RC (Relay Chain) pallet endpoints including storage, constants, dispatchables, errors, and events
- feat: Add RC Runtime Endpoints for Relay Chain Access ([#1708](https://github.com/paritytech/substrate-api-sidecar/pull/1708)) ([3e38c0f](https://github.com/paritytech/substrate-api-sidecar/commit/3e38c0f))
    - Introduces `/rc/runtime/code`, `/rc/runtime/metadata`, and `/rc/runtime/spec` endpoints
- feat: Add RC Node Endpoints for Relay Chain Access ([#1710](https://github.com/paritytech/substrate-api-sidecar/pull/1710)) ([3b14547](https://github.com/paritytech/substrate-api-sidecar/commit/3b14547))
    - Adds `/rc/node/network`, `/rc/node/transaction-pool`, and `/rc/node/version` endpoints
- feat: Asset Hub migration and elastic scaling preparation - Array responses for `useRcBlock`, remove `rcAt` in favor of `useRcBlock` ([#1709](https://github.com/paritytech/substrate-api-sidecar/pull/1709))
([1c97088](https://github.com/paritytech/substrate-api-sidecar/commit/1c97088))
    - Standardizes relay chain block queries using `useRcBlock` parameter across all endpoints
- feat: Add remaining Accounts endpoints with `/rc` prefix ([#1704](https://github.com/paritytech/substrate-api-sidecar/pull/1704)) ([1376c35](https://github.com/paritytech/substrate-api-sidecar/commit/1376c35))
    - Introduces `/rc/accounts/:address/balance-info` and `/rc/accounts/:address/proxy-info` endpoints
- feat: Support `rcAt` for `/pallets/*` endpoints ([#1703](https://github.com/paritytech/substrate-api-sidecar/pull/1703)) ([00f8311](https://github.com/paritytech/substrate-api-sidecar/commit/00f8311))
    - Enables relay chain block queries for pallet endpoints using `rcAt` parameter
- feat: support `useRcBlock` for `/blocks/*` endpoints ([#1702](https://github.com/paritytech/substrate-api-sidecar/pull/1702)) ([c350c7e](https://github.com/paritytech/substrate-api-sidecar/commit/c350c7e))
    - Adds relay chain block support for block-related endpoints
- feat: Support `rcAt` for all applicable `/accounts/*` endpoints ([#1701](https://github.com/paritytech/substrate-api-sidecar/pull/1701)) ([9fcddc9](https://github.com/paritytech/substrate-api-sidecar/commit/9fcddc9))
    - Extends relay chain block queries to account endpoints
- feat: Add `rcAt` query parameter support for Asset Hub Migration ([#1700](https://github.com/paritytech/substrate-api-sidecar/pull/1700)) ([9febf6e](https://github.com/paritytech/substrate-api-sidecar/commit/9febf6e))
    - Initial implementation of relay chain block querying functionality
- feat: post AHM historical support for `/pallets/staking/progress` using local BABE calculations ([#1695](https://github.com/paritytech/substrate-api-sidecar/pull/1695))
([e3948b7](https://github.com/paritytech/substrate-api-sidecar/commit/e3948b7))
    - Adds historical staking progress support after Asset Hub Migration
- feat: `/rc/accounts/:accountId/balance-info` endpoint ([#1692](https://github.com/paritytech/substrate-api-sidecar/pull/1692)) ([a90ec1e](https://github.com/paritytech/substrate-api-sidecar/commit/a90ec1e))
    - First RC endpoint implementation for relay chain account balance queries

### Fix

- fix: tests in controllerInjection ([#1715](https://github.com/paritytech/substrate-api-sidecar/pull/1715)) ([6dca5f8](https://github.com/paritytech/substrate-api-sidecar/commit/6dca5f8))
- fix: Ensure `rcBlockNumber` is always a number ([#1714](https://github.com/paritytech/substrate-api-sidecar/pull/1714)) ([02f4788](https://github.com/paritytech/substrate-api-sidecar/commit/02f4788))
    - Ensures `rcBlockNumber` returns actual block numbers instead of hashes or "latest"
- fix: Fixes authorId for chains using the nimbus consensus engine ([#1698](https://github.com/paritytech/substrate-api-sidecar/pull/1698)) ([c71bc54](https://github.com/paritytech/substrate-api-sidecar/commit/c71bc54)) (Thanks to https://github.com/RomarQ)
- fix: remove unneccessary logging ([#1689](https://github.com/paritytech/substrate-api-sidecar/pull/1689)) ([b5f276a](https://github.com/paritytech/substrate-api-sidecar/commit/b5f276a))

### Chores

- chore(deps): upgrade chopsticks, and polkadot-js, remove resolutions ([#1685](https://github.com/paritytech/substrate-api-sidecar/pull/1685)) ([cfd18b8](https://github.com/paritytech/substrate-api-sidecar/commit/cfd18b8))

## Compatibility

Tested against the following node releases:
- Polkadot v1.18.0 (Polkadot stable2503-5)
- Kusama v1.18.0 (Polkadot stable2503-5)
- Westend v1.18.0 (Polkadot stable2503-5)

Tested against the following runtime releases:
- Polkadot v1006001
- Kusama v1006001
- Westend v1018013
- Polkadot Asset Hub v1005001
- Kusama Asset Hub v1006000
- Westend Asset Hub v1018013

### Extra Notes

This release introduces comprehensive Relay Chain (RC) endpoint support for Asset Hub instances. For detailed documentation on the `useRcBlock` parameter and RC endpoints, see: https://hackmd.io/bsNiDWbMRROB4olHbUtuaA

#### Endpoints Supporting `useRcBlock` Query Parameter

**Account Endpoints:**
- `/accounts/:address/balance-info`
- `/accounts/:address/asset-balances`
- `/accounts/:address/asset-approvals`
- `/accounts/:address/pool-asset-balances`
- `/accounts/:address/pool-asset-approvals`
- `/accounts/:address/proxy-info`
- `/accounts/:address/staking-info`
- `/accounts/:address/staking-payouts`
- `/accounts/:address/vesting-info`

**Block Endpoints:**
- `/blocks`
- `/blocks/head`
- `/blocks/:number`
- `/blocks/head/header`
- `/blocks/:number/header`
- `/blocks/:blockId/extrinsics/:extrinsicIndex`
- `/blocks/:blockId/extrinsics-raw`

**Pallet Endpoints:**
- `/pallets/:palletId/storage`
- `/pallets/:palletId/storage/:storageItemId`
- `/pallets/:palletId/consts`
- `/pallets/:palletId/consts/:constantItemId`
- `/pallets/:palletId/events`
- `/pallets/:palletId/events/:eventItemId`
- `/pallets/:palletId/errors`
- `/pallets/:palletId/errors/:errorItemId`
- `/pallets/:palletId/dispatchables`
- `/pallets/:palletId/dispatchables/:dispatchableItemId`
- `/pallets/assets/:assetId/asset-info`
- `/pallets/pool-assets/:assetId/asset-info`
- `/pallets/asset-conversion/*`
- `/pallets/on-going-referenda`

#### Endpoints with `/rc` Prefix

**RC Account Endpoints:**
- `/rc/accounts/:address/balance-info`
- `/rc/accounts/:address/proxy-info`

**RC Block Endpoints:**
- `/rc/blocks`
- `/rc/blocks/head`
- `/rc/blocks/:number`
- `/rc/blocks/head/header`
- `/rc/blocks/:number/header`
- `/rc/blocks/:blockId/extrinsics/:extrinsicIndex`
- `/rc/blocks/:blockId/extrinsics-raw`

**RC Pallet Endpoints:**
- `/rc/pallets/:palletId/storage`
- `/rc/pallets/:palletId/storage/:storageItemId`
- `/rc/pallets/:palletId/consts`
- `/rc/pallets/:palletId/consts/:constantItemId`
- `/rc/pallets/:palletId/events`
- `/rc/pallets/:palletId/events/:eventItemId`
- `/rc/pallets/:palletId/errors`
- `/rc/pallets/:palletId/errors/:errorItemId`
- `/rc/pallets/:palletId/dispatchables`
- `/rc/pallets/:palletId/dispatchables/:dispatchableItemId`
- `/rc/pallets/on-going-referenda`

**RC Runtime Endpoints:**
- `/rc/runtime/code`
- `/rc/runtime/metadata`
- `/rc/runtime/spec`

**RC Node Endpoints:**
- `/rc/node/network`
- `/rc/node/transaction-pool`
- `/rc/node/version`


## [20.3.2](https://github.com/paritytech/substrate-api-sidecar/compare/v20.3.1..v20.3.2) (2025-06-16)

### Fix

- chore: set calc to 0.3.1 ([#1680](https://github.com/paritytech/substrate-api-sidecar/pull/1680)) ([acad244](https://github.com/paritytech/substrate-api-sidecar/commit/acad244eec9723c26202c2dc12d764140bd033dd))
    - NOTE: This fixes an issue where staking-payouts was incorrectly returning the payouts for nominators.

## Compatibility

Tested against the following node releases:
- Polkadot v1.18.0 (Polkadot stable2503-5)
- Kusama v1.18.0 (Polkadot stable2503-5)
- Westend v1.18.0 (Polkadot stable2503-5)

Tested against the following runtime releases:
- Polkadot v1005001
- Kusama v1005001
- Westend v1018011

## [20.3.1](https://github.com/paritytech/substrate-api-sidecar/compare/v20.3.0..v20.3.1) (2025-06-12)

### Fix

- fix: retreive safeXcmVersion when xcmVersion is not in the body ([#1676](https://github.com/paritytech/substrate-api-sidecar/pull/1676)) ([bdf188e](https://github.com/paritytech/substrate-api-sidecar/commit/bdf188e1ccb01d1d34c4ab8ab346ba4caca9f234))

## Compatibility

Tested against the following node releases:
- Polkadot v1.18.0 (Polkadot stable2503-5)
- Kusama v1.18.0 (Polkadot stable2503-5)
- Westend v1.18.0 (Polkadot stable2503-5)

Tested against the following runtime releases:
- Polkadot v1005001
- Kusama v1005001
- Westend v1018011

## [20.3.0](https://github.com/paritytech/substrate-api-sidecar/compare/v20.2.2..v20.3.0) (2025-06-11)

### Features

- feat: AHM support for staking routes (part 1) ([#1636](https://github.com/paritytech/substrate-api-sidecar/pull/1636)) ([819c3df](https://github.com/paritytech/substrate-api-sidecar/commit/819c3df110683a14b8198cd84570ca446c692a53))
    - This also introduces the addition of `SAS_SUBSTRATE_MULTI_CHAIN_URL`
- feat: Add historic compatibility to staking AHM (part 2) ([#1671](https://github.com/paritytech/substrate-api-sidecar/pull/1671)) ([7c29820](https://github.com/paritytech/substrate-api-sidecar/commit/7c29820f934f671cff6b0d716876193ac4e3312c))

### Fix

- fix: add xcmVersion in DryRunCall ([#1649](https://github.com/paritytech/substrate-api-sidecar/pull/1649)) ([b2fee7d](https://github.com/paritytech/substrate-api-sidecar/commit/b2fee7d720ca00d27546e71c43bbdb1f436b1293))
- fix: Polymesh chain spec names + add controllers ([31655](https://github.com/paritytech/substrate-api-sidecar/pull/1655)) ([]())

### Chores

- chore(deps): bump @substrate/calc from 0.3.1 to 0.3.2 ([#1634](https://github.com/paritytech/substrate-api-sidecar/pull/1634)) ([3310e20](https://github.com/paritytech/substrate-api-sidecar/commit/3310e20c8932162b82102b4d329da5f8e509f909))
- chore(deps): bump express from 5.0.1 to 5.1.0 ([#1633](https://github.com/paritytech/substrate-api-sidecar/pull/1633)) ([6b43d6f](https://github.com/paritytech/substrate-api-sidecar/commit/6b43d6fa4c8f6a828a9b895ff110707e89b20355))
- chore(deps): bump docker/build-push-action from 6.15.0 to 6.16.0 ([#1640](https://github.com/paritytech/substrate-api-sidecar/pull/1640)) ([9cc1e37](https://github.com/paritytech/substrate-api-sidecar/commit/9cc1e3787834cc1418fe9e4f4ee7ac368e5f4612))
- chore(deps): bump the pjs group across 1 directory with 7 updates ([#1638](https://github.com/paritytech/substrate-api-sidecar/pull/1638)) ([e6e91f0](https://github.com/paritytech/substrate-api-sidecar/commit/e6e91f048cc8bda813b8b31191cb8078081889c0))
- chore(deps): bump http-proxy-middleware from 2.0.7 to 2.0.9 in /docs ([#1643](https://github.com/paritytech/substrate-api-sidecar/pull/1643)) ([9b4aa7e](https://github.com/paritytech/substrate-api-sidecar/commit/9b4aa7e466b52876c6cf4f6c048a15f7327de8dd))
- chore(deps): bump the pjs group with 5 updates ([#1648](https://github.com/paritytech/substrate-api-sidecar/pull/1648)) ([8e4051d](https://github.com/paritytech/substrate-api-sidecar/commit/8e4051d3d5db0ecffa14d21f46d5cc1651fcf2f7))
- chore(deps): bump docker/build-push-action from 6.16.0 to 6.17.0 ([#1650](https://github.com/paritytech/substrate-api-sidecar/pull/1650)) ([faa9cf1](https://github.com/paritytech/substrate-api-sidecar/commit/faa9cf1032d6dd231092fc01f0df5048c8b119cb))
- chore(deps-dev): bump @types/express from 5.0.1 to 5.0.2 ([#1651](https://github.com/paritytech/substrate-api-sidecar/pull/1651)) ([46c2d32](https://github.com/paritytech/substrate-api-sidecar/commit/46c2d322d59005aff4cea3dd4441678d525090aa))
- chore(deps): bump docker/build-push-action from 6.17.0 to 6.18.0 ([#1654](https://github.com/paritytech/substrate-api-sidecar/pull/1654)) ([23f536f](https://github.com/paritytech/substrate-api-sidecar/commit/23f536fa7aa09852e2aaa37f14fac7e503ff683b))
- chore(deps): bump the pjs group with 7 updates ([#1652](https://github.com/paritytech/substrate-api-sidecar/pull/1652)) ([6ffa1aa](https://github.com/paritytech/substrate-api-sidecar/commit/6ffa1aa0bd2128ee181336fb81e1e7bfa614605b))
- chore(deps): update polkadot-js deps to v16.0.1 ([#1656](https://github.com/paritytech/substrate-api-sidecar/pull/1656)) ([e4c4d42](https://github.com/paritytech/substrate-api-sidecar/commit/e4c4d42ca8f95a259eb548a9497a39ca4bf7f576))
- chore(deps): bump the pjs group with 5 updates ([#1657](https://github.com/paritytech/substrate-api-sidecar/pull/1657)) ([549bc51](https://github.com/paritytech/substrate-api-sidecar/commit/549bc519a4f09d31b009bac692ac75bc6bba5f3d))
- chore(deps-dev): bump webpack-dev-server from 5.2.0 to 5.2.1 in /docs ([#1659](https://github.com/paritytech/substrate-api-sidecar/pull/1659)) ([fa64739](https://github.com/paritytech/substrate-api-sidecar/commit/fa64739efa67675e79dc45393c91c9968a0231ea))

## Compatibility

Tested against the following node releases:
- Polkadot v1.18.0 (Polkadot stable2503-5)
- Kusama v1.18.0 (Polkadot stable2503-5)
- Westend v1.18.0 (Polkadot stable2503-5)

Tested against the following runtime releases:
- Polkadot v1005001
- Kusama v1005001
- Westend v1018011


## [20.2.2](https://github.com/paritytech/substrate-api-sidecar/compare/v20.2.1..v20.2.2) (2025-04-11)

### Fix

- fix: small updates in injection tests ([#1629](https://github.com/paritytech/substrate-api-sidecar/pull/1629)) ([f2066e0](https://github.com/paritytech/substrate-api-sidecar/commit/f2066e0e5ba58987e47f127fa294dd3e65711bb4))
- fix: replace unavailable endpoint ([#1627](https://github.com/paritytech/substrate-api-sidecar/pull/1627)) ([dbdb1d6](https://github.com/paritytech/substrate-api-sidecar/commit/dbdb1d6194cef3cf7c55cf2d1b8c23651101f804))

### Chores

- chore(deps-dev): bump @types/express from 5.0.0 to 5.0.1 ([#1623](https://github.com/paritytech/substrate-api-sidecar/pull/1623)) ([bd0b57a](https://github.com/paritytech/substrate-api-sidecar/commit/bd0b57ab69d3372cae5e8cffb2189f7bdc6c4efd))
- chore(deps): bump lru-cache from 11.0.2 to 11.1.0 ([#1624](https://github.com/paritytech/substrate-api-sidecar/pull/1624)) ([0ca4fcf](https://github.com/paritytech/substrate-api-sidecar/commit/0ca4fcf10ce93a515f8b1ac554e2ed6cbab72c25))
- chore(deps): bump actions/create-github-app-token from 1 to 2 ([#1626](https://github.com/paritytech/substrate-api-sidecar/pull/1626)) ([f7dc001](https://github.com/paritytech/substrate-api-sidecar/commit/f7dc001c20aa4ff3707d8fcdc2a0c5143e479802))
- chore(deps): bump Swatinem/rust-cache from 2.7.7 to 2.7.8 ([#1621](https://github.com/paritytech/substrate-api-sidecar/pull/1621)) ([6f6ae64](https://github.com/paritytech/substrate-api-sidecar/commit/6f6ae64c79494f12ae433da995e7df7987d3b1f5))
- chore(deps): bump the pjs group with 5 updates ([#1625](https://github.com/paritytech/substrate-api-sidecar/pull/1625)) ([d9c832e](https://github.com/paritytech/substrate-api-sidecar/commit/d9c832ec109ed9ed0417f468a156e35d4ffb9d21))
- chore(deps): update deps & small fixes in calc ([#1628](https://github.com/paritytech/substrate-api-sidecar/pull/1628)) ([219b8ad](https://github.com/paritytech/substrate-api-sidecar/commit/219b8add39647609bec1cbda279b29736c056a03))


## Compatibility

Tested against the following node releases:
- Polkadot v1.18.0 (Polkadot stable2503-3)
- Kusama v1.18.0 (Polkadot stable2503-3)
- Westend v1.18.0 (Polkadot stable2503-3)

Tested against the following runtime releases:
- Polkadot v1004001
- Kusama v1004001
- Westend v1018001

## [20.2.1](https://github.com/paritytech/substrate-api-sidecar/compare/v20.2.0..v20.2.1) (2025-03-14)

### Perf

- perf: optimization of mapStakers function ([#1613](https://github.com/paritytech/substrate-api-sidecar/pull/1613)) ([743cb79](https://github.com/paritytech/substrate-api-sidecar/commit/743cb79c5bcd1ba81437e1651310a64e5fd2850f))

### Fix

- fix: unappliedSlashes call in staking/progress endpoint ([#1612](https://github.com/paritytech/substrate-api-sidecar/pull/1612)) ([344491f](https://github.com/paritytech/substrate-api-sidecar/commit/344491fc2d8294b7cf156cbf9a4daa9f8d49235d))

### Chores

- chore(deps): update deps in /docs ([#1619](https://github.com/paritytech/substrate-api-sidecar/pull/1619)) ([37a3ebb](https://github.com/paritytech/substrate-api-sidecar/commit/37a3ebb64a7faf77e2cefd4824fef389f3ca5a77))
- chore(deps): bump axios from 1.7.7 to 1.8.3 in /docs ([#1618](https://github.com/paritytech/substrate-api-sidecar/pull/1618)) ([dec24d7](https://github.com/paritytech/substrate-api-sidecar/commit/dec24d724962af16e87db25f1b3e9729f9e8b4c6))
- chore(deps): bump @babel/runtime-corejs3 from 7.26.0 to 7.26.10 in /docs ([#1617](https://github.com/paritytech/substrate-api-sidecar/pull/1617)) ([01670c1](https://github.com/paritytech/substrate-api-sidecar/commit/01670c1777f8269c316fb62ec71fdf7551d9e282))
- chore(deps): bump @babel/runtime from 7.23.9 to 7.26.10 in /docs ([#1616](https://github.com/paritytech/substrate-api-sidecar/pull/1616)) ([b980479](https://github.com/paritytech/substrate-api-sidecar/commit/b980479ffc0198406c2a465e715a2f380edfe8eb))
- chore(deps): update polkadot-js deps to v15.8.1 ([#1615](https://github.com/paritytech/substrate-api-sidecar/pull/1615)) ([8a79dcc](https://github.com/paritytech/substrate-api-sidecar/commit/8a79dcc33678f8c8909b57b4d2528faab79f97c7))


## Compatibility

Tested against the following node releases:
- Polkadot v1.17.3 (Polkadot stable2412-3)
- Kusama v1.17.3 (Polkadot stable2412-3)
- Westend v1.17.3 (Polkadot stable2412-3)

Tested against the following runtime releases:
- Polkadot v1004001
- Kusama v1004001
- Westend v1018001

## [20.2.0](https://github.com/paritytech/substrate-api-sidecar/compare/v20.1.0..v20.2.0) (2025-03-03)

### Features

- feat: inject controllers using metadata's definition of pallets ([#1592](https://github.com/paritytech/substrate-api-sidecar/pull/1592)) ([2aa6e6a](https://github.com/paritytech/substrate-api-sidecar/commit/2aa6e6a8c705f8babb4147981b0b6e00ea670eda))
- feat: [AHM] - Add AH Next Westend chain ([#1586](https://github.com/paritytech/substrate-api-sidecar/pull/1586)) ([7217e6e](https://github.com/paritytech/substrate-api-sidecar/commit/7217e6e13158c3e63aa5aad548fc070b98bbbc5e))

### Fix

- fix: foreign asset multilocation as hex ([#1605](https://github.com/paritytech/substrate-api-sidecar/pull/1605)) ([e65ba2b](https://github.com/paritytech/substrate-api-sidecar/commit/e65ba2b314a1f40a089fc123b3f3793d114d5e9d))
- fix: asset-hub-next specName ([#1604](https://github.com/paritytech/substrate-api-sidecar/pull/1604)) ([38a3f84](https://github.com/paritytech/substrate-api-sidecar/commit/38a3f84578101f8a093d733b34ae44caca7f1616))

### Chores

- chore(deps): update polkadot-js deps to v15.7.1 ([#1606](https://github.com/paritytech/substrate-api-sidecar/pull/1606)) ([0ad81d1](https://github.com/paritytech/substrate-api-sidecar/commit/0ad81d173c712e4b58f804278176054f112b4b37))
- chore(deps): bump docker/build-push-action from 6.14.0 to 6.15.0 ([#1603](https://github.com/paritytech/substrate-api-sidecar/pull/1603)) ([e665b7a](https://github.com/paritytech/substrate-api-sidecar/commit/e665b7af0f63f2ee6e00e68dba78d92ac200b7fc))
- chore(deps): bump docker/build-push-action from 6.13.0 to 6.14.0 ([#1598](https://github.com/paritytech/substrate-api-sidecar/pull/1598)) ([2c926c7](https://github.com/paritytech/substrate-api-sidecar/commit/2c926c786536bfee73b1875909c13d0750284090))
- chore(deps): bump rxjs from 7.8.1 to 7.8.2 ([#1602](https://github.com/paritytech/substrate-api-sidecar/pull/1602)) ([18b0014](https://github.com/paritytech/substrate-api-sidecar/commit/18b0014f1dbccec0eade7b0d983fc037e861223d))


## Compatibility

Tested against the following node releases:
- Polkadot v1.17.2 (Polkadot stable2412-2)
- Kusama v1.17.2 (Polkadot stable2412-2)
- Westend v1.17.2 (Polkadot stable2412-2)

Tested against the following runtime releases:
- Polkadot v1004000
- Kusama v1004001
- Westend v1017001

## [20.1.0](https://github.com/paritytech/substrate-api-sidecar/compare/v20.0.0..v20.1.0) (2025-02-24)

### Features

- feat: add accounts/compare endpoint ([#1597](https://github.com/paritytech/substrate-api-sidecar/pull/1597)) ([191e68a](https://github.com/paritytech/substrate-api-sidecar/commit/191e68a9a857d92bcf6eca233e805e2bee85efac))
- feat: add includeClaimedRewards query param in staking-info ([#1593](https://github.com/paritytech/substrate-api-sidecar/pull/1593)) ([ed8b04a](https://github.com/paritytech/substrate-api-sidecar/commit/ed8b04ae7c0455b868d5715bf8bc78f22120c3de))

### Chores

- chore(deps): update polkadot-js deps ([#1595](https://github.com/paritytech/substrate-api-sidecar/pull/1595)) ([6c97553](https://github.com/paritytech/substrate-api-sidecar/commit/6c97553423fddb7ce78711dfa659791d48943794))


## Compatibility

Tested against the following node releases:
- Polkadot v1.17.1 (Polkadot stable2412-1)
- Kusama v1.17.1 (Polkadot stable2412-1)
- Westend v1.17.1 (Polkadot stable2412-1)

Tested against the following runtime releases:
- Polkadot v1003004
- Kusama v1004000
- Westend v1017001

## [20.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v19.4.0..v20.0.0) (2025-02-10)

### Breaking Changes

- fix: claimed in staking info endpoint ([#1445](https://github.com/paritytech/substrate-api-sidecar/pull/1445)) ([e11955a](https://github.com/paritytech/substrate-api-sidecar/commit/e11955aa8a204fe95585556952c679673aa44a57))

    NOTE: This PR introduces breaking changes in the `staking-info` endpoint. More specifically:

    - The field `claimed` in the endpoint's response has changed structure and now we have a separate status for each era returned.
    - The status values are different for validator and nominator account.
    - The logic that calculates the era status was completely refactored.

    Please refer to the documents mentioned in the related PR for more details:
    - [Staking PR - claimed field - Guide](https://hackmd.io/@LwMsxe3-SFmNXxugAXOKgg/ryPwFoezyl)
    - [STAKING_IMPLEMENTATION_DETAILS.md](https://github.com/paritytech/substrate-api-sidecar/pull/1445/files)

### Fix

- fix: make scripts executable again in benchmark workflow ([#1589](https://github.com/paritytech/substrate-api-sidecar/pull/1589)) ([22db863](https://github.com/paritytech/substrate-api-sidecar/commit/22db86313c62399649b351a1715b783ef29c2d55))
- fix: benchmark-publish job (github action) ([#1585](https://github.com/paritytech/substrate-api-sidecar/pull/1585)) ([d87bc07](https://github.com/paritytech/substrate-api-sidecar/commit/d87bc079049a37d81c0fd77ab540618e60a0b8b1))

### Chores

- chore(deps-dev): bump @types/express-serve-static-core from 5.0.5 to 5.0.6 ([#1588](https://github.com/paritytech/substrate-api-sidecar/pull/1588)) ([2ad52e0](https://github.com/paritytech/substrate-api-sidecar/commit/2ad52e0d5b53c78551dc51a1d895521b09a3d9c8))
- chore(deps): bump the pjs group with 5 updates ([#1587](https://github.com/paritytech/substrate-api-sidecar/pull/1587)) ([274e844](https://github.com/paritytech/substrate-api-sidecar/commit/274e8442425a69d4397b44db19ed8750e6d03bea))
- chore(deps): update polkadot-js deps to v15.5.1 ([#1583](https://github.com/paritytech/substrate-api-sidecar/pull/1583)) ([fd7d7b7](https://github.com/paritytech/substrate-api-sidecar/commit/fd7d7b7ad12130af095f07559f8e09d4422d8153))
- chore(deps): bump docker/build-push-action from 6.11.0 to 6.13.0 ([#1580](https://github.com/paritytech/substrate-api-sidecar/pull/1580)) ([18f33f4](https://github.com/paritytech/substrate-api-sidecar/commit/18f33f4f570f3ec30f1e47e0d2f93180dfb62dfe))
- chore(deps-dev): bump @types/express-serve-static-core from 5.0.4 to 5.0.5 ([#1578](https://github.com/paritytech/substrate-api-sidecar/pull/1578)) ([398a98c](https://github.com/paritytech/substrate-api-sidecar/commit/398a98cc2b4c3c143824c162d28d7136e4a0e61d))
- chore(deps-dev): bump @types/express-serve-static-core from 5.0.3 to 5.0.4 ([#1574](https://github.com/paritytech/substrate-api-sidecar/pull/1574)) ([194f3e7](https://github.com/paritytech/substrate-api-sidecar/commit/194f3e795e6a698d49acab73e8965f6dcbda3b35))
- chore(deps): bump the pjs group with 5 updates ([#1573](https://github.com/paritytech/substrate-api-sidecar/pull/1573)) ([fc95cd0](https://github.com/paritytech/substrate-api-sidecar/commit/fc95cd0460abb6816cd0e3a5ecd5f45199104d22))
- chore(deps): bump docker/build-push-action from 6.10.0 to 6.11.0 ([#1572](https://github.com/paritytech/substrate-api-sidecar/pull/1572)) ([51ab44b](https://github.com/paritytech/substrate-api-sidecar/commit/51ab44b7536376f3583e18333b3e9e8332f498cc))


## Compatibility

Tested against the following node releases:
- Polkadot v1.17.1 (Polkadot stable2412-1)
- Kusama v1.17.1 (Polkadot stable2412-1)
- Westend v1.17.1 (Polkadot stable2412-1)

Tested against the following runtime releases:
- Polkadot v1003004
- Kusama v1003003
- Westend v1017001

## [19.4.0](https://github.com/paritytech/substrate-api-sidecar/compare/v19.3.1..v19.4.0) (2025-01-07)

### Features

- feat: coretime implementation ([#1558](https://github.com/paritytech/substrate-api-sidecar/pull/1558)) ([3a92196](https://github.com/paritytech/substrate-api-sidecar/commit/3a921963ee5d4d8ee2c5dcfb0edf83428e706b45))
- feat: Add configuration parameter for request body size ([#1565](https://github.com/paritytech/substrate-api-sidecar/pull/1565)) ([98f083d](https://github.com/paritytech/substrate-api-sidecar/commit/98f083dc9a11ca4f29db2590ca0045804766d215))

### CI

- ci: fix benchmark workflow, move docs to gh-pages ([#1552](https://github.com/paritytech/substrate-api-sidecar/pull/1552)) ([226f656](https://github.com/paritytech/substrate-api-sidecar/commit/226f65668536f061faad53dba5f19af516d82869))

### Docs

- docs: update docs & benchmarks related docs ([#1553](https://github.com/paritytech/substrate-api-sidecar/pull/1553)) ([bd9cad8](https://github.com/paritytech/substrate-api-sidecar/commit/bd9cad82aa865d2db69f091ebb083259f4fd42e5))

### Chores

- chore: 2025 ([#1570](https://github.com/paritytech/substrate-api-sidecar/pull/1570)) ([6a36d7c](https://github.com/paritytech/substrate-api-sidecar/commit/6a36d7c4c61bef785e258f91a41db479389c3ff7))
- chore(deps): update polkadot-js deps ([#1567](https://github.com/paritytech/substrate-api-sidecar/pull/1567)) ([fe2e697](https://github.com/paritytech/substrate-api-sidecar/commit/fe2e69760a28cfb15d2b9b1622f33e1aed0470b0))
- chore(deps): update non pjs deps ([#1568](https://github.com/paritytech/substrate-api-sidecar/pull/1568)) ([7ddd854](https://github.com/paritytech/substrate-api-sidecar/commit/7ddd8543734acdd8c0883e7fd8d77ef5bff16da3))
- chore(yarn): bump yarn to 4.6.0 & small guide update ([#1569](https://github.com/paritytech/substrate-api-sidecar/pull/1569)) ([c64312f](https://github.com/paritytech/substrate-api-sidecar/commit/c64312f9c896f8e7d78de7856559c71388acf2d8))
- chore(deps): bump Swatinem/rust-cache from 2.7.5 to 2.7.7 ([#1564](https://github.com/paritytech/substrate-api-sidecar/pull/1564)) ([1e519ce](https://github.com/paritytech/substrate-api-sidecar/commit/1e519cec524d22b749d724caeb304f173f32323d))
- chore(deps): bump the pjs group with 5 updates ([#1561](https://github.com/paritytech/substrate-api-sidecar/pull/1561)) ([fe1e303](https://github.com/paritytech/substrate-api-sidecar/commit/fe1e3036f2e52aa0b5322a8ee286ba02f55bd3c7))
- chore(deps): bump nanoid from 3.3.7 to 3.3.8 in /docs ([#1560](https://github.com/paritytech/substrate-api-sidecar/pull/1560)) ([cdaf3e3](https://github.com/paritytech/substrate-api-sidecar/commit/cdaf3e36031a84e9f5ac157b6b4709c89bc89c32))
- chore(deps): bump the pjs group with 5 updates ([#1559](https://github.com/paritytech/substrate-api-sidecar/pull/1559)) ([a6eb6aa](https://github.com/paritytech/substrate-api-sidecar/commit/a6eb6aa6687982d31474f305f1044db3c2b8faf8))
- chore(deps): bump docker/build-push-action from 6.9.0 to 6.10.0 ([#1557](https://github.com/paritytech/substrate-api-sidecar/pull/1557)) ([1d75954](https://github.com/paritytech/substrate-api-sidecar/commit/1d759546b9a2aeb6b0a9a4014c8f2cd8fa3b1198))


## Compatibility

Tested against the following node releases:
- Polkadot v1.17.0 (Polkadot stable2412)
- Kusama v1.17.0 (Polkadot stable2412)
- Westend v1.17.0 (Polkadot stable2412)

Tested against the following runtime releases:
- Polkadot v1003004
- Kusama v1003003
- Westend v1017001

## [19.3.1](https://github.com/paritytech/substrate-api-sidecar/compare/v19.3.0..v19.3.1) (2024-11-19)

### Fixes

- fix: ignore extrinsicIndex in multiBlockMigrations event ([#1541](https://github.com/paritytech/substrate-api-sidecar/pull/1541)) ([45c4b1f](https://github.com/paritytech/substrate-api-sidecar/commit/45c4b1f423949df3e6eb9f3e1669c1967e76a52b))
- fix(dev): fix tsconfig extends pathing for ts-node-dev ([#1537](https://github.com/paritytech/substrate-api-sidecar/pull/1537)) ([cef2d10](https://github.com/paritytech/substrate-api-sidecar/commit/cef2d10ead615b81c11a493310c84411fd45738f))
- fix: return DispatchError in dry-run endpoint ([#1533](https://github.com/paritytech/substrate-api-sidecar/pull/1533)) ([c43a26b](https://github.com/paritytech/substrate-api-sidecar/commit/c43a26bbf768f466e363574f856fa30b1a84e3f8))

### CI

- ci: fix deploy ([#1539](https://github.com/paritytech/substrate-api-sidecar/pull/1539)) ([7f161d5](https://github.com/paritytech/substrate-api-sidecar/commit/7f161d5c687c3d1dd43e64c61dc8aaab0c3fe06e))
- ci: Move from Gitlab to Github ([#1531](https://github.com/paritytech/substrate-api-sidecar/pull/1531)) ([87245fd](https://github.com/paritytech/substrate-api-sidecar/commit/87245fd0cd6dfc39ad4f7939abdbaef49d6aca74))

### Chores

- chore(deps): update non pjs deps ([#1550](https://github.com/paritytech/substrate-api-sidecar/pull/1550)) ([156ad7a](https://github.com/paritytech/substrate-api-sidecar/commit/156ad7a9b458a3b86016f21afbc011356c50666f))
- chore(deps): bump cross-spawn from 7.0.3 to 7.0.6 in /docs ([#1548](https://github.com/paritytech/substrate-api-sidecar/pull/1548)) ([c7b3f86](https://github.com/paritytech/substrate-api-sidecar/commit/c7b3f86677b26e2c895ca46e7fd8b80ced2800cd))
- chore(deps): bump cross-spawn from 7.0.3 to 7.0.6 ([#1549](https://github.com/paritytech/substrate-api-sidecar/pull/1549)) ([80d3b65](https://github.com/paritytech/substrate-api-sidecar/commit/80d3b65fc4b949e3cee4317ba7f83c2a63654614))
- chore(deps): update polkadot-js deps to v14.3.1 ([#1547](https://github.com/paritytech/substrate-api-sidecar/pull/1547)) ([3ff1e48](https://github.com/paritytech/substrate-api-sidecar/commit/3ff1e48008c39f4001caf165d09b791bb8710d20))
- chore(deps): bump winston from 3.16.0 to 3.17.0 ([#1545](https://github.com/paritytech/substrate-api-sidecar/pull/1545)) ([fb81a16](https://github.com/paritytech/substrate-api-sidecar/commit/fb81a16197ee45719fa7f12217f6aa2de13ee8ec))
- chore(deps): bump the pjs group across 1 directory with 7 updates ([#1546](https://github.com/paritytech/substrate-api-sidecar/pull/1546)) ([b59928c](https://github.com/paritytech/substrate-api-sidecar/commit/b59928c8da5d4c5d35e01661eb26757908a61d3e))
- chore: update Dependabot versioning strategy ([#1543](https://github.com/paritytech/substrate-api-sidecar/pull/1543)) ([158a1f8](https://github.com/paritytech/substrate-api-sidecar/commit/158a1f824ae099e3d22a73551d29030df11f1d54))
- chore(deps): bump docker/build-push-action from 5 to 6 ([#1540](https://github.com/paritytech/substrate-api-sidecar/pull/1540)) ([7465da](https://github.com/paritytech/substrate-api-sidecar/commit/f7465da37d093485f78b8775f8d2400e144ace75))
- chore(deps): bump winston from 3.15.0 to 3.16.0 ([#1536](https://github.com/paritytech/substrate-api-sidecar/pull/1536)) ([4a58326](https://github.com/paritytech/substrate-api-sidecar/commit/4a58326ffc5db7443abad1070c7e388a429e9595))
- chore(deps): bump lru-cache from 11.0.1 to 11.0.2 ([#1535](https://github.com/paritytech/substrate-api-sidecar/pull/1535)) ([292cd38](https://github.com/paritytech/substrate-api-sidecar/commit/292cd382134a2e594b8205125333d2aad2748cf0))
- chore(deps-dev): bump @substrate/dev from 0.8.0 to 0.9.0 ([#1528](https://github.com/paritytech/substrate-api-sidecar/pull/1528)) ([991821d](https://github.com/paritytech/substrate-api-sidecar/commit/991821d6476871d40b520a7e6e81c26d53c47afc))
- chore(deps-dev): bump @types/express-serve-static-core from 5.0.0 to 5.0.1 ([#1529](https://github.com/paritytech/substrate-api-sidecar/pull/1529)) ([67f2806](https://github.com/paritytech/substrate-api-sidecar/commit/67f2806014e1f34c0e2ec7ab4f1eba6a93e5a29a))

## Compatibility

Tested against the following node releases:
- Polkadot v1.16.2 (Polkadot stable2409-2)
- Kusama v1.16.2 (Polkadot stable2409-2)
- Westend v1.16.2 (Polkadot stable2409-2)

Tested against the following runtime releases:
- Polkadot v1003004
- Kusama v1003003
- Westend v1016002

## [19.3.0](https://github.com/paritytech/substrate-api-sidecar/compare/v19.2.2..v19.3.0) (2024-10-23)

### Features

- feat: update dry run endpoint to use new runtime api call ([#1519](https://github.com/paritytech/substrate-api-sidecar/pull/1519)) ([aeef4dc](https://github.com/paritytech/substrate-api-sidecar/commit/aeef4dcd1208d0d4424aea929dfa37f699e3f230))
- feat: improve performance with new version of PJS ([#1520](https://github.com/paritytech/substrate-api-sidecar/pull/1520)) ([e0ad7c1](https://github.com/paritytech/substrate-api-sidecar/commit/e0ad7c1f097e20b9b4a342decf2685f55095e2e8))

### Fix

- fix: dependabot yaml & explicit pjs deps declaration ([#1523](https://github.com/paritytech/substrate-api-sidecar/pull/1523)) ([95dfe4d](https://github.com/paritytech/substrate-api-sidecar/commit/95dfe4d46f530905015bf98c3e9470fb7c57b476))
- fix: rococo deprecation changes ([#1517](https://github.com/paritytech/substrate-api-sidecar/pull/1517)) ([7422fd2](https://github.com/paritytech/substrate-api-sidecar/commit/7422fd2a7afe0c6fc436f292dcd197c8f796d43b))
- fix: filtering in assets endpoint & update guides ([#1512](https://github.com/paritytech/substrate-api-sidecar/pull/1512)) ([b67bdcf](https://github.com/paritytech/substrate-api-sidecar/commit/b67bdcfd4c512079b305b84b47d8d283acf9c1f9))

    **IMPORTANT NOTE**: This release resolves the filtering issue in the assets endpoint.

### Docs

- docs: update docs for dry-run endpoint ([#1524](https://github.com/paritytech/substrate-api-sidecar/pull/1524)) ([f4c2d6c](https://github.com/paritytech/substrate-api-sidecar/commit/f4c2d6ced1a1b844db8f937b4ef0e35a3e032155))

### Chores

- chore(deps): bump http-proxy-middleware from 2.0.6 to 2.0.7 in /docs ([#1525](https://github.com/paritytech/substrate-api-sidecar/pull/1525)) ([fd3faae](https://github.com/paritytech/substrate-api-sidecar/commit/fd3faae0bc510af81348aed1321b082a729cea8c))
- chore(deps-dev): bump @types/argparse from 2.0.16 to 2.0.17 ([#1526](https://github.com/paritytech/substrate-api-sidecar/pull/1526)) ([df7065](https://github.com/paritytech/substrate-api-sidecar/commit/bdf70657dd768a2d9af921600f439b56c5786527))
- chore(deps): update polkadot-js deps & guides ([#1522](https://github.com/paritytech/substrate-api-sidecar/pull/1522)) ([bb00db1](https://github.com/paritytech/substrate-api-sidecar/commit/bb00db1d6861da275743959ddbcb3bd4c597e9d8))
- chore(deps): update non pjs deps in root & docs folder ([#1518](https://github.com/paritytech/substrate-api-sidecar/pull/1518)) ([1a3de02](https://github.com/paritytech/substrate-api-sidecar/commit/1a3de029213ebf6ea26f68bed3f6978221520e12))
- chore(deps): bump Swatinem/rust-cache from 2.7.3 to 2.7.5 ([#1514](https://github.com/paritytech/substrate-api-sidecar/pull/1514)) ([22a143a](https://github.com/paritytech/substrate-api-sidecar/commit/22a143a53a20af766345d858d6c61d56dfdd2c66))
- chore(deps): update polkadot-js deps to v14.0.1 ([#1515](https://github.com/paritytech/substrate-api-sidecar/pull/1515)) ([e35c191](https://github.com/paritytech/substrate-api-sidecar/commit/e35c191c42ab83d81b558077701469dc919a51df))


## Compatibility

Tested against the following node releases:
- Polkadot v1.16.1 (Polkadot stable2409-1)
- Kusama v1.16.1 (Polkadot stable2409-1)
- Westend v1.16.1 (Polkadot stable2409-1)

Tested against the following runtime releases:
- Polkadot v1003003
- Kusama v1003000
- Westend v1016002

## [19.2.2](https://github.com/paritytech/substrate-api-sidecar/compare/v19.2.1..v19.2.2) (2024-10-10)

### Fix

- fix: how to access router in getRoutes ([#1510](https://github.com/paritytech/substrate-api-sidecar/pull/1510)) ([f0d662b](https://github.com/paritytech/substrate-api-sidecar/commit/f0d662bb12661b5e04a948f20f4da6d62fd0cb45))
  
    **IMPORTANT NOTE**: This patch release fixes an issue that was introduced in v19.2.1, caused by the upgrade to Express v5.0.0.


## Compatibility

Tested against the following node releases:
- Polkadot v1.15.2 (Polkadot stable2407-2)
- Kusama v1.15.2 (Polkadot stable2407-2)
- Westend v1.15.2 (Polkadot stable2407-2)

Tested against the following runtime releases:
- Polkadot v1003000
- Kusama v1003000
- Westend v1016000

## [19.2.1](https://github.com/paritytech/substrate-api-sidecar/compare/v19.2.0..v19.2.1) (2024-10-09)

### Fix

- fix: queryInfo call in fee-estimate endpoint ([#1505](https://github.com/paritytech/substrate-api-sidecar/pull/1505)) ([68be48b](https://github.com/paritytech/substrate-api-sidecar/commit/68be48b715e1f53abcc91eb54ac447432715f26f))

### Chore

- chore(deps): update express to v5 & jest deprecations ([#1502](https://github.com/paritytech/substrate-api-sidecar/pull/1502)) ([28e039e](https://github.com/paritytech/substrate-api-sidecar/commit/28e039e8cfa54b3080e584f1598ccf8cb9a978bc))
- chore(deps): update substrate dev package & types ([#1500](https://github.com/paritytech/substrate-api-sidecar/pull/1500)) ([cf2b58b](https://github.com/paritytech/substrate-api-sidecar/commit/cf2b58bff7855bd97c90badc2192cb3f55e1835e))
- chore(yarn): bump yarn to 4.5.0 ([#1498](https://github.com/paritytech/substrate-api-sidecar/pull/1498)) ([6aac632](https://github.com/paritytech/substrate-api-sidecar/commit/6aac63270701ceb75b2a8cf87cd3f86a9baa1c67))

### Test

- test: add test for fee-estimate fix ([#1506](https://github.com/paritytech/substrate-api-sidecar/pull/1506)) ([c365490](https://github.com/paritytech/substrate-api-sidecar/commit/c3654903f258f5186e648989be1f1f79a5503c33))


## Compatibility

Tested against the following node releases:
- Polkadot v1.15.2 (Polkadot stable2407-2)
- Kusama v1.15.2 (Polkadot stable2407-2)
- Westend v1.15.2 (Polkadot stable2407-2)

Tested against the following runtime releases:
- Polkadot v1003000
- Kusama v1003000
- Westend v1016000

## [19.2.0](https://github.com/paritytech/substrate-api-sidecar/compare/v19.1.0..v19.2.0) (2024-09-23)

### Feat

- feat: add loki functionality to transport logs ([#1479](https://github.com/paritytech/substrate-api-sidecar/pull/1479)) ([85a4cca](https://github.com/paritytech/substrate-api-sidecar/commit/85a4cca46ea9102c18e6369bcda62e812c7aeadd))
- feat: Inject metrics registry in route controllers ([#1477](https://github.com/paritytech/substrate-api-sidecar/pull/1477)) ([11c0173](https://github.com/paritytech/substrate-api-sidecar/commit/11c0173ab1a79cf7cc464b1ad8446d367fd2bb16))

### Fix

- fix: Moves the LRUcache to Controller level ([#1489](https://github.com/paritytech/substrate-api-sidecar/pull/1489)) ([890c06b](https://github.com/paritytech/substrate-api-sidecar/commit/890c06ba185da796f9d731b8beb766a788b38076))
- fix: dependabot yaml ([#1482](https://github.com/paritytech/substrate-api-sidecar/pull/1482)) ([2e6efc0](https://github.com/paritytech/substrate-api-sidecar/commit/2e6efc07a717c1ddc44cfa59e2d28649f4585914))
- fix: Improve performance of blocks service by dependency injection ([#1483](https://github.com/paritytech/substrate-api-sidecar/pull/1483)) ([6eaca88](https://github.com/paritytech/substrate-api-sidecar/commit/6eaca881c570efbeb978ba959d09ebe830f526b4))

### Chore

- chore(deps): update polkadot-js deps ([#1496](https://github.com/paritytech/substrate-api-sidecar/pull/1496)) ([112994e](https://github.com/paritytech/substrate-api-sidecar/commit/112994e6d2d814aa037d72dcad4914251cb7a478))
- chore(deps): update polkadot-js deps ([#1495](https://github.com/paritytech/substrate-api-sidecar/pull/1495)) ([0115afc](https://github.com/paritytech/substrate-api-sidecar/commit/0115afcbbbf6b6157df9e057465c25f779813fbe))
- chore(deps): update non pjs deps & in docs ([#1494](https://github.com/paritytech/substrate-api-sidecar/pull/1494)) ([968f522](https://github.com/paritytech/substrate-api-sidecar/commit/968f522193292d4dc21478bfd813336ee49499cb))
- chore(deps): bump express from 4.19.2 to 4.20.0 ([#1491](https://github.com/paritytech/substrate-api-sidecar/pull/1491)) ([a5b8a36](https://github.com/paritytech/substrate-api-sidecar/commit/a5b8a3673bc130f8edddb3e9dbe83335ecbf2f53))
- chore: bump express from 4.19.2 to 4.21.0 in /docs ([#1490](https://github.com/paritytech/substrate-api-sidecar/pull/1490)) ([02a3797](https://github.com/paritytech/substrate-api-sidecar/commit/02a37973d414e32516a7d1d743396d2be5e2a3fb))
- chore: bump webpack from 5.93.0 to 5.94.0 in /docs ([#1484](https://github.com/paritytech/substrate-api-sidecar/pull/1484)) ([6286442](https://github.com/paritytech/substrate-api-sidecar/commit/628644297ff05cceec5ec87c1c617be13d9c5ec4))
- chore(deps): bump micromatch from 4.0.5 to 4.0.8 ([#1481](https://github.com/paritytech/substrate-api-sidecar/pull/1481)) ([373ec9b](https://github.com/paritytech/substrate-api-sidecar/commit/373ec9b8f45a22f6c0157e96d0546d6f9f522f3d))
- chore: bump micromatch from 4.0.4 to 4.0.8 in /docs ([#1480](https://github.com/paritytech/substrate-api-sidecar/pull/1480)) ([1ca7f9b](https://github.com/paritytech/substrate-api-sidecar/commit/1ca7f9b913ce74a538e46b3ae2ca24f47bbd36f4))


## Compatibility

Tested against the following node releases:
- Polkadot v1.15.2 (Polkadot stable2407-2)
- Kusama v1.15.2 (Polkadot stable2407-2)
- Westend v1.15.2 (Polkadot stable2407-2)

Tested against the following runtime releases:
- Polkadot v1003000
- Kusama v1003000
- Westend v1016000

## [19.1.0](https://github.com/paritytech/substrate-api-sidecar/compare/v19.0.2..v19.1.0) (2024-08-15)

### Feat

- feat: add pallets/on-going-referenda endpoint ([#1471](https://github.com/paritytech/substrate-api-sidecar/pull/1471)) ([386fbb3](https://github.com/paritytech/substrate-api-sidecar/commit/386fbb360b60ee92f5ca9e543532f0d0092f995f))
- feat: Add route based metrics across API ([#1465](https://github.com/paritytech/substrate-api-sidecar/pull/1465)) ([a4bbcb8](https://github.com/paritytech/substrate-api-sidecar/commit/a4bbcb8ff2de3257fa012d832e853cedb67a0508))

### Docs

- docs: Remove old stable version note ([#1466](https://github.com/paritytech/substrate-api-sidecar/pull/1466)) ([250b613](https://github.com/paritytech/substrate-api-sidecar/commit/250b6133d78375a95f2d4ac125cb1b3bb8312fb2))
- docs: add maintenance guide ([#1460](https://github.com/paritytech/substrate-api-sidecar/pull/1460)) ([58bf51d](https://github.com/paritytech/substrate-api-sidecar/commit/58bf51dbce8f522ac34c48c127ef9b0a634f66e2))

### Chore

- chore(deps): update all non polkadot-js deps in root & docs folder ([#1475](https://github.com/paritytech/substrate-api-sidecar/pull/1475)) ([c766c1d](https://github.com/paritytech/substrate-api-sidecar/commit/c766c1df8757d44aa0263b4ca296f6d43363dfe2))
- chore: bump axios from 1.6.7 to 1.7.4 in /docs ([#1474](https://github.com/paritytech/substrate-api-sidecar/pull/1474)) ([82c61df](https://github.com/paritytech/substrate-api-sidecar/commit/82c61df511ad1a56c62f80d0ca8bb6051dfd20ec))
- chore(deps): update polkadot-js deps ([#1473](https://github.com/paritytech/substrate-api-sidecar/pull/1473)) ([0317ec9](https://github.com/paritytech/substrate-api-sidecar/commit/0317ec9fab569c6f560db313a3aa20ef2265a5ec))


## Compatibility

Tested against the following node releases:
- Polkadot v1.15.0 (Polkadot stable2407)
- Kusama v1.15.0 (Polkadot stable2407)
- Westend v1.15.0 (Polkadot stable2407)

Tested against the following runtime releases:
- Polkadot v1002007
- Kusama v1002006
- Westend v1015000

## [19.0.2](https://github.com/paritytech/substrate-api-sidecar/compare/v19.0.1..v19.0.2) (2024-06-27)

### Fix

- fix: add nominations in staking-info endpoint ([#1448](https://github.com/paritytech/substrate-api-sidecar/pull/1448)) ([b048648](https://github.com/paritytech/substrate-api-sidecar/commit/b04864823e16e4a450b76c9d6c9953b13bc9baaf))

### Chore

- chore(deps): update polkadot-js deps ([#1458](https://github.com/paritytech/substrate-api-sidecar/pull/1458)) ([2f7a4f1](https://github.com/paritytech/substrate-api-sidecar/commit/2f7a4f116e3405148f5742e65d2a1178bc8240f1))
- chore(deps): bump ws from 8.16.0 to 8.17.1 ([#1456](https://github.com/paritytech/substrate-api-sidecar/pull/1456)) ([92f39d0](https://github.com/paritytech/substrate-api-sidecar/commit/92f39d05269cbf7aa0e8abf522177f22186dae68))
- chore: bump ws from 8.5.0 to 8.17.1 in /docs ([#1455](https://github.com/paritytech/substrate-api-sidecar/pull/1455)) ([2b63e9b](https://github.com/paritytech/substrate-api-sidecar/commit/2b63e9b785d8d603dece2588f8bd7c19d4c553cf))
- chore(deps): bump braces from 3.0.2 to 3.0.3 ([#1451](https://github.com/paritytech/substrate-api-sidecar/pull/1451)) ([9fffaff](https://github.com/paritytech/substrate-api-sidecar/commit/9fffaff4af4f53a7be662575dd8ce5394b4249e4))
- chore: bump braces from 3.0.2 to 3.0.3 in /docs ([#1450](https://github.com/paritytech/substrate-api-sidecar/pull/1450)) ([edb6049](https://github.com/paritytech/substrate-api-sidecar/commit/edb604910f8a03255b2cc34524bdb47d4edd4703))
- chore(yarn): bump yarn to 4.2.2 ([#1444](https://github.com/paritytech/substrate-api-sidecar/pull/1444)) ([1fe1b46](https://github.com/paritytech/substrate-api-sidecar/commit/1fe1b46f9529f50e9256016a74284c796e288245))

## Compatibility

Tested against:
- Polkadot v11300
- Kusama v11300
- Westend v11300

## [19.0.1](https://github.com/paritytech/substrate-api-sidecar/compare/v19.0.0..v19.0.1) (2024-05-24)

### Fix

- fix: duplicate payouts in staking-payouts endpoint ([#1439](https://github.com/paritytech/substrate-api-sidecar/pull/1439)) ([b751ca4](https://github.com/paritytech/substrate-api-sidecar/commit/b751ca4302d4497712be6d6128f771628f268947))
- fix: add asset conversion pallet to Polkadot Asset Hub ([#1437](https://github.com/paritytech/substrate-api-sidecar/pull/1437)) ([1c42f70](https://github.com/paritytech/substrate-api-sidecar/commit/1c42f70650fc56d27d59ef30ec3735546286eff1))

### Chore

- chore(deps): update all non polkadot-js deps ([#1442](https://github.com/paritytech/substrate-api-sidecar/pull/1442)) ([bb83189](https://github.com/paritytech/substrate-api-sidecar/commit/bb831899d1e44b1602dee6d5d5b920d98c385a24))
- chore(deps): update polkadot-js deps & README ([#1441](https://github.com/paritytech/substrate-api-sidecar/pull/1441)) ([7fb4844](https://github.com/paritytech/substrate-api-sidecar/commit/7fb4844c119d1d18ee8ce19bb302bd7548de144e))

## Compatibility

Tested against:
- Polkadot v11200
- Kusama v11200
- Westend v11200

## [19.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v18.0.0..v19.0.0) (2024-04-24)

### Breaking Changes

- fix!: add new staking storage items ([#1432](https://github.com/paritytech/substrate-api-sidecar/pull/1432)) ([317edba](https://github.com/paritytech/substrate-api-sidecar/commit/317edba2c78dd181b2d0acbf335b412a3355a282))
  NOTE: This PR introduces breaking changes in the `staking-payouts` endpoint. More specifically:
    1. The payouts for eras after the v1.2.0 runtime upgrade are now retrieved and returned in the endpoint's response
    1. The payouts are retrieved by using the new storage items `erasStakersPaged` and `erasStakersOverview`
    1. The use of `erasStakersClipped` is deprecated but still supported. It will be completely removed in the future
- fix!: staking payouts change claimed value ([#1429](https://github.com/paritytech/substrate-api-sidecar/pull/1429)) ([abf4d9d](https://github.com/paritytech/substrate-api-sidecar/commit/abf4d9df7b647955d135fbc93084e565d402bdd1))
  NOTE: This PR introduces breaking changes in the `staking-payouts` endpoint. More specifically:
    1. Payouts with `claimed` false are now retrieved and returned in the endpoint's response
    1. Payouts are now retrievable from any block height within the queried era

### Feat

- feat: add metadata versions endpoints ([#1424](https://github.com/paritytech/substrate-api-sidecar/pull/1424)) ([beb02ba](https://github.com/paritytech/substrate-api-sidecar/commit/beb02ba1debb637b212e2032934f628724089912))

### Fix

- fix: add deprecation note for paras endpoints ([#1428](https://github.com/paritytech/substrate-api-sidecar/pull/1428)) ([3ed7cbe](https://github.com/paritytech/substrate-api-sidecar/commit/3ed7cbecd177e5aa367ea4bbd27ccd1c62bce03e))
- fix: define query param depth in Staking Payouts for all chains ([#1422](https://github.com/paritytech/substrate-api-sidecar/pull/1422)) ([c73c801](https://github.com/paritytech/substrate-api-sidecar/commit/c73c801b77d74db0bca4c4b50deada26c39becc5))

### Chore

- chore(deps): update polkadot-js deps ([#1434](https://github.com/paritytech/substrate-api-sidecar/pull/1434)) ([d2c05f2](https://github.com/paritytech/substrate-api-sidecar/commit/d2c05f2941e62b341f068e117df30fe72325eb7a))
- chore(deps): update polkadot-js deps ([#1430](https://github.com/paritytech/substrate-api-sidecar/pull/1430)) ([80571f8](https://github.com/paritytech/substrate-api-sidecar/commit/80571f840f1f62789a9b2ee0c41486ae2c46c24d))
- chore(deps): bump tar from 6.1.15 to 6.2.1 ([#1427](https://github.com/paritytech/substrate-api-sidecar/pull/1427)) ([395b39b](https://github.com/paritytech/substrate-api-sidecar/commit/395b39b84ba66a853e464a0c2856718acfe69eff))
- chore: bump tar from 6.1.12 to 6.2.1 in /docs ([#1426](https://github.com/paritytech/substrate-api-sidecar/pull/1426)) ([467ecdd](https://github.com/paritytech/substrate-api-sidecar/commit/467ecddb79a6303572e09e7675e4c94ac98e6870))
- chore: bump undici from 5.28.3 to 5.28.4 in /docs ([#1425](https://github.com/paritytech/substrate-api-sidecar/pull/1425)) ([360b6ab](https://github.com/paritytech/substrate-api-sidecar/commit/360b6abe633301d60132801132c85d9081c39a52))
- chore(deps): bump express from 4.18.3 to 4.19.2 ([#1420](https://github.com/paritytech/substrate-api-sidecar/pull/1420)) ([5951085](https://github.com/paritytech/substrate-api-sidecar/commit/59510850ff8f71bef4bd403420c1625498ad342d))
- chore(deps): bump express from 4.18.1 to 4.19.2 in /docs ([#1419](https://github.com/paritytech/substrate-api-sidecar/pull/1419)) ([d4ceb44](https://github.com/paritytech/substrate-api-sidecar/commit/d4ceb44283fa9493f89dc9b93a95e7074ce51f53))
- chore(deps): bump webpack-dev-middleware from 5.3.1 to 5.3.4 in /docs ([#1418](https://github.com/paritytech/substrate-api-sidecar/pull/1418)) ([51a4a68](https://github.com/paritytech/substrate-api-sidecar/commit/51a4a68f089580adc29f97b5bf22de1753df5020))

## Compatibility

Tested against:
- Polkadot v11000
- Kusama v11000
- Westend v11000

## [18.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v17.5.2..v18.0.0) (2024-03-21)

### Breaking Changes

- feat!: add in-transit XCM msgs in blocks endpoint ([#1412](https://github.com/paritytech/substrate-api-sidecar/pull/1412)) ([6028086](https://github.com/paritytech/substrate-api-sidecar/commit/6028086ee3e236476c7b7ce5a8db4efe50875e7d))
  - NOTE: This PR introduces breaking changes in the blocks endpoint when decoded XCM messages are enabled. More specifically:
     1. The structure of the Upward Messages response has changed
     1. `paraId` was renamed to `originParaId`

### Fix

- fix: add Kusama chain check in historic blocks ([#1415](https://github.com/paritytech/substrate-api-sidecar/pull/1415)) ([cfbcddd](https://github.com/paritytech/substrate-api-sidecar/commit/cfbcddd3e1019949dc3bb9fb12e420bde9af47bf))
- fix: multilocation type in pallets/foreign-assets ([#1408](https://github.com/paritytech/substrate-api-sidecar/pull/1408)) ([b7136d0](https://github.com/paritytech/substrate-api-sidecar/commit/b7136d0a8442532f9a4b5896ef061df6b870db03))

### Chore

- fix(deps): update pjs deps, and fixing types ([#1416](https://github.com/paritytech/substrate-api-sidecar/pull/1416)) ([b5eded8](https://github.com/paritytech/substrate-api-sidecar/commit/b5eded8909afb533d023073a5cdf1f230c9cfe06))
- chore(deps): bump follow-redirects from 1.15.5 to 1.15.6 in /docs ([#1414](https://github.com/paritytech/substrate-api-sidecar/pull/1414)) ([e20f782](https://github.com/paritytech/substrate-api-sidecar/commit/e20f78249ce7e70aaa90a985cb375b8f39db2cda))
- chore(deps): update non-pjs deps ([#1407](https://github.com/paritytech/substrate-api-sidecar/pull/1407)) ([96c9f11](https://github.com/paritytech/substrate-api-sidecar/commit/96c9f11d7c4142c6f8a145eb932fb650941ade50))

## Compatibility

Tested against:
- Polkadot v10800
- Kusama v10800
- Westend v10800

## [17.5.2](https://github.com/paritytech/substrate-api-sidecar/compare/v17.5.1..v17.5.2) (2024-03-01)

### Fix

- fix: add more historic support for staking-payouts ([#1397](https://github.com/paritytech/substrate-api-sidecar/pull/1397)) ([b1e84be](https://github.com/paritytech/substrate-api-sidecar/commit/b1e84beb5c4883ca78981a064f4dc4f80fac0f97))

### Chore

- chore(deps): bump ip from 1.1.8 to 1.1.9 in /docs ([#1399](https://github.com/paritytech/substrate-api-sidecar/pull/1399)) ([b7480fb](https://github.com/paritytech/substrate-api-sidecar/commit/b7480fbc7826b27f8732824a43e4f8b094fd9d50))
- chore(deps): bump ip from 2.0.0 to 2.0.1 ([#1398](https://github.com/paritytech/substrate-api-sidecar/pull/1398)) ([d751ba8](https://github.com/paritytech/substrate-api-sidecar/commit/d751ba8518074bd28cbffc94c91156fa45652350))

## Compatibility

Tested against:
- Polkadot v10500
- Kusama v10500
- Westend v10500

## [17.5.1](https://github.com/paritytech/substrate-api-sidecar/compare/v17.5.0..v17.5.1)(2024-02-07)

### Fix

- fix: staking-payouts for legacy types ([#1394](https://github.com/paritytech/substrate-api-sidecar/pull/1394)) ([e91a913](https://github.com/paritytech/substrate-api-sidecar/commit/e91a913a91050b8b6779c526d344294225c9ef64))

## Compatibility

Tested against:
- Polkadot v10500
- Kusama v10500
- Westend v10500

## [17.5.0](https://github.com/paritytech/substrate-api-sidecar/compare/v17.4.0..17.5.0)(2024-02-06)

### Feat

- feat: add `at` query param for staking-payouts ([#1388](https://github.com/paritytech/substrate-api-sidecar/pull/1388)) ([a8b96ff](https://github.com/paritytech/substrate-api-sidecar/commit/a8b96ff55afba56325ee4df6c2f9ac6dfcc0e418))
- feat: Add endpoint `/accounts/{accountId}/proxy-info` ([#1387](https://github.com/paritytech/substrate-api-sidecar/pull/1387)) ([9addf07](https://github.com/paritytech/substrate-api-sidecar/commit/9addf07743940b314259ceac73310fad823e2ec8))

### Fix

- fix: add asset conversion pallet to Kusama Asset Hub ([#1389](https://github.com/paritytech/substrate-api-sidecar/pull/1389)) ([3b447c6](https://github.com/paritytech/substrate-api-sidecar/commit/3b447c60c1fcbc51c0c0a4f0efb2cfb817bd2a04))
- fix: added decodedXcmMsgs in 'blocks/head' endpoint ([#1385](https://github.com/paritytech/substrate-api-sidecar/pull/1385)) ([90b89de](https://github.com/paritytech/substrate-api-sidecar/commit/90b89de069b6658e7355e57c0f7e36a338e00950))

### Docs

- docs(calc): Updated README for calc package ([#1386](https://github.com/paritytech/substrate-api-sidecar/pull/1386)) ([cc80227](https://github.com/paritytech/substrate-api-sidecar/commit/cc802273cc81164a07658eb579548288335d39bd))

### Ci

- ci: Replace helm deploy with argo cd ([#1391](https://github.com/paritytech/substrate-api-sidecar/pull/1391)) ([1bd0cda](https://github.com/paritytech/substrate-api-sidecar/commit/1bd0cda9f471a344b0edbb9822cdfa45f41d67a3))

### Chore

- chore(deps): update swagger-ui to resolve braintree dep ([#1392](https://github.com/paritytech/substrate-api-sidecar/pull/1392)) ([3a42a38](https://github.com/paritytech/substrate-api-sidecar/commit/3a42a38162b7f928e8ae4a7c56811ffba2a02cb0))
- chore(yarn): update yarn to 4.1.0 ([#1390](https://github.com/paritytech/substrate-api-sidecar/pull/1390)) ([02166de](https://github.com/paritytech/substrate-api-sidecar/commit/02166de48d3eb386024d6c34cdf635a51112431f))

## Compatibility

Tested against:
- Polkadot v10500
- Kusama v10500
- Westend v10500

## [17.4.0](https://github.com/paritytech/substrate-api-sidecar/compare/v17.3.5..v17.4.0) (2024-01-24)

### Features

- feat: add decoded XCM data in blocks endpoint ([#1364](https://github.com/paritytech/substrate-api-sidecar/pull/1364)) ([555817c](https://github.com/paritytech/substrate-api-sidecar/commit/555817c888c5d4b124d1d891404472c436a4a812))

### Fix

- fix: generated a custom key for the cache in blocks endpoint ([#1381](https://github.com/paritytech/substrate-api-sidecar/pull/1381)) ([17cbd2c](https://github.com/paritytech/substrate-api-sidecar/commit/17cbd2cd6af98a826ee5f64d2868e014a3249bdb))

### Docs

- docs: correct the /transaction/material docs for metadata ([#1377](https://github.com/paritytech/substrate-api-sidecar/pull/1377)) ([ca163c7](https://github.com/paritytech/substrate-api-sidecar/commit/ca163c74e485c13b0d084d8ce8c004e3c92ee592))

### Chore

- chore(deps): bump Swatinem/rust-cache from 2.7.1 to 2.7.2 ([#1380](https://github.com/paritytech/substrate-api-sidecar/pull/1380)) ([8eca817](https://github.com/paritytech/substrate-api-sidecar/commit/8eca8172dbbac90e4c8ea0f6a89716710a6b91cf))
- chore(deps): bump Swatinem/rust-cache from 2.7.2 to 2.7.3 ([#1382](https://github.com/paritytech/substrate-api-sidecar/pull/1382)) ([792d5bb](https://github.com/paritytech/substrate-api-sidecar/commit/792d5bb4b4d84d8c5ac598771b21a1a1ec4d00d8))
- chore(deps): bump actions/cache from 3 to 4 ([#1383](https://github.com/paritytech/substrate-api-sidecar/pull/1383)) ([95987f5](https://github.com/paritytech/substrate-api-sidecar/commit/95987f55645463b43570ba8879f807d29162b02a))

## Compatibility

Tested against:
- Polkadot v10500
- Kusama v10500
- Westend v10500

## [17.3.5](https://github.com/paritytech/substrate-api-sidecar/compare/v17.3.4..v17.3.5) (2024-01-10)

### Fix

- fix: changed how claimed variable is set in staking-payouts ([#1378](https://github.com/paritytech/substrate-api-sidecar/pull/1378)) ([0560806](https://github.com/paritytech/substrate-api-sidecar/commit/056080636e11ceea2364e59bb769bea1be3429a4))

### Perf

- perf: add additional high load benchmarks for /blocks ([#1372](https://github.com/paritytech/substrate-api-sidecar/pull/1372)) ([c3d9d01](https://github.com/paritytech/substrate-api-sidecar/commit/c3d9d012762f5c93fca3d274fa08388d70296737))

### Docs

- docs: update node compatibility ([#1373](https://github.com/paritytech/substrate-api-sidecar/pull/1373)) ([51353c0](https://github.com/paritytech/substrate-api-sidecar/commit/51353c0eee1ced554c8d8c9a0067af69b8e2574c))

### Chore

- chore(deps): bump follow-redirects from 1.15.2 to 1.15.4 in /docs ([#1376](https://github.com/paritytech/substrate-api-sidecar/pull/1376)) ([b2aab7d](https://github.com/paritytech/substrate-api-sidecar/commit/b2aab7dd5ae93b1270e8baba4e2ac7e0c8d3e8ed))

## Compatibility

Tested against:
- Polkadot v10500
- Kusama v10500
- Westend v10500

## [17.3.4](https://github.com/paritytech/substrate-api-sidecar/compare/v17.3.3..v17.3.4) (2024-01-05)

### Fix

- fix: ensure statemine, and statemint are still supported ([#1374](https://github.com/paritytech/substrate-api-sidecar/pull/1374)) ([ca5079a](https://github.com/paritytech/substrate-api-sidecar/commit/ca5079a037b8911c6c6d0f8900f0ef6beec369f9))

### Chore

- chore(pjs): update polkadot-js, and fix staking ledger types ([#1371](https://github.com/paritytech/substrate-api-sidecar/pull/1371)) ([ceea8eb](https://github.com/paritytech/substrate-api-sidecar/commit/ceea8ebad59581118b061846c01ed0a80db78ae9))

## Compatibility

Tested against:
- Polkadot v10500
- Kusama v10500
- Westend v10500

## [17.3.3](https://github.com/paritytech/substrate-api-sidecar/compare/v17.3.2..v17.3.3) (2023-12-21)

**NOTE** This release focuses on improving the performance of the tool resolving a regression where `blocks` were overwhelmed with transactions. The `noFees` query parameter focuses on removing fee info for the blocks if the user does not intend on needing fees. For more general cases where fees are necessary we have increased the performance of querying `/blocks` while also calculating fees. This was done with 2 cases: ensuring `transactionPaidFee`, and `ExtrinsicSuccess` or `ExtrinsicFailure` info is used to its fullest so we can avoid making any additional rpc calls, as well as ensuring the extrinsic's are called concurrently.
### Perf

- perf: transactionPaidFee event optimization ([#1367](https://github.com/paritytech/substrate-api-sidecar/pull/1367)) ([2883249](https://github.com/paritytech/substrate-api-sidecar/commit/288324918b7445fce8be6c4606c41058c66cdf69)) 
- perf: add concurrency to fee calls ([#1368](https://github.com/paritytech/substrate-api-sidecar/pull/1368)) ([0980d1e](https://github.com/paritytech/substrate-api-sidecar/commit/0980d1e0766f1e416883c8e68ebcf04ca8ecd2fc))

### Fix

- fix: add finalizedKey query param to /blocks/{blockId} ([#1362](https://github.com/paritytech/substrate-api-sidecar/pull/1362)) ([ecd1518](https://github.com/paritytech/substrate-api-sidecar/commit/ecd1518a1e7f6b4465e90cd7ff8f6fd7a115b88b))
- fix: added query to calc fees ([#1366](https://github.com/paritytech/substrate-api-sidecar/pull/1366)) ([203a257](https://github.com/paritytech/substrate-api-sidecar/commit/203a257bea3c150ac09d7b7fa956d68e524969bc))
    NOTE: this added the noFees={bool} query param to specify whether to retrieve or not the fees information of the block for the `/blocks/*` endpoint

### Test

-  test(e2e): replace tests pointing to deprecated pallets ([#1363](https://github.com/paritytech/substrate-api-sidecar/pull/1363)) ([2a38b2e](https://github.com/paritytech/substrate-api-sidecar/commit/2a38b2e652bf621bf6cc450ce5fdacf5656d9c8c))

## Compatibility

Tested against:
- Polkadot v10400
- Kusama v10400
- Westend v10400

## [17.3.2](https://github.com/paritytech/substrate-api-sidecar/compare/v17.3.1..v17.3.2) (2023-11-26)

### Fix

- fix: add override types for asset hub conversation pallet ([#1354](https://github.com/paritytech/substrate-api-sidecar/pull/1354)) ([21e016d](https://github.com/paritytech/substrate-api-sidecar/commit/21e016d990ab0edd6cc322dc073ab576552a1320))

### Test

- test: add test for frozen deprecation in runtime ([#1353](https://github.com/paritytech/substrate-api-sidecar/pull/1353)) ([1a249a3](https://github.com/paritytech/substrate-api-sidecar/commit/1a249a3fcca5df21a85a035d49c422b265bdc2e4))

### CI

- ci: fixing gitspiegel trigger workflow ([bdb9271](https://github.com/paritytech/substrate-api-sidecar/commit/bdb9271565192ec106febee4788e888976040190))
- ci: switch e2e-tests endpoints ([#1350](https://github.com/paritytech/substrate-api-sidecar/pull/1350)) ([644b475](https://github.com/paritytech/substrate-api-sidecar/commit/644b475daf95997901430d3cc6de43cd5befe3b4))
- ci: adding gitspiegel-trigger workflow ([#1348](https://github.com/paritytech/substrate-api-sidecar/pull/1348)) ([87f47a5](https://github.com/paritytech/substrate-api-sidecar/commit/87f47a59860b43cd8797cfaf351d130572a4a207))

## Compatibility

Tested against:
- Polkadot v10300
- Kusama v10300
- Westend v10300

## [17.3.1](https://github.com/paritytech/substrate-api-sidecar/compare/v17.3.0..v17.3.1) (2023-10-30)

### Fix

- fix: bifrost type issue & small fixes in tests ([#1345](https://github.com/paritytech/substrate-api-sidecar/pull/1345)) ([567170b](https://github.com/paritytech/substrate-api-sidecar/commit/567170b7d3d8cbb53cca07c467447ba99bb24b52))

### Chore

- chore(deps): bump actions/setup-node from 3 to 4 ([#1343](https://github.com/paritytech/substrate-api-sidecar/pull/1343)) ([8fa49aa](https://github.com/paritytech/substrate-api-sidecar/commit/8fa49aaa93cfdad36fe8126262409832033bba89))
- chore(deps): bump Swatinem/rust-cache from 2.7.0 to 2.7.1 ([#1344](https://github.com/paritytech/substrate-api-sidecar/pull/1344)) ([47a47da](https://github.com/paritytech/substrate-api-sidecar/commit/47a47daaa6987836a10aea53bcd02aef453408c4))

## Compatibility

Tested against:
- Polkadot v10200
- Kusama v10200
- Westend v10200

## [17.3.0](https://github.com/paritytech/substrate-api-sidecar/compare/v17.2.0..v17.3.0) (2023-10-23)

### Features

- feat: add pool-assets endpoints ([#1338](https://github.com/paritytech/substrate-api-sidecar/pull/1338)) ([02c4a3f](https://github.com/paritytech/substrate-api-sidecar/commit/02c4a3fa9556029840bd00dd842ad7fb89afd1b6))
- feat: add blocks raw extrinsics endpoint ([#1334](https://github.com/paritytech/substrate-api-sidecar/pull/1334)) ([f486aa9](https://github.com/paritytech/substrate-api-sidecar/commit/f486aa94bd86b21d460aaf2285dda1c535cfb969))

The following endpoints are now available:
- `/blocks/:blockId/extrinsics-raw`
- `/pallets/pool-assets/{assetId}/asset-info`
- `/accounts/{accountId}/pool-asset-balances`
- `/accounts/{accountId}/pool-asset-approvals`

### Chore

- chore(yarn): bump yarn ([#1341](https://github.com/paritytech/substrate-api-sidecar/pull/1341)) ([052aaa1](https://github.com/paritytech/substrate-api-sidecar/commit/052aaa1269758c4c1fec9a383e81fe345a53c32d))
- chore(deps): update polkadot-js deps ([#1339](https://github.com/paritytech/substrate-api-sidecar/pull/1339)) ([2978d1a](https://github.com/paritytech/substrate-api-sidecar/commit/2978d1a0b3e07f81eb5c6ab3e6bf120fc96c38e2))
- chore: bump Swatinem/rust-cache from 2.6.2 to 2.7.0 ([#1332](https://github.com/paritytech/substrate-api-sidecar/pull/1332)) ([2d1d82d](https://github.com/paritytech/substrate-api-sidecar/commit/2d1d82de5cdb684a7e4ec19939892a521a949509))
- chore: bump postcss from 8.4.14 to 8.4.31 in /docs ([#1337](https://github.com/paritytech/substrate-api-sidecar/pull/1337)) ([39d016a](https://github.com/paritytech/substrate-api-sidecar/commit/39d016a6317f91078bf76b9c17ed8817150c5cde))
- chore(deps): bump @babel/traverse from 7.22.11 to 7.23.2 ([#1340](https://github.com/paritytech/substrate-api-sidecar/pull/1340)) ([b59bb90](https://github.com/paritytech/substrate-api-sidecar/commit/b59bb900791e57dbc7ba240581d656e6b1329b74))

### Docs

- docs: fix regex under the pattern keyword ([#1335](https://github.com/paritytech/substrate-api-sidecar/pull/1335)) ([fbdca75](https://github.com/paritytech/substrate-api-sidecar/commit/fbdca75b970e3955878206e6ad94ace58796cabf))

## Compatibility

Tested against:
- Polkadot v10200
- Kusama v10200
- Westend v10200

## [17.2.0](https://github.com/paritytech/substrate-api-sidecar/compare/v17.1.2..v17.2.0) (2023-09-11)

### Features

- feat: add asset-conversion endpoints ([#1324](https://github.com/paritytech/substrate-api-sidecar/pull/1324)) ([242aa09](https://github.com/paritytech/substrate-api-sidecar/commit/242aa095d9884a88d2c6467ed6cc04f25114cb0e))
- feat: add pallets/foreign-assets endpoint ([#1314](https://github.com/paritytech/substrate-api-sidecar/pull/1314)) ([450c6ea](https://github.com/paritytech/substrate-api-sidecar/commit/450c6eada4fec2e3d09579798f048b4b2b533262))

### Bug Fixes

- fix: docker-compose.yml ([#1321](https://github.com/paritytech/substrate-api-sidecar/pull/1321)) ([5c9de90](https://github.com/paritytech/substrate-api-sidecar/commit/5c9de905cf65932c301fd51a5a37ee4a2df73af0))

### CI

- ci: add semantic title check, and cleanup actions ([#1325](https://github.com/paritytech/substrate-api-sidecar/pull/1325)) ([7098710](https://github.com/paritytech/substrate-api-sidecar/commit/7098710b74c5261a2c98ffbbca57dc811789a5e8)) Contribute by: [benxiao](https://github.com/benxiao)
- ci: use buildah image defined in gitlab group vars ([#1327](https://github.com/paritytech/substrate-api-sidecar/pull/1327)) ([37344bf](https://github.com/paritytech/substrate-api-sidecar/commit/37344bfabccbd2f2830bce18e0618600c367f5ae))

### Chore

- chore(yarn): bump yarn ([#1320](https://github.com/paritytech/substrate-api-sidecar/pull/1320)) ([e744f8d](https://github.com/paritytech/substrate-api-sidecar/commit/e744f8dc2ac27e3542c6997ff23f4d65b04e319b))
- chore: bump Swatinem/rust-cache from 2.6.1 to 2.6.2 ([#1319](https://github.com/paritytech/substrate-api-sidecar/pull/1319)) ([f2bd4de](https://github.com/paritytech/substrate-api-sidecar/commit/f2bd4de7a0f63558127f4d495308f6ef5520b7f6))
- chore: bump actions/checkout from 3 to 4 ([#1326](https://github.com/paritytech/substrate-api-sidecar/pull/1326)) ([f9f9ad0](https://github.com/paritytech/substrate-api-sidecar/commit/f9f9ad05576c10562edc5ee5172b6fd1d523dfc1))

### Test

- test(fix-dev): update appropriate type packages ([#1318](https://github.com/paritytech/substrate-api-sidecar/pull/1318)) ([d0b2959](https://github.com/paritytech/substrate-api-sidecar/commit/d0b29596ca243f948d4b1357d42a113baadedf58))
- test(calc): add test for calc_payout ([#1317](https://github.com/paritytech/substrate-api-sidecar/pull/1317)) ([b105cd3](https://github.com/paritytech/substrate-api-sidecar/commit/b105cd30e7bf7bc4efd62c2a19ead989e28e3a3e))

### Docs

- docs: fixed lack of responses on openapi ([#1328](https://github.com/paritytech/substrate-api-sidecar/pull/1328)) ([899b26f](https://github.com/paritytech/substrate-api-sidecar/commit/899b26fb25e35facdb790d9923c360a288f19055))
- docs: add server urls to swagger-ui ([#1330](https://github.com/paritytech/substrate-api-sidecar/pull/1330)) ([05f3966](https://github.com/paritytech/substrate-api-sidecar/commit/05f39662fad85dead1e531ed051d14e44090a484))

## Compatibility

Tested against:
- Polkadot v10000
- Kusama v10000
- Westend v10000

## [17.1.2](https://github.com/paritytech/substrate-api-sidecar/compare/v17.1.1..v17.1.2) (2023-08-16)

### Bug Fixes
- fix: query info feature detection ([#1305](https://github.com/paritytech/substrate-api-sidecar/pull/1305)) ([3c768e3](https://github.com/paritytech/substrate-api-sidecar/commit/3c768e33674d8448482dac65d278a86fa8d25aa8)) Contributed by [xlc](https://github.com/xlc)
- fix: change error&error codes returned from /transaction/* related endpoints ([#1312](https://github.com/paritytech/substrate-api-sidecar/pull/1312)) ([797c421](https://github.com/paritytech/substrate-api-sidecar/commit/797c4217a9041edc98140bcf3a55a87e8056ae94))

### Chores
- chore(deps): bump semver from 6.3.0 to 6.3.1 ([#1304](https://github.com/paritytech/substrate-api-sidecar/pull/1304)) ([62b97f3](https://github.com/paritytech/substrate-api-sidecar/commit/62b97f3b6223660d696119d317c8e5184ce703ed))
- chore(yarn): bump yarn ([#1303](https://github.com/paritytech/substrate-api-sidecar/pull/1303)) ([e4d42af](https://github.com/paritytech/substrate-api-sidecar/commit/e4d42af754707003297ec1dc00a000a0bd8bb80b))
- chore(dev): switch from tsc-watch to ts-node-dev ([#1307](https://github.com/paritytech/substrate-api-sidecar/pull/1307)) ([83d201a](https://github.com/paritytech/substrate-api-sidecar/commit/83d201a514b1b5a49fad7268a3f7eabf6a143d39))
- chore(deps): bump word-wrap from 1.2.3 to 1.2.4 ([#1309](https://github.com/paritytech/substrate-api-sidecar/pull/1309)) ([573d083](https://github.com/paritytech/substrate-api-sidecar/commit/573d083fb514a5dcae399267ddd585b8ded996ab))
- chore: bump Swatinem/rust-cache from 2.5.1 to 2.6.0 ([#1310](https://github.com/paritytech/substrate-api-sidecar/pull/1310)) ([28e6078](https://github.com/paritytech/substrate-api-sidecar/commit/28e6078964eb7ba91252e5458e6fbffe966505a2))
- chore: bump Swatinem/rust-cache from 2.6.0 to 2.6.1 ([#1313](https://github.com/paritytech/substrate-api-sidecar/pull/1313)) ([9fcda59](https://github.com/paritytech/substrate-api-sidecar/commit/9fcda59e76db9339e5a105b3d827a7953c4574aa))

## Compatibility

Tested against:
- Polkadot v10000
- Kusama v10000
- Westend v10000

## [17.1.1](https://github.com/paritytech/substrate-api-sidecar/compare/v17.1.0..v17.1.1) (2023-07-05)

### Bug Fixes

- fix: rename wsurl endpoints to asset hub ([#1301](https://github.com/paritytech/substrate-api-sidecar/pull/1301)) ([7a7e7de](https://github.com/paritytech/substrate-api-sidecar/commit/7a7e7de03e17b3ebdb156f6a7580737858e47810))
- fix: /accounts/{accountId}/convert encoding for ecdsa ([#1280](https://github.com/paritytech/substrate-api-sidecar/pull/1280)) ([86edf0b](https://github.com/paritytech/substrate-api-sidecar/commit/86edf0b058c3effad80ab9d314dff914e2e7aab8))
- fix: rename statemint/statemine/westmint to asset-hub-polkadot/kusama/westend ([#1296](https://github.com/paritytech/substrate-api-sidecar/pull/1296)) ([362e912](https://github.com/paritytech/substrate-api-sidecar/commit/362e91224f0bb8562dd0c28da740621bbdad72c0))

### Chores

- chore: bump Swatinem/rust-cache from 2.5.0 to 2.5.1 ([#1300](https://github.com/paritytech/substrate-api-sidecar/pull/1300)) ([45d8ecf](https://github.com/paritytech/substrate-api-sidecar/commit/45d8ecf84841ee28aad7f29cf099d9a829b1ee6c))
- chore: bump semver from 7.3.5 to 7.5.3 in /docs ([#1298](https://github.com/paritytech/substrate-api-sidecar/pull/1298)) ([45eee30](https://github.com/paritytech/substrate-api-sidecar/commit/45eee30f1b3814721d949868e70ee3212f164b4d))
- chore: bump Swatinem/rust-cache from 2.4.0 to 2.5.0 ([#1297](https://github.com/paritytech/substrate-api-sidecar/pull/1297)) ([2579500](https://github.com/paritytech/substrate-api-sidecar/commit/2579500952acd7a25bdc1cf20424aed445778a21))

## Compatibility

Tested against:
- Polkadot v9420
- Kusama v9420
- Westend v9420

## [17.1.0](https://github.com/paritytech/substrate-api-sidecar/compare/v17.0.0..v17.1.0) (2023-06-13)

### Features

- feat: add prometheus metrics in dedicated port ([#1232](https://github.com/paritytech/substrate-api-sidecar/pull/1232)) ([a256790](https://github.com/paritytech/substrate-api-sidecar/commit/a256790e75b2a717896ab019bc03d6f96542ddf3))

### Bug Fixes

- fix: Add BlockTraces to Westend config ([#1292](https://github.com/paritytech/substrate-api-sidecar/pull/1292)) ([d3de591](https://github.com/paritytech/substrate-api-sidecar/commit/d3de591f3b95f9ca30f0bbf667918eb05b9a7497))
- fix(deps): update pjs api ([#1294](https://github.com/paritytech/substrate-api-sidecar/pull/1294)) ([fe8ef2e](https://github.com/paritytech/substrate-api-sidecar/commit/fe8ef2e741f5013fbe2f11923ba67d333d9eb8ca))

### CI

- CI: fix gha set-output command ([#1291](https://github.com/paritytech/substrate-api-sidecar/pull/1291)) ([609b332](https://github.com/paritytech/substrate-api-sidecar/commit/609b332ccf4582f1987615036e7b53eb26a5bbad))

### Docs

- docs: update release guide ([#1288](https://github.com/paritytech/substrate-api-sidecar/pull/1288)) ([f1516ad](https://github.com/paritytech/substrate-api-sidecar/commit/f1516ad00be419d5ee9e9e0eb0919122a22bb678))

## Compatibility

Tested against:
- Polkadot v9420
- Kusama v9420
- Westend v9420

## [17.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v16.0.0..v17.0.0) (2023-05-29)

### Breaking Changes

- fix(deps)!: update polkadot-js, and adjust for breaking changes (isFrozen compatibility fix) & kusama test removed ([#1285](https://github.com/paritytech/substrate-api-sidecar/pull/1285)) ([110b01a](https://github.com/paritytech/substrate-api-sidecar/commit/110b01ad9ce80568dbe05201ea2ae07d687ae0d4))
    NOTE: In the endpoint `/accounts/{accountId}/asset-balances`, the field `isFrozen` will now give new outputs when it is no longer supported.

### Chores

- chore: bump Swatinem/rust-cache from 2.3.0 to 2.4.0 ([#1284](https://github.com/paritytech/substrate-api-sidecar/pull/1284)) ([e5e5987](https://github.com/paritytech/substrate-api-sidecar/commit/e5e5987e2219c4729c33aec8055caada7f655a09))
- chore: bump Swatinem/rust-cache from 2.2.1 to 2.3.0 ([#1283](https://github.com/paritytech/substrate-api-sidecar/pull/1283)) ([fa9d52f](https://github.com/paritytech/substrate-api-sidecar/commit/fa9d52f760d17f6cd09c0b6990ba617b06055d93))

## Compatibility

Tested against:
- Polkadot v9420
- Kusama v9420
- Westend v9420

## [16.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v15.0.0..v16.0.0) (2023-05-08)

### Breaking Changes

- fix!: removes metadata v13 ([#1272](https://github.com/paritytech/substrate-api-sidecar/pull/1272)) ([287d8e3](https://github.com/paritytech/substrate-api-sidecar/commit/287d8e319ad20a8d2e4da8bcb1e58798e5361c79))
    NOTE: This removes `adjustMetadataV13` query parameter from `/pallets/{palletId}/storage`.
- fix!: remove noMeta query param from /transaction/materials ([#1275](https://github.com/paritytech/substrate-api-sidecar/pull/1275)) ([1d20501](https://github.com/paritytech/substrate-api-sidecar/commit/1d20501300ab11add2cd37a99c760170f0bd2550))
    NOTE: This removes `noMeta` from `/transaction/materials`. Please refer to the PR for more information. 
- fix!: minimum nodejs version ([#1278](https://github.com/paritytech/substrate-api-sidecar/pull/1278)) ([05628da](https://github.com/paritytech/substrate-api-sidecar/commit/05628dab05d8b494b9914c591bb173af6643d205))
    NOTE: We want this library to be in sync with polkadot-js so it's important for us to also be in line with node-js versions. The version we specify is a minimum of v18.14.

### Test

- test: add acala & karura to e2e tests and some improvements ([#1273](https://github.com/paritytech/substrate-api-sidecar/pull/1273)) ([44e2da4](https://github.com/paritytech/substrate-api-sidecar/commit/44e2da4df8f237978ff2640e176cee5162369ffa)) Contributed by ([xlc](https://github.com/xlc))

### CI

- ci: Update buildah command and version ([#1271](https://github.com/paritytech/substrate-api-sidecar/pull/1271)) ([8fdfef8](https://github.com/paritytech/substrate-api-sidecar/commit/8fdfef82e5a3ededf597744589c55680b6b6ccf8))
- ci: Change endpoints for e2e tests ([#1270](https://github.com/paritytech/substrate-api-sidecar/pull/1270)) ([23f5b51](https://github.com/paritytech/substrate-api-sidecar/commit/23f5b511d78a39ef03ba2977fcf9177b404274b8))

### Chores

- chore(deps): update polkadot-js ([#1277](https://github.com/paritytech/substrate-api-sidecar/pull/1277)) ([e8666ca](https://github.com/paritytech/substrate-api-sidecar/commit/e8666cae4ccbe858959dacb61748009aeafd016e))
- chore(deps): update polkadot-js deps ([#1267](https://github.com/paritytech/substrate-api-sidecar/pull/1267)) ([637c964](https://github.com/paritytech/substrate-api-sidecar/commit/637c9642b56d9116fea5464266250f00f4fe5906))
- chore(deps): update substrate dev ([#1269](https://github.com/paritytech/substrate-api-sidecar/pull/1269)) ([5e9b838](https://github.com/paritytech/substrate-api-sidecar/commit/5e9b8386b882ffbd792591afa92f80bea71526da))

### Docs

- docs: update sec deps ([#1279](https://github.com/paritytech/substrate-api-sidecar/pull/1279)) ([f430b79](https://github.com/paritytech/substrate-api-sidecar/commit/f430b7981f02f93e9a903d5b50627f1e4268db85))

## Compatibility

Tested against:
- Polkadot v9420
- Kusama v9420
- Westend v9420

## [15.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v14.5.3..v15.0.0) (2023-04-19)

### **BREAKING CHANGES**

- fix!: update polkadot-js, and adjust for breaking changes (`/accounts/{accountId}/balance-info`) ([#1255](https://github.com/paritytech/substrate-api-sidecar/pull/1255)) ([8964882](https://github.com/paritytech/substrate-api-sidecar/commit/8964882102487825561c27b525ae3da51e54bbf7))
    NOTE: The endpoint `/accounts/{accountId}/balance-info` has a new field called `frozen`, while `miscFrozen`, and `feeFrozen` will now give new outputs when they are no longer supported. **Important**: These changes are not yet reflected in a runtime release on `polkadot`, `kusama`, and `westend`, but are applied in sidecar to ensure support is there. Please look into the docs and or the above PR to see the changes in more depth.

### Bug Fixes

- fix: incorrect finalization when head blocks are cached and polled ([#1265](https://github.com/paritytech/substrate-api-sidecar/pull/1265)) ([d498206](https://github.com/paritytech/substrate-api-sidecar/commit/d4982060ae080aab20433432e339c58722107a8e))
    NOTE: This patches a bug related to `/blocks/head`.

### Test

- test(scripts): change historical e2e-tests endpoints to parity hosted nodes ([#1261](https://github.com/paritytech/substrate-api-sidecar/pull/1261)) ([bfe2976](https://github.com/paritytech/substrate-api-sidecar/commit/bfe297619bada26a715e6d30aa6451a2216fc719))

## Compatibility

Tested against:
- Polkadot v9400
- Kusama v9400
- Westend v9400

## [14.5.3](https://github.com/paritytech/substrate-api-sidecar/compare/v14.5.2..v14.5.3) (2023-04-11)

### Bug Fixes

- fix: validator staking endpoint with more info, and correct docs ([#1258](https://github.com/paritytech/substrate-api-sidecar/pull/1258)) ([e0024e5](https://github.com/paritytech/substrate-api-sidecar/commit/e0024e595561b3a8314cb136f4bf36ce037236c9))
    NOTE: This ensures that the `pallets/staking/validators` endpoint has the `at` key, and adds the `validatorsToBeChilled` key. Please read the PR for more info.

### CI

- ci: Allow GitLab E2E test jobs to fail ([#1260](https://github.com/paritytech/substrate-api-sidecar/pull/1260)) ([78812f2](https://github.com/paritytech/substrate-api-sidecar/commit/78812f231e1a5171d0d15af85b199c112821edd2))

## Compatibility

Tested against:
- Polkadot v9400
- Kusama v9400
- Westend v9400

## [14.5.2](https://github.com/paritytech/substrate-api-sidecar/compare/v14.5.1..v14.5.2) (2023-04-04)

### Bug Fixes

- fix: invalid validator active set ([#1256](https://github.com/paritytech/substrate-api-sidecar/pull/1256)) ([a13269b](https://github.com/paritytech/substrate-api-sidecar/commit/a13269b1d96e0f03684374fd74536a6c630505cd))
    - NOTE: This ensure that `/pallets/staking/validators` returns the correct amount of active validators in the set.  

## Compatibility

Tested against:
- Polkadot v9400
- Kusama v9400
- Westend v9400

## [14.5.1](https://github.com/paritytech/substrate-api-sidecar/compare/v14.5.0..v14.5.1) (2023-03-23)

### Chores

- chore(deps): update polkadot-js ([#1252](https://github.com/paritytech/substrate-api-sidecar/pull/1252)) ([c53d6c4](https://github.com/paritytech/substrate-api-sidecar/commit/c53d6c4b9b07e4ccaa6a7baf35a6c03da0d213ac))

## Compatibility

Tested against:
- Polkadot v9390
- Kusama v9390
- Westend v9390

## [14.5.0](https://github.com/paritytech/substrate-api-sidecar/compare/v14.4.1..v14.5.0) (2023-03-15)

### Features

- feat: add pallets/consts endpoint ([#1210](https://github.com/paritytech/substrate-api-sidecar/pull/1210)) ([97c1ca6](https://github.com/paritytech/substrate-api-sidecar/commit/97c1ca633347d94386f1574f0303baaf96669ba0))
- feat: add SAS_EXPRESS_KEEP_ALIVE_TIMEOUT ([#1233](https://github.com/paritytech/substrate-api-sidecar/pull/1233)) ([e83dac6](https://github.com/paritytech/substrate-api-sidecar/commit/e83dac6164902654e0b854f60b22d4d3a3a08449))
- feat: add pallets/dispatchables endpoint ([#1209](https://github.com/paritytech/substrate-api-sidecar/pull/1209)) ([b685ac2](https://github.com/paritytech/substrate-api-sidecar/commit/b685ac244610aa51457412981feab72bfb560f9f))

### CI

- ci: refactor benchmark ([#1235](https://github.com/paritytech/substrate-api-sidecar/pull/1235)) ([fe67380](https://github.com/paritytech/substrate-api-sidecar/commit/fe67380de3163f4b3f925bfc4add8b026c7a4c04))

### Test

- test: fix benchmark url calls for pallets keys ([#1240](https://github.com/paritytech/substrate-api-sidecar/pull/1240)) ([e4e4cac](https://github.com/paritytech/substrate-api-sidecar/commit/e4e4cacf962c8f230e69fd73f949a2fa78631b7d))

### Chores

- chore: bump Swatinem/rust-cache from 2.2.0 to 2.2.1 ([#1241](https://github.com/paritytech/substrate-api-sidecar/pull/1241)) ([190c713](https://github.com/paritytech/substrate-api-sidecar/commit/190c713bccb233b1d27c0fe9cb9b5c1616ea38cf))
- chore(deps): update polkadot-js deps ([#1247](https://github.com/paritytech/substrate-api-sidecar/pull/1247)) ([5c4449c](https://github.com/paritytech/substrate-api-sidecar/commit/5c4449c0465b5118b056b2a6c9b328943c81417d))
- chore: add inspect mode script ([#1248](https://github.com/paritytech/substrate-api-sidecar/pull/1248)) ([4f40666](https://github.com/paritytech/substrate-api-sidecar/commit/4f40666603080f410fbd73eadd5291171466ad44))
- chore: bump webpack from 5.68.0 to 5.76.0 in /docs ([#1249](https://github.com/paritytech/substrate-api-sidecar/pull/1249)) ([783ef9b](https://github.com/paritytech/substrate-api-sidecar/commit/783ef9b40c7147960f520aac85605c8f0e8ac589))

## Compatibility

Tested against:
- Polkadot v9390
- Kusama v9390
- Westend v9390

## [14.4.1](https://github.com/paritytech/substrate-api-sidecar/compare/v14.4.0..v14.4.1) (2023-02-27)

### CI

- ci: add e2e tests to ci ([#1222](https://github.com/paritytech/substrate-api-sidecar/pull/1222)) ([14b05f8](https://github.com/paritytech/substrate-api-sidecar/commit/14b05f8921348f229fe1bec59b5fa3ad5b59625b))
- ci: add docker image description publishing ([#1234](https://github.com/paritytech/substrate-api-sidecar/pull/1234)) ([c97972a](https://github.com/paritytech/substrate-api-sidecar/commit/c97972a2d3003477afc3271c96dc7310b507362e))

### Chores

- chore(deps): update polkadot-js ([#1237](https://github.com/paritytech/substrate-api-sidecar/pull/1237)) ([7366aa3](https://github.com/paritytech/substrate-api-sidecar/commit/7366aa3338fbd8ff7d532d0b60a4e440a9b0c77a))

## Compatibility

Tested against:
- Polkadot v9380
- Kusama v9380
- Westend v9380

## [14.4.0](https://github.com/paritytech/substrate-api-sidecar/compare/v14.3.1..v14.4.0) (2023-02-14)

### Features

- feat: add pallets/events endpoint ([#1204](https://github.com/paritytech/substrate-api-sidecar/pull/1204)) ([289d804](https://github.com/paritytech/substrate-api-sidecar/commit/289d804ce1658431603febfbb427deab325e7ad4))

### Perf

- perf: rework benchmarks ([#1044](https://github.com/paritytech/substrate-api-sidecar/pull/1044)) ([3189864](https://github.com/paritytech/substrate-api-sidecar/commit/31898647d1d88103148eb3efdc49e99764db89d2))

### Tests

- tests: fix e2e tests, add kusama westend, and remove ws check ([#1223](https://github.com/paritytech/substrate-api-sidecar/pull/1223)) ([fb35b6b](https://github.com/paritytech/substrate-api-sidecar/commit/fb35b6b6bfce1aeb76f164485ec20fa8bacc68c9))

### Chores

- chore: add e2e-tests to single lint configuration ([#1226](https://github.com/paritytech/substrate-api-sidecar/pull/1226)) ([f546abc](https://github.com/paritytech/substrate-api-sidecar/commit/f546abcabd2297299434888677063be486d48aae))
- chore(deps): update pjs, add small e2e-config ([#1225](https://github.com/paritytech/substrate-api-sidecar/pull/1225)) ([80f4e2c](https://github.com/paritytech/substrate-api-sidecar/commit/80f4e2cc341ac3647a7156b7c0d481bf0fb270af))
- chore(deps): update pjs deps ([#1221](https://github.com/paritytech/substrate-api-sidecar/pull/1221)) ([10930b2](https://github.com/paritytech/substrate-api-sidecar/commit/10930b24c30e0e5424ead4b97e9cf9f42513e583))
- chore(tech-debt): cleanup type assignment for consoleOverride ([#1215](https://github.com/paritytech/substrate-api-sidecar/pull/1215)) ([520631c](https://github.com/paritytech/substrate-api-sidecar/commit/520631c123fa3483a0a16d0ab3ee2cd7bd1aa1b7))
- chore:(deps): bump http-cache-semantics from 4.1.0 to 4.1.1 ([#1217](https://github.com/paritytech/substrate-api-sidecar/pull/1217)) ([fe6ee23](https://github.com/paritytech/substrate-api-sidecar/commit/fe6ee2376ee5d2ce2f1037a3c23108c053513313))
- chore: bump http-cache-semantics from 4.1.0 to 4.1.1 in /docs ([#1216](https://github.com/paritytech/substrate-api-sidecar/pull/1216)) ([2f2b513](https://github.com/paritytech/substrate-api-sidecar/commit/2f2b513715bd07c8a5241357d914f53104922f01))

## Compatibility

Tested against:
- Polkadot v9370
- Kusama v9370
- Westend v9370

## [14.3.1](https://github.com/paritytech/substrate-api-sidecar/compare/v14.3.0..v14.3.1) (2023-02-01)

### Bug Fixes

- fix: update errors endpoint to use latest error metadata for fetchErrorItem ([#1205](https://github.com/paritytech/substrate-api-sidecar/pull/1205)) ([a13e8ca](https://github.com/paritytech/substrate-api-sidecar/commit/a13e8caa89dc50ccd36ea23cf1a2f282425c30da))
- fix: rename nomination-pools to be to standard ([#1203](https://github.com/paritytech/substrate-api-sidecar/pull/1203)) ([7d8ac10](https://github.com/paritytech/substrate-api-sidecar/commit/7d8ac102b9e27ab7bade19999c4c30c378475151))
    NOTE: This renames `/pallets/nominationPools/*` to `/pallets/nomination-pools/*`.

### Chores

- chore(deps): updated to new version of confmgr ([#1207](https://github.com/paritytech/substrate-api-sidecar/pull/1207)) ([a0f7d78](https://github.com/paritytech/substrate-api-sidecar/commit/a0f7d7800fe639eef95906bbd5c0315b277a48f1))
- chore(deps): update polkadot-js deps ([#1206](https://github.com/paritytech/substrate-api-sidecar/pull/1206)) ([1cb3d22](https://github.com/paritytech/substrate-api-sidecar/commit/1cb3d22eca16bc95ea5888b4d5d2a5f827895c07))
- chore(deps): update polkadot-js api to most recent patch ([#1211](https://github.com/paritytech/substrate-api-sidecar/pull/1211)) ([cffc235](https://github.com/paritytech/substrate-api-sidecar/commit/cffc2355a81ff68a6c60756a4cb3c660e374fa17))

## Compatibility

Tested against:
- Polkadot v9370
- Kusama v9370
- Westend v9370

## [14.3.0](https://github.com/paritytech/substrate-api-sidecar/compare/v14.2.3..v14.3.0) (2023-01-25)

### Features

- feat: add /paras/head/included-candidates and /paras/head/backed-candidates ([#1166](https://github.com/paritytech/substrate-api-sidecar/pull/1166)) ([eb4add7](https://github.com/paritytech/substrate-api-sidecar/commit/eb4add7acd71025b259007771c5e67baf45e04cc))
- feat: add nomination pools support ([#1095](https://github.com/paritytech/substrate-api-sidecar/pull/1095)) ([7534b1e](https://github.com/paritytech/substrate-api-sidecar/commit/7534b1e9cd6693c4c6e2b34b347f5b96c86dfc24))
- feat: add /pallets/errors ([#1176](https://github.com/paritytech/substrate-api-sidecar/pull/1176)) ([65a0881](https://github.com/paritytech/substrate-api-sidecar/commit/65a08814bac05052d25c8a9a6d72e9e5b1ec67ad))
- feat: add /pallets/staking/validators endpoint ([#1045](https://github.com/paritytech/substrate-api-sidecar/pull/1045)) ([70e0a36](https://github.com/paritytech/substrate-api-sidecar/commit/70e0a367f2cd564747ac30909f61d75eb063005a))
- feat: add fileTransport ([#1189](https://github.com/paritytech/substrate-api-sidecar/pull/1189)) ([9c2effb](https://github.com/paritytech/substrate-api-sidecar/commit/9c2effb358bbcd483e8c04c51f22e1988b3855fd))

### Chores

- chore(deps): update polkadot-js deps ([#1183](https://github.com/paritytech/substrate-api-sidecar/pull/1183)) ([e2d64ed](https://github.com/paritytech/substrate-api-sidecar/commit/e2d64edce15a518706b731201622d2f87f767487))
- chore(yarn-dev): update yarn to 3.3.1, and substrate/dev to 0.6.6 ([#1185](https://github.com/paritytech/substrate-api-sidecar/pull/1185)) ([c7461c6](https://github.com/paritytech/substrate-api-sidecar/commit/c7461c67b3a4a1d1cc18ac2fb42015d39d050732))
- chore(lint): adjust lint script ([#1184](https://github.com/paritytech/substrate-api-sidecar/pull/1184)) ([325e80a](https://github.com/paritytech/substrate-api-sidecar/commit/325e80ad0a9e9d8e84e9c138c7dedb92766feaa7))
- chore: bump bumpalo from 3.6.0 to 3.12.0 in /calc ([#1192](https://github.com/paritytech/substrate-api-sidecar/pull/1192)) ([93e7d36](https://github.com/paritytech/substrate-api-sidecar/commit/93e7d363acebd07823ff41802653f3d511046842))
- chore(deps): update polkadot-js deps ([#1193](https://github.com/paritytech/substrate-api-sidecar/pull/1193)) ([ee64335](https://github.com/paritytech/substrate-api-sidecar/commit/ee64335ee31cefb283c86bd5b8ef9c54cc443d65))
- chore(scripts): cleanup package.json scripts ([#1200](https://github.com/paritytech/substrate-api-sidecar/pull/1200)) ([1585605](https://github.com/paritytech/substrate-api-sidecar/commit/1585605d50c4e4a9647448313341df25eafc16c0))

### Docs

- docs: remove try it out option in docs ([#1191](https://github.com/paritytech/substrate-api-sidecar/pull/1191)) ([22f8fd4](https://github.com/paritytech/substrate-api-sidecar/commit/22f8fd47ee2ea0cc0662d6ad8ff36fe9db68674d))

## Compatibility

Tested against:
- Polkadot v9370
- Kusama v9370
- Westend v9370

## [14.2.3](https://github.com/paritytech/substrate-api-sidecar/compare/v14.2.2..v14.2.3) (2023-01-10)

### Bug Fixes

- fix: replace rpc calls for fees and give support for weight v1 and v2 ([1177](https://github.com/paritytech/substrate-api-sidecar/pull/1177)) ([9bdaf45](https://github.com/paritytech/substrate-api-sidecar/commit/9bdaf4502505585f08dccd9d34c218c830dbff83))
    Note: This fixes a current bug where the `includeFee` queryParam was no longer working, and compatible with WeightsV2.

### Chores

- chore: bump json5 from 1.0.1 to 1.0.2 in /docs ([1178](https://github.com/paritytech/substrate-api-sidecar/pull/1178)) ([94a2ed9](https://github.com/paritytech/substrate-api-sidecar/commit/94a2ed943a63ab9a99fc362e8a715db83dfa40c2))
- chore: bump fast-json-patch from 3.1.0 to 3.1.1 in /docs ([1175](https://github.com/paritytech/substrate-api-sidecar/pull/1175)) ([76629d3](https://github.com/paritytech/substrate-api-sidecar/commit/76629d32eea38f1b86797661f82ce4b2da1c3dd8))
- chore:(deps): bump json5 from 2.2.0 to 2.2.3 ([1179](https://github.com/paritytech/substrate-api-sidecar/pull/1179)) ([d05f716](https://github.com/paritytech/substrate-api-sidecar/commit/d05f716678acd7409e52f5fdabdd1b57d021f724))
- chore(deps): update polkadot-js api, and util-crypto ([1181](https://github.com/paritytech/substrate-api-sidecar/pull/1181)) ([7ccec7a](https://github.com/paritytech/substrate-api-sidecar/commit/7ccec7af8b6c28779bef77f042821a9f73b0d8cc))

## Compatibility

Tested against:
- Polkadot v9360
- Kusama v9360
- Westend v9360

## [14.2.2](https://github.com/paritytech/substrate-api-sidecar/compare/v14.2.1..v14.2.2) (2022-12-27)

### Bug Fixes

- fix: use local version of wasm-pack ([#1168](https://github.com/paritytech/substrate-api-sidecar/pull/1168)) ([f922247](https://github.com/paritytech/substrate-api-sidecar/commit/f922247ac84e7dcf11de0ed2f622ffea13684230)) Contributed by: [xlc](https://github.com/xlc)
- fix: avoid use queryInfo rpc call ([#1169](https://github.com/paritytech/substrate-api-sidecar/pull/1169)) ([907ba92](https://github.com/paritytech/substrate-api-sidecar/commit/907ba927b35157bbf793ec3e1d5e1c99a721c217)) Contributed by: [xlc](https://github.com/xlc)
- fix: set rpc to call for queryInfo in transaction/fee-estimate ([#1170](https://github.com/paritytech/substrate-api-sidecar/pull/1170)) ([7334599](https://github.com/paritytech/substrate-api-sidecar/commit/7334599519f56b4331ad246e8a74277e205a1c2d))
- fix: revert polkadot-js deps to 9.10.3 ([#1173](https://github.com/paritytech/substrate-api-sidecar/pull/1173)) ([df6bc32](https://github.com/paritytech/substrate-api-sidecar/commit/df6bc3298441e802731b02e8af175855b2b277cd))

### Chores

- chore(deps): update polkadot-js api, and api-contracts ([#1171](https://github.com/paritytech/substrate-api-sidecar/pull/1171)) ([97b427c](https://github.com/paritytech/substrate-api-sidecar/commit/97b427c7a4ad40f8b4d2230d0b82a65dd792bb41))

### Test

- test(e2e-tests): add e2e-tests for latest runtimes, and blocks ([#1155](https://github.com/paritytech/substrate-api-sidecar/pull/1155)) ([095f57f](https://github.com/paritytech/substrate-api-sidecar/commit/095f57f93f3c34df58ab6565aa70aa8d254fcbde))

## Compatibility

Tested against:
- Polkadot v9360
- Kusama v9360
- Westend v9360

## [14.2.1](https://github.com/paritytech/substrate-api-sidecar/compare/v14.2.0..v14.2.1) (2022-12-14)

### Bug Fixes

- chore(deps): update polkadot-js deps ([1163](https://github.com/paritytech/substrate-api-sidecar/pull/1163)) ([ca97b2c](https://github.com/paritytech/substrate-api-sidecar/commit/ca97b2cbae909bad24869ea15bb9ab6fa2005f97))
    - This fixes an issue where unapplies slashes will not appear in  `/pallets/staking/progress` when necessary. 

### Docs

- docs: update node stability for versions ([1162](https://github.com/paritytech/substrate-api-sidecar/pull/1162)) ([e4305b6](https://github.com/paritytech/substrate-api-sidecar/commit/e4305b668e30984635f2718f83fabc6b594faf42))

## Compatibility

Tested against:
- Polkadot v9330
- Kusama v9330
- Westend v9330

## [14.2.0](https://github.com/paritytech/substrate-api-sidecar/compare/v14.1.2..v14.2.0) (2022-12-07)

### Features

- feat: add support for ink! contracts ([1015](https://github.com/paritytech/substrate-api-sidecar/pull/1015)) ([f6499fa](https://github.com/paritytech/substrate-api-sidecar/commit/f6499fae96b2c3f787c63657ba793803b7f735a9))

### Bug Fixes

- fix(calc): remove sp-arithmetic-legacy ([1146](https://github.com/paritytech/substrate-api-sidecar/pull/1146)) ([92f02dc](https://github.com/paritytech/substrate-api-sidecar/commit/92f02dcbb40c4ae3c55b6457de5ec151e7f9f906))

### Chores

- chore: bump loader-utils from 1.4.1 to 1.4.2 in /docs ([1140](https://github.com/paritytech/substrate-api-sidecar/pull/1140)) ([71456c4](https://github.com/paritytech/substrate-api-sidecar/commit/71456c4d3748c8d449b0a44b5e0cc9536bf973cf))
- chore: bump minimatch from 3.0.4 to 3.1.2 in /docs ([1148](https://github.com/paritytech/substrate-api-sidecar/pull/1148)) ([442e045](https://github.com/paritytech/substrate-api-sidecar/commit/442e045d8340024a3838eac87858d758af2a57ef))
- chore: bump tar from 6.1.0 to 6.1.12 in /docs ([1149](https://github.com/paritytech/substrate-api-sidecar/pull/1149)) ([e319b88](https://github.com/paritytech/substrate-api-sidecar/commit/e319b88697e9e05e6cc92ace1343ad6d3fd0cb41))
- chore: bump jetli/wasm-pack-action from 0.3.0 to 0.4.0 ([1156](https://github.com/paritytech/substrate-api-sidecar/pull/1156)) ([21894e6](https://github.com/paritytech/substrate-api-sidecar/commit/21894e6dcc7cb89c1ad26bbaee97dd85f581631a))
- chore(release-calc): 0.3.1 ([1157](https://github.com/paritytech/substrate-api-sidecar/pull/1157)) ([af85128](https://github.com/paritytech/substrate-api-sidecar/commit/af851282392a1b427d533ea67ed714500bb96f3b))
- chore: change main code owner integrations-tools-js-ts ([1159](https://github.com/paritytech/substrate-api-sidecar/pull/1159)) ([bbbe90b](https://github.com/paritytech/substrate-api-sidecar/commit/bbbe90b7b7dd7babfed66c13e47121188a43886f))
- chore(deps): update substrate/calc and polkadot-js deps ([1158](https://github.com/paritytech/substrate-api-sidecar/pull/1158)) ([dc50726](https://github.com/paritytech/substrate-api-sidecar/commit/dc507264f879416e0b05b121df0ab2cfafed5908))

### Docs

- docs: fix docs ([1145](https://github.com/paritytech/substrate-api-sidecar/pull/1145)) ([17f00d6](https://github.com/paritytech/substrate-api-sidecar/commit/17f00d6431e963bc1f9bed400557981697d5b933))

### Tests

- test: optimize test runner for e2e-tests and ci ([1142](https://github.com/paritytech/substrate-api-sidecar/pull/1142)) ([f635d59](https://github.com/paritytech/substrate-api-sidecar/commit/f635d592f12fe422196cfbc2830c779397bbd40f))
- test(e2e-tests): reorg the e2e-tests to be under a historic folder to prepare for current tests ([1147](https://github.com/paritytech/substrate-api-sidecar/pull/1147)) ([6a4249e](https://github.com/paritytech/substrate-api-sidecar/commit/6a4249e71d8d1790e5b1fe57bf09cb8321060cc5))

## Compatibility

Tested against:
- Polkadot v9330
- Kusama v9330
- Westend v9330


## [14.1.2](https://github.com/paritytech/substrate-api-sidecar/compare/v14.1.1..v14.1.2) (2022-11-21)

### Bug Fixes

- fix: update polkadot-js api, and util-crypto ([#1139](https://github.com/paritytech/substrate-api-sidecar/pull/1139)) ([9cf2597](https://github.com/paritytech/substrate-api-sidecar/commit/9cf25978bf286e82bfd82c9f47f2bc5da4323979))
    - Note: This resolves an issue when querying a node with 0.9.32 ex: `Struct: Cannot decode value <number> (typeof number), expected an input object, map or array`. See the tracking issue [here](https://github.com/paritytech/substrate-api-sidecar/issues/1138)

### CI

- ci: fix buildah image ([#1137](https://github.com/paritytech/substrate-api-sidecar/pull/1137)) ([ec5c86b](https://github.com/paritytech/substrate-api-sidecar/commit/ec5c86b7650aab20e0ce35a19049373eee9b0e60))

## Compatibility

Tested against:
- Polkadot v9320
- Kusama v9320
- Westend v9320

## [14.1.1](https://github.com/paritytech/substrate-api-sidecar/compare/v14.1.0..v14.1.1) (2022-11-11)

### Chores

- chore: bump Swatinem/rust-cache from 2.0.1 to 2.1.0 ([#1129](https://github.com/paritytech/substrate-api-sidecar/pull/1129)) ([4007a21](https://github.com/paritytech/substrate-api-sidecar/commit/4007a21b5469ff6ff2d325fee90374420af378aa))
- chore: bump follow-redirects from 1.14.7 to 1.15.2 in /docs ([#1118](https://github.com/paritytech/substrate-api-sidecar/pull/1118)) ([b5a991b](https://github.com/paritytech/substrate-api-sidecar/commit/b5a991b18604f73b3e4028613e66145e52ed080a))
- chore:(deps): bump tmpl from 1.0.4 to 1.0.5 ([#1122](https://github.com/paritytech/substrate-api-sidecar/pull/1122)) ([927c88f](https://github.com/paritytech/substrate-api-sidecar/commit/927c88f449a55c0cee6339b0e4c3bf44762e2b22))
- chore: bump Swatinem/rust-cache from 2.1.0 to 2.2.0 ([#1131](https://github.com/paritytech/substrate-api-sidecar/pull/1131)) ([cf272f1](https://github.com/paritytech/substrate-api-sidecar/commit/cf272f196468261362b4c0ccc5811eaa4ffe7734))
- chore: bump loader-utils from 1.4.0 to 1.4.1 in /docs ([#1130](https://github.com/paritytech/substrate-api-sidecar/pull/1130)) ([8b5c4f7](https://github.com/paritytech/substrate-api-sidecar/commit/8b5c4f78265238342898f277a6aa9673ecc529e3))
- chore(deps): update polkadot-js deps ([#1133](https://github.com/paritytech/substrate-api-sidecar/pull/1133)) ([9300c63](https://github.com/paritytech/substrate-api-sidecar/commit/9300c63936a6c355b551af7d789e3262c5d1cd89))

### CI

- ci: break checks ci job into separate jobs ([#1114](https://github.com/paritytech/substrate-api-sidecar/pull/1114)) ([e687e79](https://github.com/paritytech/substrate-api-sidecar/commit/e687e79a662aefa2d831e63c657a05d0af3ba55d))

## Compatibility

Tested against:
- Polkadot v9320
- Kusama v9320
- Westend v9320


## [14.1.0](https://github.com/paritytech/substrate-api-sidecar/compare/v14.0.1..v14.1.0) (2022-11-03)

### Features

- feat: include balance-info support for statemine and statemint ([#1126](https://github.com/paritytech/substrate-api-sidecar/pull/1126)) ([a171305](https://github.com/paritytech/substrate-api-sidecar/commit/a171305185e07df953ae4ed767f82e99085b847c))

### Chores

- chore(deps): bump @polkadot/api from 9.5.2 to 9.6.1 ([#1098](https://github.com/paritytech/substrate-api-sidecar/pull/1098)) ([35ea356](https://github.com/paritytech/substrate-api-sidecar/commit/35ea356a5480d729902d4b2a8448594ea0521c2d))
- chore(deps): dedupe deps ([#1100](https://github.com/paritytech/substrate-api-sidecar/pull/1100)) ([0307ee7a](https://github.com/paritytech/substrate-api-sidecar/commit/0307ee7a334080b0a37082152c29dd9a2490a97e))
- chore: bump terser from 5.10.0 to 5.15.1 in /docs ([#1117](https://github.com/paritytech/substrate-api-sidecar/pull/1117)) ([799e1a5](https://github.com/paritytech/substrate-api-sidecar/commit/799e1a571cca18691097d660b52dd8e7d3e5bea5))
- chore(deps): bump minimist from 1.2.5 to 1.2.7 ([#1113](https://github.com/paritytech/substrate-api-sidecar/pull/1113)) ([27cd745](https://github.com/paritytech/substrate-api-sidecar/commit/27cd7458878a7098c8cfa8eae673cb830ae5910d))
- chore(deps-dev): bump @types/express-serve-static-core ([#1111](https://github.com/paritytech/substrate-api-sidecar/pull/1111)) ([77db77a](https://github.com/paritytech/substrate-api-sidecar/commit/77db77adbb786d9e6e199de95f8447e78c7b435d))
- chore(deps): bump winston from 3.8.1 to 3.8.2 ([#1109](https://github.com/paritytech/substrate-api-sidecar/pull/1109)) ([1c8cfc2](https://github.com/paritytech/substrate-api-sidecar/commit/1c8cfc2bdf29606db0281cbb8343afd871831b3c))
- chore(deps): bump lru-cache from 7.13.1 to 7.14.0 ([#1107](https://github.com/paritytech/substrate-api-sidecar/pull/1107)) ([5cbc2d5](https://github.com/paritytech/substrate-api-sidecar/commit/5cbc2d51b7d0dba1d1e40f247903f406f5aee6eb))
- chore(deps-dev): bump @substrate/dev from 0.6.4 to 0.6.5 ([#1106](https://github.com/paritytech/substrate-api-sidecar/pull/1106)) ([5a20fdf](https://github.com/paritytech/substrate-api-sidecar/commit/5a20fdfd57473a935f57e407028c5f75360bd250))
- chore(deps): bump express and @types/express ([#1105](https://github.com/paritytech/substrate-api-sidecar/pull/1105)) ([7187a15](https://github.com/paritytech/substrate-api-sidecar/commit/7187a1568144cb3756bb72b032a8a559acb3840c))
- chore(deps): bump path-parse from 1.0.6 to 1.0.7 ([#1120](https://github.com/paritytech/substrate-api-sidecar/pull/1120)) ([a0e69dc](https://github.com/paritytech/substrate-api-sidecar/commit/a0e69dcdad99c576f9ff7640d918df0620f9509b))
- chore(deps): bump tar from 6.1.0 to 6.1.11 ([#1119](https://github.com/paritytech/substrate-api-sidecar/pull/1119)) ([c6ca7b1](https://github.com/paritytech/substrate-api-sidecar/commit/c6ca7b11401fb26c14341b20d471442c757061a5))
- chore(deps): update polkadot-js deps ([#1124](https://github.com/paritytech/substrate-api-sidecar/pull/1124)) ([8cd3084](https://github.com/paritytech/substrate-api-sidecar/commit/8cd3084e79b06103122b9ea3ef46be54a935722f))

### CI

- ci: add dependabot for yarn ([#1096](https://github.com/paritytech/substrate-api-sidecar/pull/1096) ([24f4f26] (https://github.com/paritytech/substrate-api-sidecar/commit/24f4f26617baebdf355f84bf1f9be3070d1f4143))
- ci: remove allow from dependabot yml ([#1101](https://github.com/paritytech/substrate-api-sidecar/pull/1101)) ([41ded6c](https://github.com/paritytech/substrate-api-sidecar/commit/41ded6cf1143594f61f45c6f8ca09606497a4b5f))
- ci: increase bench threshold ([#1102](https://github.com/paritytech/substrate-api-sidecar/pull/1102)) ([d0defe0](https://github.com/paritytech/substrate-api-sidecar/commit/d0defe00b58cc4b13f15d01b2c45046b226ea1b0))
- ci: allow only security updates ([#1116](https://github.com/paritytech/substrate-api-sidecar/pull/1116)) ([6f8c334](https://github.com/paritytech/substrate-api-sidecar/commit/6f8c33449ee0911078f8dc5a6e6b0a452d1ddd1a))

### Bug Fixes
- fix: adjust historyDepth to a consts ([#1115](https://github.com/paritytech/substrate-api-sidecar/pull/1115)) ([bc3c2a5](https://github.com/paritytech/substrate-api-sidecar/commit/bc3c2a5bd66232c9c40cc849b1ad03031a71c7e3))

## Compatibility

Tested against:
- Polkadot v9300
- Kusama v9300
- Westend v9310

## [14.0.1](https://github.com/paritytech/substrate-api-sidecar/compare/v14.0.0..v14.0.1) (2022-10-19)

### Chores

- chore(yarn): bump yarn ([#1079](https://github.com/paritytech/substrate-api-sidecar/pull/1079)) ([eb368ae](https://github.com/paritytech/substrate-api-sidecar/commit/eb368aeec34b7c8a85802ff0e3e01c94553aca2f))
- chore(deps): updated polkadot-js deps ([#1090](https://github.com/paritytech/substrate-api-sidecar/pull/1090)) ([e6a70a3](https://github.com/paritytech/substrate-api-sidecar/commit/e6a70a35689956a53b9bec7a1297a82825faa49f))

### CI

- ci: bump Swatinem/rust-cache from 2.0.0 to 2.0.1 ([#1084](https://github.com/paritytech/substrate-api-sidecar/pull/1084)) ([aa2c9cb](https://github.com/paritytech/substrate-api-sidecar/commit/aa2c9cb5b525f97661b6a649d2fd716e2a78e445))
- ci: push metrics to prometheus-pushgateway ([#1086](https://github.com/paritytech/substrate-api-sidecar/pull/1086)) ([9284bd1](https://github.com/paritytech/substrate-api-sidecar/commit/9284bd1240ae4c0fcaa63f760dc17feeb1ceaaeb))

### Docs

- docs: Changes in schema & guide ([#1080](https://github.com/paritytech/substrate-api-sidecar/pull/1080)) ([3fa9689](https://github.com/paritytech/substrate-api-sidecar/commit/3fa968941cf3bfeca140febe0cbbc502effde7e7))

### Tests

- test(e2e): cleanup timeout ms ([#1072](https://github.com/paritytech/substrate-api-sidecar/pull/1072)) ([935905d](https://github.com/paritytech/substrate-api-sidecar/commit/935905d4cc419eacc389516518bf9a74ff7c7123))

## Compatibility

Tested against:
- Polkadot v9290
- Kusama v9290
- Westend v9300

## [14.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v13.1.0..v14.0.0) (2022-10-03)

### ⚠ BREAKING CHANGES ⚠

- feat!: support for NStorageMaps ([#1053](https://github.com/paritytech/substrate-api-sidecar/pull/1053)) ([a00a6b0](https://github.com/paritytech/substrate-api-sidecar/commit/a00a6b060cb4a9671fef6d831ffd67536d7b25d5))

### Features 

- feat: add /accounts/:accountId/convert endpoint ([#1007](https://github.com/paritytech/substrate-api-sidecar/pull/1007)) ([e2d6fae](https://github.com/paritytech/substrate-api-sidecar/commit/e2d6fae40d6369bde67c39f30baf70f247145017))

### Chores

- chore(deps): updated polkadot-js deps ([#1067](https://github.com/paritytech/substrate-api-sidecar/pull/1067)) ([1e09ae7](https://github.com/paritytech/substrate-api-sidecar/commit/1e09ae78f99052c5e30b43f71fe71b3c2bfbf970))

## Compatibility

Tested against:
- Polkadot v9290
- Kusama v9290
- Westend v9290


## [13.1.0](https://github.com/paritytech/substrate-api-sidecar/compare/v13.0.0..v13.1.0) (2022-09-19)

### Features

- feat: validateBooleanMiddleware for controllers ([#1023](https://github.com/paritytech/substrate-api-sidecar/pull/1023)) ([fc74d4a](https://github.com/paritytech/substrate-api-sidecar/commit/fc74d4ac1678553f2bcdc20902e576a5c586112c))

### Chores

- chore(deps): updated polkadot-js deps ([#1059](https://github.com/paritytech/substrate-api-sidecar/pull/1059)) ([90131ee](https://github.com/paritytech/substrate-api-sidecar/commit/90131eeee4bc14353a40c3e3f56a7f03b0d592c9))
- chore(yarn): bum yarn to 3.2.3 ([#1054](https://github.com/paritytech/substrate-api-sidecar/pull/1054)) ([bc5b2d0](https://github.com/paritytech/substrate-api-sidecar/commit/bc5b2d0eccc71615bdae053ab761f3e95ab815dc))
- chore(deps): update polkadot-js api, util-crypto ([#1048](https://github.com/paritytech/substrate-api-sidecar/pull/1048)) ([1719d8b](https://github.com/paritytech/substrate-api-sidecar/commit/1719d8bbc6e48b86496bdffbf3c7fc75be9a810a))

### CI

- ci: use polkadot node managed by argo-cd ([#1051](https://github.com/paritytech/substrate-api-sidecar/pull/1051)) ([d67d3a5](https://github.com/paritytech/substrate-api-sidecar/commit/d67d3a5027c684257ee7a8bed0c2d49904cdb2d7))

### Bug Fixes

- fix: add TransactionPayment::TransactionPaidFee support ([#1040](https://github.com/paritytech/substrate-api-sidecar/pull/1040)) ([108a93b](https://github.com/paritytech/substrate-api-sidecar/commit/108a93b1c3a23539a5be635c918d7cffd2b8be68))

### Tests

- test: fix deprecated lruCache.size deprecation ([#1042](https://github.com/paritytech/substrate-api-sidecar/pull/1042)) ([4820342](https://github.com/paritytech/substrate-api-sidecar/commit/4820342978855eaab212ef3eeae1e51013963bed))

### Docs

- docs: remove fee integration guide ([#1010](https://github.com/paritytech/substrate-api-sidecar/pull/1010)) ([66f57b5](https://github.com/paritytech/substrate-api-sidecar/commit/66f57b56c0a81d201fd2832603cf6d150aa48c23))

## Compatibility

Tested against:
- Polkadot v9290
- Kusama v9290
- Westend v9290


## [13.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v12.4.3..v13.0.0) (2022-08-31)

### ⚠ BREAKING CHANGES ⚠

- fix!: integrate @substrate/calc@0.3.0 for partial fees ([#1017](https://github.com/paritytech/substrate-api-sidecar/pull/1017)) ([92e3e1d](https://github.com/paritytech/substrate-api-sidecar/commit/92e3e1daba43bbefb1159fa84ceee0362380ac49))
    - Note: This removes the query param `feeByEvent` for all `/blocks/*` endpoints. Fee's are correctly calculated by default and dont require a secondary way of retrieving the `partialFee`. For historical blocks, an error might be logged and emitted for chains that don't have `TransactionPaymentApi::query_feeDetails` in their runtime API. The error is emitted by polkadot-js regardless of catching it, but it does not affect fee calculation as also logged by a follow up warning. Please refer to the PR for more information.
- feat!: add support for http provider using SAS_SUBSTRATE_URL ([#1001](https://github.com/paritytech/substrate-api-sidecar/pull/1001)) ([b12daa8](https://github.com/paritytech/substrate-api-sidecar/commit/b12daa8784a55e6dce587898d7d41ce46c8c191f))
    - Note: This replaces the standard `SAS_SUBSTRATE_WS_URL` with `SAS_SUBSTRATE_URL`. It's important when updating to sidecar v13.0.0 to replace all instances of the env variable with the new one. 

### Bug Fixes

- fix: current leases undefined bug ([#1034](https://github.com/paritytech/substrate-api-sidecar/pull/1034)) ([ae340ed](https://github.com/paritytech/substrate-api-sidecar/commit/ae340edcdbc812372fdd4f22871d349052ffd037))
- fix: remove deprecated reset for lru cache and replace with clear ([#1021](https://github.com/paritytech/substrate-api-sidecar/pull/1021)) ([55ef00d](https://github.com/paritytech/substrate-api-sidecar/commit/55ef00d365088855393babc143b82ddd347aadf4))
- fix: add bifrost_polkadot controller config ([#1009](https://github.com/paritytech/substrate-api-sidecar/pull/1009)) ([2fdbe31](https://github.com/paritytech/substrate-api-sidecar/commit/2fdbe319610651761a7f67f0141ba012cdf8b2a9)) Contributed by ([hqwangningbo](https://github.com/hqwangningbo))

### CI

- ci: pin gha versions add dependabot ([#1026](https://github.com/paritytech/substrate-api-sidecar/pull/1026)) ([b421c65](https://github.com/paritytech/substrate-api-sidecar/commit/b421c6582e4ae8c23e898934e812f38944d65b08))

### Chores

- chore(deps): update polkadot-js api and util-crypto ([#1030](https://github.com/paritytech/substrate-api-sidecar/pull/1030)) ([f59b7db](https://github.com/paritytech/substrate-api-sidecar/commit/f59b7dbeae430019ba3b115393b2fe8edb4dc241))
- chore(deps): update @substrate/dev ([#1028](https://github.com/paritytech/substrate-api-sidecar/pull/1028)) ([4443924](https://github.com/paritytech/substrate-api-sidecar/commit/4443924a6f136fd1cf903f0f5858e84854f9b304))
- chore(deps): update polkadot api, and util-crypto ([#1024](https://github.com/paritytech/substrate-api-sidecar/pull/1024)) ([62b028e](https://github.com/paritytech/substrate-api-sidecar/commit/62b028e4eb3fd7136ffcd13f44ec7fceb3122bfa))
- chore(deps): update api, and util-crypto ([#1019](https://github.com/paritytech/substrate-api-sidecar/pull/1019)) ([d12b2f7](https://github.com/paritytech/substrate-api-sidecar/commit/d12b2f7e50a5e160e7e1e05568976251fd7a2b22))

## Compatibility

Tested against:
- Polkadot v9270
- Kusama v9270
- Westend v9280


## [12.4.3](https://github.com/paritytech/substrate-api-sidecar/compare/v12.4.2..v12.4.3) (2022-08-09)

### Bug Fixes

- fix: add support for Parallel and Heiko ([#1012](https://github.com/paritytech/substrate-api-sidecar/pull/1012)) ([8770f3a](https://github.com/paritytech/substrate-api-sidecar/commit/8770f3a70b2156f5a9c2610a2f3f32c2e08f5e33))

### Chores

- chore(deps): update polkadot-js api, and util-crypto ([8164281](https://github.com/paritytech/substrate-api-sidecar/commit/81642815c42e330f7f5d49f3b8808465f90552cf))

## Compatibility

Tested against:
- Polkadot v9270
- Kusama v9270
- Westend v9270

## [12.4.2](https://github.com/paritytech/substrate-api-sidecar/compare/v12.4.1..v12.4.2) (2022-08-03)

### Bug Fixes

- fix(logging): replace TransformableInfo with ITransformableInfo type ([#994](https://github.com/paritytech/substrate-api-sidecar/pull/994)) ([c058904](https://github.com/paritytech/substrate-api-sidecar/commit/c058904aec5f63c61284240fc77bec928db9254e))
- fix(feeByEvent): use registry to convert hex to string ([#997](https://github.com/paritytech/substrate-api-sidecar/pull/997)) ([13ca62f](https://github.com/paritytech/substrate-api-sidecar/commit/13ca62f1c1cd8fa697f39cccabe3d1d1de0ea5b1))
- fix(feeByEvent): handle tip for partialFee ([#1003](https://github.com/paritytech/substrate-api-sidecar/pull/1003)) ([6e60aa9](https://github.com/paritytech/substrate-api-sidecar/commit/6e60aa9b39abf9b51b770c8e6e2d33bc2afac94d))

### Chores

- chore(dep): update polkadot-js api ([#998](https://github.com/paritytech/substrate-api-sidecar/pull/998)) ([fedfaee](https://github.com/paritytech/substrate-api-sidecar/commit/fedfaee0b9f965b39e20cf3714b96f30e9f0332a))
- chore(README): update readme with generate-type-bundle tool ([#1004](https://github.com/paritytech/substrate-api-sidecar/pull/1004)) ([45b25bf](https://github.com/paritytech/substrate-api-sidecar/commit/45b25bf15f17367d1cb9642b4a495d5ecd06ed59))
- chore: clean up resolutions ([#1000](https://github.com/paritytech/substrate-api-sidecar/pull/1000)) ([0545454](https://github.com/paritytech/substrate-api-sidecar/commit/0545454a74b5afa215180b8cee6062d7ae2fa32f))
- chore(yarn): bump yarn ([#996](https://github.com/paritytech/substrate-api-sidecar/pull/996)) ([cefa3f9](https://github.com/paritytech/substrate-api-sidecar/commit/cefa3f9652ed0f8506eb555ec87db98442ade962))

## Compatibility

Tested against:
- Polkadot v9250
- Kusama v9250
- Westend v9250

## [12.4.1](https://github.com/paritytech/substrate-api-sidecar/compare/v12.4.0..v12.4.1) (2022-07-28)

### Bug Fixes

- fix(feeByEvent): fix tip inclusion for partialFee ([#986](https://github.com/paritytech/substrate-api-sidecar/pull/986)) ([91dda83](https://github.com/paritytech/substrate-api-sidecar/commit/91dda83972cec95405f9373e620221a2b0aaeef4))
- fix(feeByEvent): sanitize fee for hex values ([#990](https://github.com/paritytech/substrate-api-sidecar/pull/990)) ([3f9a2c3](https://github.com/paritytech/substrate-api-sidecar/commit/3f9a2c386486d930dacabfe35ca8c9b7d93cb196))

### Chores

- chore(deps): update polkadot-js api, and util-crypto ([#987](https://github.com/paritytech/substrate-api-sidecar/pull/987)) ([f80666a](https://github.com/paritytech/substrate-api-sidecar/commit/f80666a959099305d28f5c5f296b5e4a41ad895c))
- chore(deps): update all non polkadot-js deps ([#988](https://github.com/paritytech/substrate-api-sidecar/pull/988)) ([0facebf](https://github.com/paritytech/substrate-api-sidecar/commit/0facebfcc0eb174692358f89660535ec9a4cec3d))

### Docs

- docs(readme): remove mention of apps-config ([#985](https://github.com/paritytech/substrate-api-sidecar/pull/985)) ([e003e93](https://github.com/paritytech/substrate-api-sidecar/commit/e003e93022f5657c12b237a36e39a0189e2e8505))

## Compatibility

Tested against:
- Polkadot v9250
- Kusama v9250
- Westend v9250

## [12.4.0](https://github.com/paritytech/substrate-api-sidecar/compare/v12.3.0..v12.4.0) (2022-07-13)

### Features

- feat: support for feeByEvent query param which will abstract the fees by events ([#970](https://github.com/paritytech/substrate-api-sidecar/pull/970)) ([92c155d](https://github.com/paritytech/substrate-api-sidecar/commit/92c155d86f4fc8aefec65a95c69836a81d7d3330))

### Chores

- chore(deps): update polkadot-js api, and util-crypto ([#982](https://github.com/paritytech/substrate-api-sidecar/pull/982)) ([c34bdde](https://github.com/paritytech/substrate-api-sidecar/commit/c34bddedbf55b26b83dcbfa8f7ef544bbedbcab1))

### Tests

- test(e2e): update validate endpoint ([#979](https://github.com/paritytech/substrate-api-sidecar/pull/979)) ([0a911de](https://github.com/paritytech/substrate-api-sidecar/commit/0a911de995d211116797d6355e11e74aa6ef7808))

## Compatibility

Tested against:
- Polkadot v9250
- Kusama v9250
- Westend v9250

## [12.3.0](https://github.com/paritytech/substrate-api-sidecar/compare/v12.2.0..v12.3.0) (2022-07-06)

### Features

- feat: Added the network and accountId to the response of validate endpoint ([#926](https://github.com/paritytech/substrate-api-sidecar/pull/926)) ([ef513cc](https://github.com/paritytech/substrate-api-sidecar/commit/ef513cc7f26773df776b9fe77cef8046bcadcea6)) Contributed by [Imod7](https://github.com/Imod7)

### Bug Fixes

- fix(pallets): deprecation warning adjustment ([#973](https://github.com/paritytech/substrate-api-sidecar/pull/973)) ([5514631](https://github.com/paritytech/substrate-api-sidecar/commit/55146315be366ea770339ef0f326c36d607a655a))

### Chores

- chore(deps): update polkadot.js, and fix type compilation ([#972](https://github.com/paritytech/substrate-api-sidecar/pull/972)) ([67f5bad](https://github.com/paritytech/substrate-api-sidecar/commit/67f5badb330c68b2ac2e967976ab7560b7a33c40))
- chore(deps): update polkadot-js api, and util-crypto ([#976](https://github.com/paritytech/substrate-api-sidecar/pull/976)) ([0dd3f63](https://github.com/paritytech/substrate-api-sidecar/commit/0dd3f6334c8f89a38c8bf2bce0537bcc28021df7))
- chore(dev): update @substrate/dev ([#977](https://github.com/paritytech/substrate-api-sidecar/pull/977)) ([2c3ce3e](https://github.com/paritytech/substrate-api-sidecar/commit/2c3ce3ed09bf9cc010d907bf08e15d946323b3ac))

## Compatibility

Tested against:
- Polkadot v9240
- Kusama v9240
- Westend v9240

## [12.2.0](https://github.com/paritytech/substrate-api-sidecar/compare/v12.1.1..v12.2.0) (2022-06-22)

### Features

- feat: add /blocks that enforces range query param ([#954](https://github.com/paritytech/substrate-api-sidecar/pull/954)) ([f8ab1ec](https://github.com/paritytech/substrate-api-sidecar/commit/f8ab1ec965ae2fde9ab162371cf3163e6d4ff5b9))
    - This Feature provides a new endpoints called `/blocks` which allows you to query a range of blocks maxing out at 500. An example query would be `/blocks?range=0-499`.

### Bug Fixes

- fix: set minCalcFee runtime to 1058 for kusama ([#966](https://github.com/paritytech/substrate-api-sidecar/pull/966)) ([e3adacc](https://github.com/paritytech/substrate-api-sidecar/commit/e3adaccd1d57b042942c46a0cbfe02ae42a8481f))
- fix(scripts): jest pass-fail bug ([#944](https://github.com/paritytech/substrate-api-sidecar/pull/944)) ([44482aa](https://github.com/paritytech/substrate-api-sidecar/commit/44482aa93bc0d558e2642f85238396162d550dc4))

### Chores

- chore(deps): update polkadot-js api, and util-crypto ([#967](https://github.com/paritytech/substrate-api-sidecar/pull/967)) ([5dd8332](https://github.com/paritytech/substrate-api-sidecar/commit/5dd83329ed4f8c970ab2d88b59e559811e40e1be))

### CI

- ci: update node version in docker ([#956](https://github.com/paritytech/substrate-api-sidecar/pull/956)) ([a6a4bdb](https://github.com/paritytech/substrate-api-sidecar/commit/a6a4bdba8a29a7547a4a767dea537b678eebfe6a))
- ci: increase benchmark threshold ([#962](https://github.com/paritytech/substrate-api-sidecar/pull/962)) ([bb5dea9](https://github.com/paritytech/substrate-api-sidecar/commit/bb5dea947790bce00af7b2794a83f23f53ab392a))

### Docs

- docs: fix includeFee query param ([#965](https://github.com/paritytech/substrate-api-sidecar/pull/965)) ([b7a5843](https://github.com/paritytech/substrate-api-sidecar/commit/b7a5843ec5f7a77f7dec10c7c469290a5cef6528))

## Compatibility

Tested against:
- Polkadot v9240
- Kusama v9240
- Westend v9240

## [12.1.1](https://github.com/paritytech/substrate-api-sidecar/compare/v12.1.0..v12.1.1) (2022-06-14)

### Bug Fixes

- fix(deps): update pjs api ([#957](https://github.com/paritytech/substrate-api-sidecar/pull/957)) ([db4ae5e](https://github.com/paritytech/substrate-api-sidecar/commit/db4ae5ed2fcf423f94ccaf53864c263e656c579e))

### Chore

- chore(dev): update dev dep ([#955](https://github.com/paritytech/substrate-api-sidecar/pull/955)) ([1b27f03](https://github.com/paritytech/substrate-api-sidecar/commit/1b27f03f1f4f7b10d3fcd46c2a98efa0d53d236b))
- chore(docs): update docs deps, and remove json-loader ([#950](https://github.com/paritytech/substrate-api-sidecar/pull/950)) ([8e3e408](https://github.com/paritytech/substrate-api-sidecar/commit/8e3e408376d0e8cbb268d715f339b17c31c1b404))
- chore: bump yarn 3.2.1 ([#947](https://github.com/paritytech/substrate-api-sidecar/pull/947)) ([51f9e34](https://github.com/paritytech/substrate-api-sidecar/commit/51f9e34b0a5203c7518c23bac1c958b1dd49bea8))

### Docs

- docs(bug): revert docs update ([#958](https://github.com/paritytech/substrate-api-sidecar/pull/958)) ([eb0ec7f](https://github.com/paritytech/substrate-api-sidecar/commit/eb0ec7f26001fdbc753e8c03654c3101123462d9))

## Compatibility

Tested against:
- Polkadot v9230
- Kusama v9230
- Westend v9230

## [12.1.0](https://github.com/paritytech/substrate-api-sidecar/compare/v12.0.1..v12.1.0) (2022-06-07)

### Features

- feat: add query param to add a tip, partialFee, and priority field to each extrinsic for /node/transaction-pool ([#931](https://github.com/paritytech/substrate-api-sidecar/pull/931)) ([8241d34](https://github.com/paritytech/substrate-api-sidecar/commit/8241d340e494b86087b31ae7a3176a195e042c4e))

### Bug Fixes

- fix(polkadot-js): update api, and common deps ([#934](https://github.com/paritytech/substrate-api-sidecar/pull/934)) ([fd7021c](https://github.com/paritytech/substrate-api-sidecar/commit/fd7021ceed0ef722f3fbf585e373b4994e54bf61))

### Test

- test: silence unnecessary logging for tests ([#916](https://github.com/paritytech/substrate-api-sidecar/pull/916)) ([9633480](https://github.com/paritytech/substrate-api-sidecar/commit/96334802cefaf60474e2e6ff005c164bc434299f))

## Compatibility

Tested against:
- Polkadot v9230
- Kusama v9230
- Westend v9230

## [12.0.1](https://github.com/paritytech/substrate-api-sidecar/compare/v12.0.0..v12.0.1) (2022-06-03)

### Bug Fixes

- fix(calc): rework calculating fees ([#937](https://github.com/paritytech/substrate-api-sidecar/pull/937)) ([3306466](https://github.com/paritytech/substrate-api-sidecar/commit/330646699db4db6077eb7d14896dfccef4cde2b3))
- fix(imports): chains-config imports ([#932](https://github.com/paritytech/substrate-api-sidecar/pull/932)) ([f4f531a](https://github.com/paritytech/substrate-api-sidecar/commit/f4f531aaf52487cdd8958cc92ee6cde20e7b65ca))
- fix(imports): NodeTransactionPoolService response import ([#929](https://github.com/paritytech/substrate-api-sidecar/pull/929)) ([ad2fbaa](https://github.com/paritytech/substrate-api-sidecar/commit/ad2fbaaff2c3573b068110d1985a2ed4b7e8dd31))

### Chore

- chore(license): append the license to the top of each file ([#927](https://github.com/paritytech/substrate-api-sidecar/pull/927)) ([8906816](https://github.com/paritytech/substrate-api-sidecar/commit/8906816934b8e6bd5bf98393f83d55a6711d296e))

## Compatibility

Tested against:
- Polkadot v9230
- Kusama v9230
- Westend v9230

## [12.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v11.4.1..v12.0.0) (2022-05-24)

### Breaking Changes

Notes: Substrate API Sidecar will no longer support pulling custom types from `@polkadot/apps-config`. For all of the current endpoint's in sidecar there should be no effect, but if there are any methods or types that can't be decorated from the metadata you will see warning's emitted from the logger. You may still apply your own custom types in sidecar, please refer to the [custom substrate types](https://github.com/paritytech/substrate-api-sidecar#custom-substrate-types) portion of the readme, and if you would like more information please refer the to PR below. If you see any issues, or need additional guidance feel free to file an issue [here](https://github.com/paritytech/substrate-api-sidecar/issues).

- fix(apps-config)!: remove apps-config from sidecar ([#924](https://github.com/paritytech/substrate-api-sidecar/pull/924)) ([e2e8b59](https://github.com/paritytech/substrate-api-sidecar/commit/e2e8b59780d5ffe16df61d02e7c113b252d7f714))


### Bug Fixes

- fix: update polkadot.js api ([#928](https://github.com/paritytech/substrate-api-sidecar/pull/928)) ([7ac2178](https://github.com/paritytech/substrate-api-sidecar/commit/7ac2178586881c41aa7f96dca30b3fdc6235a053))

## [11.4.1](https://github.com/paritytech/substrate-api-sidecar/compare/v11.4.0..v11.4.1) (2022-05-18)

**Upgrade Priority** High (Required for users looking to update to 11.3.18, 11.3.19, or 11.4.0)

### Bug Fixes

- fix: revert apps-config to stable version ([#921](https://github.com/paritytech/substrate-api-sidecar/pull/921)) ([faf1595](https://github.com/paritytech/substrate-api-sidecar/commit/faf1595bd5b1dd3280c8e94a9cfdced96b53f5e6))

## [11.4.0](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.19..v11.4.0) (2022-05-18)

**Upgrade Priority** low

### Features

- feat(balance-info): add query param to convert free balance to human readable format ([#914](https://github.com/paritytech/substrate-api-sidecar/pull/914)) ([f1e03d6](https://github.com/paritytech/substrate-api-sidecar/commit/f1e03d6c771d74cd4848975c2ebdf42bd9ab8d8b))

### Bug Fixes

- fix(deps): update polkadot.js common, api, type interfaces ([#918](https://github.com/paritytech/substrate-api-sidecar/pull/918)) ([6baf526](https://github.com/paritytech/substrate-api-sidecar/commit/6baf526b0627b3d5ac662946a9403db72b53a617))
- fix(dev): updates substrate-js-dev, and fixes latest eslint rules ([#913](https://github.com/paritytech/substrate-api-sidecar/pull/913))([12c5914](https://github.com/paritytech/substrate-api-sidecar/commit/12c5914d99e5da646c9139bf1cc944edbdb34d78))

## Compatibility

Tested against:
- Polkadot v9210
- Kusama v9210
- Westend v9210

## [11.3.19](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.18..v11.3.19) (2022-05-10)

**Upgrade Priority** Low

### Bug Fixes

- fix(deps): update pjs api ([#915](https://github.com/paritytech/substrate-api-sidecar/pull/915)) ([f089967](https://github.com/paritytech/substrate-api-sidecar/commit/f0899671f4c51ec9179183242c0ae5155b21d63b))

## Compatibility

Tested against:
- Polkadot v9200
- Kusama v9200
- Westend v9200


## [11.3.18](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.17..v11.3.18) (2022-05-03)

**Upgrade Priority** Medium (For users querying `/runtime/metadata`. Fixes decoding all constants for V14)

### Bug Fixes

- fix(deps): update pjs api ([#906](https://github.com/paritytech/substrate-api-sidecar/pull/906)) ([528420c](https://github.com/paritytech/substrate-api-sidecar/commit/528420c29a1635b594730f781e01c6743082934a))
- fix: decode Bytes types for /runtime/metadata correctly ([#907](https://github.com/paritytech/substrate-api-sidecar/pull/907)) ([ce48c14](https://github.com/paritytech/substrate-api-sidecar/commit/ce48c144a2ebc566e323a2a32df5a187ffd4aad4))
- fix: update substrate-js-dev, add update-pjs script ([#904](https://github.com/paritytech/substrate-api-sidecar/pull/904)) ([59aabc3](https://github.com/paritytech/substrate-api-sidecar/commit/59aabc3006a5b7d2b11d7485ce0b53322b04815f))

## Compatibility

Tested against:
- Polkadot v9190
- Kusama v9190
- Westend v9190


## [11.3.17](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.16..v11.3.17) (2022-04-21)

**Upgrade Priority** High (For users querying chains using v9190, and need partialFee information)

### Bug Fixes

- fix(bug): handle lengthToFee given runtime v9190 ([#900](https://github.com/paritytech/substrate-api-sidecar/pull/900)) ([992b458](https://github.com/paritytech/substrate-api-sidecar/commit/992b458b91f95c43aeaa331130da1214e77f627c))
- fix(deps): update pjs api ([#897](https://github.com/paritytech/substrate-api-sidecar/pull/897)) ([511fcf9](https://github.com/paritytech/substrate-api-sidecar/commit/511fcf96b033a7215aa84474a16561497cad5d19))

## Compatibility

Tested against:
- Polkadot v9190
- Kusama v9190
- Westend v9190


## [11.3.16](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.15..v11.3.16) (2022-04-13)

**Upgrade Priority** Low

### Bug Fixes

- fix(deps): update pjs common, api, wasm-crypto ([#895](https://github.com/paritytech/substrate-api-sidecar/pull/895)) ([c09a869](https://github.com/paritytech/substrate-api-sidecar/commit/c09a8690bb7f6fec4faecda9636f27584bd1e921))
- fix: remove blockWeightsStore ([#891](https://github.com/paritytech/substrate-api-sidecar/pull/891)) ([ce701a0](https://github.com/paritytech/substrate-api-sidecar/commit/ce701a0a2d44a2a7febd0b23f50128c5ebab7378))
- fix: update polkadot-js deps, adjust tests for getWeight ([#890](https://github.com/paritytech/substrate-api-sidecar/pull/890)) ([c348363](https://github.com/paritytech/substrate-api-sidecar/commit/c3483631775e10cd436e1b5b6175dbb4ea59798e))

### Docs

- docs(release): abstract the release process into its own file ([#894](https://github.com/paritytech/substrate-api-sidecar/pull/894)) ([eece110](https://github.com/paritytech/substrate-api-sidecar/commit/eece110cbc5c9252109c31c2e7d7b850492fca1d))
- docs: updated README with trace endpoints & requirements note ([#872](https://github.com/paritytech/substrate-api-sidecar/pull/872)) ([d323857](https://github.com/paritytech/substrate-api-sidecar/commit/d3238573a838a46a94684f7598684debd8959471)) Contributed by ([Imod7](https://github.com/Imod7))

## Compatibility

Tested against:
- Polkadot v9180
- Kusama v9180
- Westend v9180


## [11.3.15](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.14..v11.3.15) (2022-03-30)

**Upgrade Priority** Low

### Bug Fixes

- fix: update polkadot-js deps and rxjs ([#882](https://github.com/paritytech/substrate-api-sidecar/pull/882)) ([9455397](https://github.com/paritytech/substrate-api-sidecar/commit/9455397b2e6459d7d815004c53668c1bce1b3701))
- fix: update polkadot deps, util-crypto, api, wasm-crypto ([#878](https://github.com/paritytech/substrate-api-sidecar/pull/878)) ([db74ab4](https://github.com/paritytech/substrate-api-sidecar/commit/db74ab49fcf948f44332568c57958ff85630c288))
- fix: add 9180 for metadata-consts ([#879](https://github.com/paritytech/substrate-api-sidecar/pull/879)) ([a2daf75](https://github.com/paritytech/substrate-api-sidecar/commit/a2daf756341119c897b71609cefc9702644b25ff))

### Tests

- fix: update e2e-tests ([#877](https://github.com/paritytech/substrate-api-sidecar/pull/877)) ([7382dca](https://github.com/paritytech/substrate-api-sidecar/commit/7382dcaa44f7dac0f908895ca1b56ab174713198))

## Compatibility

Tested against:
- Polkadot v9180
- Kusama v9180
- Westend v9180


## [11.3.14](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.13..v11.3.14) (2022-03-16)

**Upgrade Priority** Low

### Bug Fixes

- fix: enable experimental trace endpoints for polkadot ([868](https://github.com/paritytech/substrate-api-sidecar/pull/868)) ([37c35ae](https://github.com/paritytech/substrate-api-sidecar/commit/37c35aed5b4db67fdfe26d95e60acf0d7ad580e5))
- fix: bump yarn ([#869](https://github.com/paritytech/substrate-api-sidecar/pull/869)) ([a904962](https://github.com/paritytech/substrate-api-sidecar/commit/a904962dd30a3c43469c8bb41ae8ddc73077356a))
- fix: update polkadot api, apps-config, and util-crypto ([#871](https://github.com/paritytech/substrate-api-sidecar/pull/871)) ([ff0cef5](https://github.com/paritytech/substrate-api-sidecar/commit/ff0cef5eaeeef74f9a931a0355d83fc5ebdea645))
- fix: add runtime 9170, and 700 to metadata consts ([#873](https://github.com/paritytech/substrate-api-sidecar/pull/873)) ([dcce39e](https://github.com/paritytech/substrate-api-sidecar/commit/dcce39e9db07ca8222364b17dab60e45e8a99f39))

## Compatibility

Tested against:
- Polkadot v9170
- Kusama v9170
- Westend v9170

## [11.3.13](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.12..v11.3.13) (2022-03-08)

**Upgrade Priority** Low

### Bug Fixes

- fix: update api to 7.11.1, and apps config 0.108.1 ([#862](https://github.com/paritytech/substrate-api-sidecar/pull/862)) ([222a258](https://github.com/paritytech/substrate-api-sidecar/commit/222a2581e470209602144a9827279971a2f35f91))
- fix: update substrate/calc to 0.2.8 ([#861](https://github.com/paritytech/substrate-api-sidecar/pull/861)) ([3ade139](https://github.com/paritytech/substrate-api-sidecar/commit/3ade139bb12a00b02ced5220d9d255e53cd52938))
- fix: update api to 7.10.1, and apps config to 0.107.1 ([#859](https://github.com/paritytech/substrate-api-sidecar/pull/859)) ([7f29c46](https://github.com/paritytech/substrate-api-sidecar/commit/7f29c46df9ac6ad0fa9d6175cc5c5dd5c9192208))

### Calc

- chore(release-calc): 0.2.8 ([#860](https://github.com/paritytech/substrate-api-sidecar/pull/860)) ([cf8297d](https://github.com/paritytech/substrate-api-sidecar/commit/cf8297dad4cfaf3ec4ccf5b7e79ff02f4ceda100))
- fix: support fee calculation for Bifrost ([#853](https://github.com/paritytech/substrate-api-sidecar/pull/853)) ([cd33db7](https://github.com/paritytech/substrate-api-sidecar/commit/cd33db78849be9d3f229aefeccdc42d3a5c53b05)) Contributed by ([ark930](https://github.com/ark930))

## Compatibility

Tested against:
- Polkadot v9170
- Kusama v9170
- Westend v9170

## [11.3.12](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.11..v11.3.12) (2022-02-28)

**Upgrade Priority** Low (Fixes Docker release, and CI Build. This is a mirror release of 11.3.11)

### CI

- fix(bug): fix build ([#855](https://github.com/paritytech/substrate-api-sidecar/pull/855)) ([daa35bf](https://github.com/paritytech/substrate-api-sidecar/commit/daa35bfbe650a54b849cdb0abf22353f5b5507eb))

## Compatibility

Tested against:
- Polkadot v9160
- Kusama v9160
- Westend v9160

## [11.3.11](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.10..v11.3.11) (2022-02-24)

**Upgrade Priority** Low

### Bug Fixes

- fix: update polkadot-js deps ([#850](https://github.com/paritytech/substrate-api-sidecar/pull/850)) ([db9eb36](https://github.com/paritytech/substrate-api-sidecar/commit/db9eb3667adf031c4f44e04263ea5ca11b4508aa))
- fix(devDep): update @substrate/dev ([#838](https://github.com/paritytech/substrate-api-sidecar/pull/838)) ([b710b23](https://github.com/paritytech/substrate-api-sidecar/commit/b710b235e00dee3d614e235f13e2f49303518998))
- fix: Abstract error handling for addresses into AbstractService ([#842](https://github.com/paritytech/substrate-api-sidecar/pull/842)) ([88e176b](https://github.com/paritytech/substrate-api-sidecar/commit/88e176bbaa81d3ef6dac9e53a6b05af9d5500562))

### Docs

- docs: fix methodName -> method ([#848](https://github.com/paritytech/substrate-api-sidecar/pull/848)) ([10008c1](https://github.com/paritytech/substrate-api-sidecar/commit/10008c1f2260c92477e05d66f79a4cbffd039c11))
- docs: seperate the release process from updating polkadot-js deps ([#837](https://github.com/paritytech/substrate-api-sidecar/pull/837)) ([268de8d](https://github.com/paritytech/substrate-api-sidecar/commit/268de8d9902ec6ffe09b8ddd740247f6a89d167c))
- docs: transition to webpack 5, and bump deps ([#839](https://github.com/paritytech/substrate-api-sidecar/pull/839)) ([248642d](https://github.com/paritytech/substrate-api-sidecar/commit/248642ddaa0cdb1373064e3c4dc16806683c6486))

### CI

- fix: check benchmark ([#851](https://github.com/paritytech/substrate-api-sidecar/pull/851)) ([01d1ee5](https://github.com/paritytech/substrate-api-sidecar/commit/01d1ee520c82efeda0be55486965f1819583a266))
- ci: add benchmark checker ([#849](https://github.com/paritytech/substrate-api-sidecar/pull/849)) ([8e35e70](https://github.com/paritytech/substrate-api-sidecar/commit/8e35e708c562d235059200273ca32a0df765c0cf))

## Compatibility

Tested against:
- Polkadot v9160
- Kusama v9160
- Westend v9160

## [11.3.10](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.9..v11.3.10) (2022-02-16)

**Upgrade Priority** High (For users who leverage `/blocks`, and require the call data for `multiSig` extrinsics)

### Bug Fixes

- fix: update polkadot-js deps, and bn.js ([71edc3c](https://github.com/paritytech/substrate-api-sidecar/commit/71edc3c8b8daaee70e5d73aff812f60e863c1edb)) ([#843](https://github.com/paritytech/substrate-api-sidecar/pull/843))
- fix: correctly serialize a multsig call, then parse WrapperKeepOpaque, and WrapperOpaque ([#840](https://github.com/paritytech/substrate-api-sidecar/pull/840)) ([60826c0](https://github.com/paritytech/substrate-api-sidecar/commit/60826c0a0053337eca6892bc9327502f21cc100f))

### CI

- ci: add benchmarks to pipeline ([#821](https://github.com/paritytech/substrate-api-sidecar/pull/821)) ([0c8ae8b](https://github.com/paritytech/substrate-api-sidecar/commit/0c8ae8bf14d863c14b9153d3a26824d13d6f2eed)) Contributed by: ([alvicsam](https://github.com/alvicsam))

## Compatibility

Tested against:
- Polkadot v9160
- Kusama v9160
- Westend v9160

## [11.3.9](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.8..v11.3.9) (2022-02-09)

**Upgrade Priority** Medium (With the oncoming runtime upgrade to v9160 it's wise to update)

### Bug Fixes

- fix: update block weight store for v9160 ([#834](https://github.com/paritytech/substrate-api-sidecar/pull/834)) ([0b0d3cc](https://github.com/paritytech/substrate-api-sidecar/commit/0b0d3cc7310cf6fc9b8377cd0651e0a5b0053188))
- fix: update polkadot-js api, and apps-config ([#836](https://github.com/paritytech/substrate-api-sidecar/pull/836)) ([1be7938](https://github.com/paritytech/substrate-api-sidecar/commit/1be79380885ce1420b916b9dcbf5a9d7ce2faebb))

## Compatibility

Tested against:
- Polkadot v9160
- Kusama v9160
- Westend v9160

## [11.3.8](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.7..v11.3.8) (2022-02-02)

**Upgrade Priority** High (For users that leverage `/paras/auctions/current`)

### Bug Fixes

- fix: update polkadot-js/api, and rxjs ([#830](https://github.com/paritytech/substrate-api-sidecar/pull/830)) ([90083d1](https://github.com/paritytech/substrate-api-sidecar/commit/90083d1ef3ae0d336c4d9eefc9807efdd50416c8))
- fix: retrieving public endpoints with `createWsEndpoints` function ([#829](https://github.com/paritytech/substrate-api-sidecar/pull/829)) ([a019c8b](https://github.com/paritytech/substrate-api-sidecar/commit/a019c8b1ddf130e1f1405012996585ec18a0e243)) Contributed by: ([Imod7](https://github.com/Imod7))
- fix: ?at bug and endingOffset conditionals ([#824](https://github.com/paritytech/substrate-api-sidecar/pull/824)) ([1774e90](https://github.com/paritytech/substrate-api-sidecar/commit/1774e900832aad3467130fba130fd7ab09940a31))
- fix: update all polkadot-js deps ([#828](https://github.com/paritytech/substrate-api-sidecar/pull/828)) ([23d4cec](https://github.com/paritytech/substrate-api-sidecar/commit/23d4cec7cfe3dc4295f50afab58f06d72e52ce64))

### Tests

- fix(e2e-tests): update e2e tests for kusama auctions ([#831](https://github.com/paritytech/substrate-api-sidecar/pull/831)) ([7ad75aa](https://github.com/paritytech/substrate-api-sidecar/commit/7ad75aa7f87f41802c092ed5327e6bde0a34a580))

## Compatibility

Tested against:
- Polkadot v9151
- Kusama v9151
- Westend v9150

## [11.3.7](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.6..v11.3.7) (2022-01-26)

**Upgrade Priority** Low

## Bug Fixes

- fix: update polkadot-js api to 7.2.1 ([#809](https://github.com/paritytech/substrate-api-sidecar/pull/809)) ([3553fb8](https://github.com/paritytech/substrate-api-sidecar/commit/3553fb813cc54199482038eed2e236e76310c507))
- fix: error handling on account balances ([#813](https://github.com/paritytech/substrate-api-sidecar/pull/813)) ([05f97bb](https://github.com/paritytech/substrate-api-sidecar/commit/05f97bbf65913ee11fd7bb6c2eaeec8cab57d6ee))
- fix: add 9150, and 9151 to kusama blockWeightsStore ([#819](https://github.com/paritytech/substrate-api-sidecar/pull/819)) ([cda73a0](https://github.com/paritytech/substrate-api-sidecar/commit/cda73a0fdcd1d09f68c7298ce427d5a2be1aaa56))

## Substrate/Calc

- fix(tests): add tests for impl Multplier ([#802](https://github.com/paritytech/substrate-api-sidecar/pull/802)) ([0a53cbd](https://github.com/paritytech/substrate-api-sidecar/commit/0a53cbda5dbf06c3b03647fbfb38bbcdeb46e4b2))
- fix: add fee calculation support and block weights for Astar network ([#820](https://github.com/paritytech/substrate-api-sidecar/pull/820)) ([1c5f16a](https://github.com/paritytech/substrate-api-sidecar/commit/1c5f16a8268ba8e152ef097e8676ed408214dcb8)) Contributed by: ([hoonsubin](https://github.com/hoonsubin))
- fix: support crust calc ([#822](https://github.com/paritytech/substrate-api-sidecar/pull/822)) ([72be2df](https://github.com/paritytech/substrate-api-sidecar/commit/72be2df24e21eb7cc31a796571ed110730b8676b)) Contributed by: ([yashirooooo](https://github.com/yashirooooo))

## Security

- fix: cleanup unused dependencies, and sec updates for node-forge ([#817](https://github.com/paritytech/substrate-api-sidecar/pull/817)) ([7a8ba0f](https://github.com/paritytech/substrate-api-sidecar/commit/7a8ba0fbb90005d0a348a03471afcad8d380a3ac))
- fix(security): Update follow-redirects ([#816](https://github.com/paritytech/substrate-api-sidecar/pull/816)) ([ed50064](https://github.com/paritytech/substrate-api-sidecar/commit/ed50064abc8a6d02fcd22343b40cc1227c08d2cc))

## Compatibility

Tested against:
- Polkadot v9151
- Kusama v9151
- Westend v9150

## [11.3.6](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.5..v11.3.6) (2022-01-12)

**Upgrade Priority** Low (Important for users using `/paras/leases/current`, `/paras/{para-id}/lease-info`)

## Bug Fixes

- fix: add leaseOffset to leasesCurrent end calc ([#801](https://github.com/paritytech/substrate-api-sidecar/pull/801)) ([4d83dcb](https://github.com/paritytech/substrate-api-sidecar/commit/4d83dcb7cf3352d5e597dd5f9bab3791482e9430)) Contributed by: ([sawvox](https://github.com/sawvox))
- fix: set min calc fee runtime version to 601 for statemint ([#806](https://github.com/paritytech/substrate-api-sidecar/pull/806)) ([3136399](https://github.com/paritytech/substrate-api-sidecar/commit/3136399458ec3954d1305ce2c7311e873bd687a5))
- fix(tsc): explicitly define typescript version ([#804](https://github.com/paritytech/substrate-api-sidecar/pull/804)) ([c86d0c8](https://github.com/paritytech/substrate-api-sidecar/commit/c86d0c80cfa0fec17b95e2c908057ea171af7f67))

## Tests

- fix: add v9140 to blocksWeightStore for parity chains ([#798](https://github.com/paritytech/substrate-api-sidecar/pull/798)) ([bbc7fbd](https://github.com/paritytech/substrate-api-sidecar/commit/bbc7fbd30a3f90b84c543c6828679c641c139316))
- fix: add statemint, and update with 9130 runtime tests ([#807](https://github.com/paritytech/substrate-api-sidecar/pull/807)) ([c6ec7be](https://github.com/paritytech/substrate-api-sidecar/commit/c6ec7bebff1aa5f3ec8d298ed5cbf9e7606e0666))

## Docs

- fix: add chain fee calculation guide ([#797](https://github.com/paritytech/substrate-api-sidecar/pull/797)) ([0b7ef02](https://github.com/paritytech/substrate-api-sidecar/commit/0b7ef0252324288983142686eabd9deb652ba3d1))
- fix: update readme for e2e-tests ([#799](https://github.com/paritytech/substrate-api-sidecar/pull/799)) ([583365a](https://github.com/paritytech/substrate-api-sidecar/commit/583365abf1200a33573e88c4e671215d723c5531))

## Chore

- fix: Update license with new year (2022) ([#810](https://github.com/paritytech/substrate-api-sidecar/pull/810)) ([2c0bd28](https://github.com/paritytech/substrate-api-sidecar/commit/2c0bd2883fa4bd6a9c6684954c86ed194d84738e))

## Compatibility

Tested against:
- Polkadot v9130
- Kusama v9130
- Westend v9130

## [11.3.5](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.4..v11.3.5) (2021-12-21)

**Upgrade Priority** Low

### Bug Fixes

- fix: bump polkadot-js deps ([796](https://github.com/paritytech/substrate-api-sidecar/pull/796)) ([c79d126](https://github.com/paritytech/substrate-api-sidecar/commit/c79d1269dd67ad79fe82c851f0e24ea5c83b5a56))
- fix: add blockWeightStore and fee calc support for common good parachains ([1059c1a](https://github.com/paritytech/substrate-api-sidecar/commit/1059c1af81cc830d0735df95b46912ee822a293c))

## Compatibility

Tested against:
- Polkadot v9130
- Kusama v9130
- Westend v9130

## [11.3.4](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.3..v11.3.4) (2021-12-16)

**Upgrade priority** Medium (Security: Important for users who fork from sidecar, and use the docs directory)

### Bug Fixes

- fix: bump polkadot-js deps ([793](https://github.com/paritytech/substrate-api-sidecar/pull/793)) ([dd32e44](https://github.com/paritytech/substrate-api-sidecar/commit/dd32e44324d14eb96e9bb32ce0b632b2ed377471))
- fix: decrease bundle size of tgz ([791](https://github.com/paritytech/substrate-api-sidecar/pull/791)) ([848a7a6](https://github.com/paritytech/substrate-api-sidecar/commit/848a7a680d61406b5d05fa7237af648446c7f68c))
- fix: add 9130 to westend and polkadot ([789](https://github.com/paritytech/substrate-api-sidecar/pull/789)) ([48ceaeb](https://github.com/paritytech/substrate-api-sidecar/commit/48ceaeb5179b454041357523a9230fb7233dac0d))

### Security

- fix(security): address security advisory on swagger-ui dependency ([790](https://github.com/paritytech/substrate-api-sidecar/pull/790)) ([f6158af](https://github.com/paritytech/substrate-api-sidecar/commit/f6158af1942fd1a72d54fe5161c51b50cabe2ea0))

## Compatibility

Tested against:
- Polkadot v9130
- Kusama v9130
- Westend v9130

## [11.3.3](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.2..v11.3.3) (2021-12-09)

**Upgrade priority** Low

### Bug Fixes

- fix: bump polakdot-js deps ([#786](https://github.com/paritytech/substrate-api-sidecar/pull/786)) ([072ef06](https://github.com/paritytech/substrate-api-sidecar/commit/072ef0635fa5ee7a1ff71b769560f8fa0f906fbf))

## Compatibility

Tested against:
- Polkadot v9122
- Kusama v9130
- Westend v9130

## [11.3.2](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.1..v11.3.2) (2021-12-01)

**Upgrade priority**

### Bug Fixes

- fix: update websocket addresses used for e2e tests ([#780](https://github.com/paritytech/substrate-api-sidecar/pull/780)) ([b7743f4](https://github.com/paritytech/substrate-api-sidecar/commit/b7743f4537dbb2775cfd281f021eacc7af8096d5))
- fix: bump polkadot-js/api to 6.10.3 ([#779](https://github.com/paritytech/substrate-api-sidecar/pull/779)) ([a97ca77](https://github.com/paritytech/substrate-api-sidecar/commit/a97ca77b66d562d29c05bf2110c14b36bf39cf70))
- fix: update polkadot-js deps, and fix tests and types for assets ([#777](https://github.com/paritytech/substrate-api-sidecar/pull/777)) ([51eaa91](https://github.com/paritytech/substrate-api-sidecar/commit/51eaa915797f1522341edf275c05fbd30382b4f0))
- fix: add v3101 to calamari blockWeightsStore ([#776](https://github.com/paritytech/substrate-api-sidecar/pull/776)) ([5bf57b4](https://github.com/paritytech/substrate-api-sidecar/commit/5bf57b4c72a288641f4a14c0ae7aa0a58bdf5439)) Contributed by: [grenade](https://github.com/grenade)
- fix: add v9130 to kusama blockWeightsStore ([#775](https://github.com/paritytech/substrate-api-sidecar/pull/775)) ([212de6d](https://github.com/paritytech/substrate-api-sidecar/commit/212de6ddf8ee9c75b4c166ebf423ca7815d7ce44))
- fix: add v3100 to calamari blockWeightsStore ([#773](https://github.com/paritytech/substrate-api-sidecar/pull/773)) ([85e18e1](https://github.com/paritytech/substrate-api-sidecar/commit/85e18e1d97a131f0d194c92e71ec5e1a66c983db)) Contributed by: [grenade](https://github.com/grenade)

### Chores

- chore: Add CODEOWNERS file ([#770](https://github.com/paritytech/substrate-api-sidecar/pull/770)) ([0ed40ee](https://github.com/paritytech/substrate-api-sidecar/commit/0ed40ee1c7226809aa6e715169d5ae346e28c905)) Contributed by: [sergejparity](https://github.com/sergejparity)

### Docs

- docs: Update readme with node compatibility chart ([#774](https://github.com/paritytech/substrate-api-sidecar/pull/774)) ([5a0430b](https://github.com/paritytech/substrate-api-sidecar/commit/5a0430b970348904a5b758bb9f0c125d34eb6ebb))

## [11.3.1](https://github.com/paritytech/substrate-api-sidecar/compare/v11.3.0..v11.3.1) (2021-11-23)

**Upgrade priority**: Low

### Bug Fixes

- fix: support manta parachain fee calculations ([#767](https://github.com/paritytech/substrate-api-sidecar/pull/767)) ([3f68052](https://github.com/paritytech/substrate-api-sidecar/commit/3f680523a6a1efe845bcf39343ec68f3eea00e61)) Contribute by [grenade](https://github.com/grenade)
- chore(release-calc): v0.2.6 ([#768](https://github.com/paritytech/substrate-api-sidecar/pull/768)) ([cee6b8b](https://github.com/paritytech/substrate-api-sidecar/commit/cee6b8b71c102dcc5850713faa56178459fdbe73))
- fix: bump polkadot-js deps ([#769](https://github.com/paritytech/substrate-api-sidecar/pull/769)) ([3eda242](https://github.com/paritytech/substrate-api-sidecar/commit/3eda2420ec752bbf5d9aeeb07ddd98b8856d5478))
- fix: staking payouts historicApi, and add tests [#762](https://github.com/paritytech/substrate-api-sidecar/pull/762)

## Compatibility

Tested against:
- Polkadot v9122
- Kusama v9122
- Westend v9122


## [11.3.0](https://github.com/paritytech/substrate-api-sidecar/compare/v11.2.0..v11.3.0) (2021-11-16)

**Upgrade priority**: Low

## Features

- feat: transition `/paras/*` off of `/experimental` ([#765](https://github.com/paritytech/substrate-api-sidecar/pull/765)) ([d63fa15](https://github.com/paritytech/substrate-api-sidecar/commit/d63fa1542cd67560d48416a2ba7b31c61f99f72e))
    - NOTE: The `/experimental/paras/*` endpoints are going to be left available too allow users time to transition. They are subject to removal in future releases.

## Bug Fixes

- fix: removed legacy pacakge-lock ([#763](https://github.com/paritytech/substrate-api-sidecar/pull/763)) ([a07dd7d](https://github.com/paritytech/substrate-api-sidecar/commit/a07dd7ddb41b607d4ba8b251895650ac8cc4d508))
- fix: bump polkadot-js deps ([#764](https://github.com/paritytech/substrate-api-sidecar/pull/764)) ([ceb8cba](https://github.com/paritytech/substrate-api-sidecar/commit/ceb8cbafaf31ea7fa522dba680e0dfa3e141f614))
- fix: update PalletsStakingProgressService to use historicApi ([#761](https://github.com/paritytech/substrate-api-sidecar/pull/761)) ([9e53d2a](https://github.com/paritytech/substrate-api-sidecar/commit/9e53d2a5289a8ef1e9e5c3c5b1d2f5e98d916d22))

## Compatibility

Tested against:
- Polkadot v9122
- Kusama v9122
- Westend v9122

## [11.2.0](https://github.com/paritytech/substrate-api-sidecar/compare/v11.1.2..v11.2.0) (2021-11-11)

Upgrade Priority: Medium (For users using the `/experimental/paras` endpoint)

## Features

- feat: add query param `metadata` for `/transaction/material` ([#746](https://github.com/paritytech/substrate-api-sidecar/pull/746)) ([273cac2](https://github.com/paritytech/substrate-api-sidecar/commit/273cac2ae7e9d7ff05a5a4146d4ce1ee5090e773))
    - Note: In future releases the query parameter `noMeta` will be deprecated, and then removed.

## Bug Fixes
- fix: update blockWeightStore for polkadot v9122 ([#755](https://github.com/paritytech/substrate-api-sidecar/pull/755)) ([2e43b05](https://github.com/paritytech/substrate-api-sidecar/commit/2e43b052d7f68ac78125712215d141916ca25664))
- fix: support calc fee for Karura Acala ([#754](https://github.com/paritytech/substrate-api-sidecar/pull/754)) ([42ae857](https://github.com/paritytech/substrate-api-sidecar/commit/42ae857630ef0153e0cbc1c4587b864fc75ca89c)) Contributed by [xlc](https://github.com/xlc)
- fix(ParasService): adjust endpoint to use historicApi, fix endingOffset bug, and leasePeriodIndex ([#735](https://github.com/paritytech/substrate-api-sidecar/pull/735)) ([ce2ff0b](https://github.com/paritytech/substrate-api-sidecar/commit/ce2ff0bfb1fb21207c0da92b2a7d92b5f262f5f3))
    - Note: In the next weekly release we will migrate off of `/experimental/paras` to `/paras`
- fix(e2e-tests): add kusama e2e tests for paras endpoint ([#736](https://github.com/paritytech/substrate-api-sidecar/pull/736)) ([54d0939](https://github.com/paritytech/substrate-api-sidecar/commit/54d09398af6fb2cfbd1264d199d99fc01dd6d251))
- fix(e2e-tests): update scripts to use `--log-level=http` ([#758](https://github.com/paritytech/substrate-api-sidecar/pull/758)) ([2e527d3](https://github.com/paritytech/substrate-api-sidecar/commit/2e527d349d01e685b4e1f9fcae8e13bd622b1f29))


## Compatibility

Tested against:
- Polkadot v9122
- Kusama v9122
- Westend v9122

## [11.1.2](https://github.com/paritytech/substrate-api-sidecar/compare/v11.1.1..v11.1.2) (2021-11-08)

**Upgrade priority**: Low (Performance increase via polkadot-js, and calamari-chain fee support)

### Bug Fixes

- fix: bump polkadot-js dependencies, and @substrate/calc ([#752](https://github.com/paritytech/substrate-api-sidecar/pull/752)) ([f01003d](https://github.com/paritytech/substrate-api-sidecar/commit/f01003d5fd063bb98478821782c62533a9f00cc6))
- fix: support calamari parachain fee calculations ([#749](https://github.com/paritytech/substrate-api-sidecar/pull/749))([1e2f4a5](https://github.com/paritytech/substrate-api-sidecar/commit/1e2f4a5ea946f109c8e8a604bf84f4f9c8b47ace))
- chore(release-calc): 0.2.4 ([#751](https://github.com/paritytech/substrate-api-sidecar/pull/751)) ([7f950c9](https://github.com/paritytech/substrate-api-sidecar/commit/7f950c9f890daa38b1c65ff20054219574bfe4f3))

### Compatibility:

Tested against:
- Polkadot v9122
- Kusama v9122
- Westend v9122

## [11.1.1](https://github.com/paritytech/substrate-api-sidecar/compare/v11.1.0..v11.1.1) (2021-11-04)

**Upgrade priority**: Low

### Bug Fixes

- fix: bump polkadot deps ([#745](https://github.com/paritytech/substrate-api-sidecar/pull/745)) ([8e62030](https://github.com/paritytech/substrate-api-sidecar/commit/8e62030566f079362c104ad3c24dafc07a17e9ca))
- fix: confirm session module before block retrieval ([#744](https://github.com/paritytech/substrate-api-sidecar/pull/744)) ([e6613a0](https://github.com/paritytech/substrate-api-sidecar/commit/e6613a0030ffefdb59a4ef219f881243840659f4))
- fix(e2e-tests): tests for staking-info endpoint ([#742](https://github.com/paritytech/substrate-api-sidecar/pull/742)) ([facc58c](https://github.com/paritytech/substrate-api-sidecar/commit/facc58c5a83b6ea44bca2aa1273cb627d9a8787b))
- fix: Update blockstore for westend and kusama ([#740](https://github.com/paritytech/substrate-api-sidecar/pull/740)) ([4686634](https://github.com/paritytech/substrate-api-sidecar/commit/4686634de3d862275d5362f8b60daab6d83bee1c))
- fix(StakingInfo): add historicApi to staking-info ([#741](https://github.com/paritytech/substrate-api-sidecar/pull/741)) ([bb679ed](https://github.com/paritytech/substrate-api-sidecar/commit/bb679ed255d6ee9d1a1451dda8dfbba0d8eb5a87))

### Optimizations
-fix: optimize pallets-storage ([#739](https://github.com/paritytech/substrate-api-sidecar/pull/739)) ([30d446](https://github.com/paritytech/substrate-api-sidecar/commit/30d4467146172eabdfaed2e6329f3545b662269a))

### Compatibility:

Tested against:
- Polkadot v9110
- Kusama v9122
- Westend v9122

## [11.1.0](https://github.com/paritytech/substrate-api-sidecar/compare/v11.1.0..v11.0.0) (2021-10-28)

**Upgrade priority**: Low

### Features

- feat: add /accounts/:address/validate endpoint ([#726](https://github.com/paritytech/substrate-api-sidecar/pull/726)) ([77bf8ed](https://github.com/paritytech/substrate-api-sidecar/commit/77bf8edb7c645dd5a6dd0d937ebad95c083ea2ed))

### Bug fixes

- fix: remove unnecessary awaits in pallets ([#729](https://github.com/paritytech/substrate-api-sidecar/pull/729)) ([f8f7cd5](https://github.com/paritytech/substrate-api-sidecar/commit/f8f7cd578da478bb1827733db055b4f4142b04c6))
- fix(security): ua-parser-js resolution for docs ([#733](https://github.com/paritytech/substrate-api-sidecar/pull/733)) ([8cfe930](https://github.com/paritytech/substrate-api-sidecar/commit/8cfe9305ce704da237792ae3ae5ddbb51294f9a5))
- fix(AccountsAssets): historicApi for AccountsAssets, bug fixes, error handling, e2e-tests ([#721](https://github.com/paritytech/substrate-api-sidecar/pull/721)) ([583936d](https://github.com/paritytech/substrate-api-sidecar/commit/583936d8c82fa3e956baa0747b3d4477c61b48e6))
- fix: bump polkadot-js deps, and substrate/dev ([#734](https://github.com/paritytech/substrate-api-sidecar/pull/734)) ([ac48534](https://github.com/paritytech/substrate-api-sidecar/commit/ac485346ff1fea0ee1dc03db1e460be540b71c86))
- fix(e2e-tests): add e2e-tests for /accounts/{accoundId}/validate ([#731](https://github.com/paritytech/substrate-api-sidecar/pull/731)) ([2f115b3](https://github.com/paritytech/substrate-api-sidecar/commit/2f115b35471110926efa6ea3d7f65d371e06430d))

### Compatibility:

Tested against:
- Polkadot v9110
- Kusama v9110
- Westend v9112

## [11.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v10.0.0..v11.0.0) (2021-10-20)

**Upgrade priority**: Medium (High for users leveraging `/accounts/{accountId}/vesting-info`)

### ⚠ BREAKING CHANGES ⚠

- fix: Support multiple vesting schedules, vesting-info now returns an array. ([#717](https://github.com/paritytech/substrate-api-sidecar/pull/717)) ([8b9866d](https://github.com/paritytech/substrate-api-sidecar/commit/8b9866d02ab4aa2ab22a19159a8c90a8ddfc9a1b))

### Bug Fixes

- fix: add v9111 runtime to the blockstore for westend ([#718](https://github.com/paritytech/substrate-api-sidecar/pull/718)) ([a8835c2](https://github.com/paritytech/substrate-api-sidecar/commit/a8835c273210ded0d7335793a04d6cdacea490c5))
- fix: bump polkadot js deps ([#720](https://github.com/paritytech/substrate-api-sidecar/pull/720)) ([5864465](https://github.com/paritytech/substrate-api-sidecar/commit/5864465f9a9c8fd2423935c2317457f2c3e1fe35))
- fix: update accounts balance-info and vesting-info to use historicApi ([#709](https://github.com/paritytech/substrate-api-sidecar/pull/709)) ([d527bbf](https://github.com/paritytech/substrate-api-sidecar/commit/d527bbfa2a93f792a64e5ee7bbaf50bbad732689))
- fix: update apps-config to get the latest substrate types ([#725](https://github.com/paritytech/substrate-api-sidecar/pull/725)) ([64f331e](https://github.com/paritytech/substrate-api-sidecar/commit/64f331e163658b5b148a51e9fa580db503bf6cf9))

### Compatibility

This version of Sidecar has been tested against:

- Polkadot v9110
- Kusama v9110

## [10.0.0](https://github.com/paritytech/substrate-api-sidecare/compare/v9.2.0..v10.0.0) (2021-10-13)

### ⚠ BREAKING CHANGES ⚠

- fix: update 'PalletStorageService' to use V14 Metadata. See release notes for further info. ([#710](https://github.com/paritytech/substrate-api-sidecar/pull/710)) ([199ddcf](https://github.com/paritytech/substrate-api-sidecar/commit/199ddcfc4c6a0b2ec10dedf9e1702293e1118288))

### Bug Fixes

- fix: add 9111 runtime for westend. ([#705](https://github.com/paritytech/substrate-api-sidecar/pull/705)) ([a51f4af](https://github.com/paritytech/substrate-api-sidecar/commit/a51f4afb2f0a7c9ae0273a30e79b47bee3d82dcf))
- fix: bump polkadot deps ([#707](https://github.com/paritytech/substrate-api-sidecar/pull/707)) ([b7335b7](https://github.com/paritytech/substrate-api-sidecar/commit/b7335b75e93b20bb0bf743cb84d5a126bfd5d28e))
- fix(BlocksService): refactor api.derive for performance, and add historicApi to BlocksService ([#699](https://github.com/paritytech/substrate-api-sidecar/pull/699)) ([5861cb1](https://github.com/paritytech/substrate-api-sidecar/commit/5861cb1ff094e4661e0cb8cab02018458b1daaa7))
- fix: update blockstores with 9110 runtime ([#704](https://github.com/paritytech/substrate-api-sidecar/pull/704)) ([35b7132](https://github.com/paritytech/substrate-api-sidecar/commit/35b7132cf14d165a6f2f14f20594cbdd9b52f9b8))
- fix: cleanup pallets docs, and naming ([#713](https://github.com/paritytech/substrate-api-sidecar/pull/713)) ([cc600d6](https://github.com/paritytech/substrate-api-sidecar/commit/cc600d674d05dd2384731d32f275e2e1f597ba06))

### Tests

- fix(tests): restructure mockApi tests to integrate with historical api. ([#702](https://github.com/paritytech/substrate-api-sidecar/pull/702)) ([2bf71ad](https://github.com/paritytech/substrate-api-sidecar/commit/2bf71ada39365a4f2f807c7d9644089736e0442d))
- fix(e2e-tests): add --log-level flag for e2e-tests ([#703](https://github.com/paritytech/substrate-api-sidecar/pull/703)) ([b9404ff](https://github.com/paritytech/substrate-api-sidecar/commit/b9404ff6aa3a889263f8d1cd3585c688e6e977b5))
- fix(e2e-tests): fix adjust values in some e2e tests ([#700](https://github.com/paritytech/substrate-api-sidecar/pull/700)) ([f52fac6](https://github.com/paritytech/substrate-api-sidecar/commit/f52fac61fb0f147e02020c37356ddd679a448d02))

## [9.2.0](https://github.com/paritytech/substrate-api-sidecare/compare/v9.1.11..v9.2.0) (2021-10-06)

### Bug Fixes

* fix: metadata V12 bug in `/pallets/{palletId}/storage`, and update with V13 ([#695](https://github.com/paritytech/substrate-api-sidecar/pull/695)) ([ac033ce](https://github.com/paritytech/substrate-api-sidecar/commit/ac033ce17fc58fc7b758be52ce67dd5069ccfa8b))
* fix: decorating metadata bug by now using an historicApi to attach historic registries when retrieving block weights for calculating fees ([#692](https://github.com/paritytech/substrate-api-sidecar/pull/692)) ([ed389a4](https://github.com/paritytech/substrate-api-sidecar/commit/ed389a4baac99662321d2cf88f00669f9d6ce53d))
* fix: bump `@polkadot/api` to v6.1.2, and cleanup the resolutions ([#691](https://github.com/paritytech/substrate-api-sidecar/pull/691)) ([2707ef4](https://github.com/paritytech/substrate-api-sidecar/commit/2707ef4d70bba9d95f560a7bad9d9df5e66d2c85))
* fix: refactor e2e tests to use `scriptsApi` ([#687](https://github.com/paritytech/substrate-api-sidecar/pull/687)) ([db18f02](https://github.com/paritytech/substrate-api-sidecar/commit/db18f020aec53df8603bf11fd04b2269113970fe))
* fix: add blockweights for the shiden network ([#688](https://github.com/paritytech/substrate-api-sidecar/pull/688)) ([701ecef](https://github.com/paritytech/substrate-api-sidecar/commit/701ecefa0de8a277e996846a976c4038265c8f9e)) Contributed by: [hoonsubin](https://github.com/hoonsubin)
* fix: bump `@substrate/calc` to v0.2.3 in order to update calculating fees for shiden block weights.

### CI

* ci(helm): increase liveness and rediness probe timeouts ([#686](https://github.com/paritytech/substrate-api-sidecar/pull/686)) ([1e744bf](https://github.com/paritytech/substrate-api-sidecar/commit/1e744bf3fd49237e1197680d2fcd28729cd094f6))
* ci: script for npm dry-run release checks ([#684](https://github.com/paritytech/substrate-api-sidecar/pull/684)) ([9936df1](https://github.com/paritytech/substrate-api-sidecar/commit/9936df1fcdea507cfc52a7443417277c042ff8aa))

### Features

* feat: add `era` field within extrinsics. Check the docs [here](https://paritytech.github.io/substrate-api-sidecar/dist/) and look under `GenericExtrinsicEra`. ([#685](https://github.com/paritytech/substrate-api-sidecar/pull/685)) ([4362347](https://github.com/paritytech/substrate-api-sidecar/commit/43623471913545d44ecea74e1411e4a1a740de53))

## [9.1.11](https://github.com/paritytech/substrate-api-sidecare/compare/v9.1.10..v9.1.11) (2021-09-27)

### Bug Fixes

* **types** Bump @polkadot/apps-config to fix npm build issue for @substrate/api-sidecar@9.1.10 ([#681](https://github.com/paritytech/substrate-api-sidecar/pull/681)) ([ece2075](https://github.com/paritytech/substrate-api-sidecar/commit/ece207593823bc061b0223b6968ef881b04f0c1c))

## [9.1.10](https://github.com/paritytech/substrate-api-sidecare/compare/v9.1.9..v9.1.10) (2021-09-23)

* **types** Bump @polkadot-js deps for the latest substrate based types. ([#677](https://github.com/paritytech/substrate-api-sidecar/pull/677)) ([f14f2c2](https://github.com/paritytech/substrate-api-sidecar/commit/f14f2c2ed9da295d31dfe63c7d89d4f8613ad0db))
* fix: resolution versioning ([#665](https://github.com/paritytech/substrate-api-sidecar/pull/665)) ([5b6d9b3](https://github.com/paritytech/substrate-api-sidecar/commit/5b6d9b3f2426f477080ad9d0a405cf8afb4552f3))
* fix: remove `--create-namespace` from Gitlab CI ([#666](https://github.com/paritytech/substrate-api-sidecar/pull/666)) ([86bb4d6](https://github.com/paritytech/substrate-api-sidecar/commit/86bb4d60c311725d8b6fb12d20b85fd95dfedef0))
* fix(docs): correct Chain Integration Guide link ([#668](https://github.com/paritytech/substrate-api-sidecar/pull/668)) ([5405710](https://github.com/paritytech/substrate-api-sidecar/commit/54057102ac7657e574563fb2af553a84d71c4e0f))
* fix(docs): Update versioning in docs ([#671](https://github.com/paritytech/substrate-api-sidecar/pull/671)) ([f4556ae](https://github.com/paritytech/substrate-api-sidecar/commit/f4556aec27a40910f02eacfd045279981645008e))
* fix: update readme for open api docs ([#672](https://github.com/paritytech/substrate-api-sidecar/pull/672))([770ba1d](https://github.com/paritytech/substrate-api-sidecar/commit/770ba1d5235a48f986febe2c440290adc15b01a4))
* tests(e2e): Add `spec`, `code`, `metadata` endpoints to Kusama, Polkadot and Westend e2e tests ([#674](https://github.com/paritytech/substrate-api-sidecar/pull/674)) ([ddb8e45](https://github.com/paritytech/substrate-api-sidecar/commit/ddb8e459acc4af31a0d28a391084f4a86ab01d06))
* ci: Add a test to build the docs in CI. ([#675](https://github.com/paritytech/substrate-api-sidecar/pull/675)) ([fcf60ee](https://github.com/paritytech/substrate-api-sidecar/commit/fcf60eec106d0ac267ed3c9cf7d86dbc0009a86c))


## [9.1.9](https://github.com/paritytech/substrate-api-sidecar/compare/v9.1.8..v9.1.9) (2021-09-13)

* **types**  Bump @polkadot-js/deps for the latest substrate based types. In particular, bump `@polkadot/apps-config` to the latest beta (`^0.95.2-114`) for compatibility reasons.
* fix: README link to FRAME ([660](https://github.com/paritytech/substrate-api-sidecar/pull/660)) ([5c304a2](https://github.com/paritytech/substrate-api-sidecar/commit/5c304a253ef4ef0cc43d3a98724631fe53bcc099))

## [9.1.8](https://github.com/paritytech/substrate-api-sidecar/compare/v9.1.7..v9.1.8) (2021-09-07)

* **types**  Bump @polkadot-js/deps for the latest substrate based types.
* fix: add accounts endpoints to the e2e tests ([#646](https://github.com/paritytech/substrate-api-sidecar/pull/646)) ([4d86a4a](https://github.com/paritytech/substrate-api-sidecar/commit/4d86a4ad9da9d037f51ca0b730f798b4d8f731c1))
* fix: workflows for wasm-pack ([#657](https://github.com/paritytech/substrate-api-sidecar/pull/657)) ([5723f108](https://github.com/paritytech/substrate-api-sidecar/commit/5723f1084040f5352a1be4ef8695bfc73da76c15))
* feat: add helm chart to the project ([#654](https://github.com/paritytech/substrate-api-sidecar/pull/654)) ([7a924ec3](https://github.com/paritytech/substrate-api-sidecar/commit/7a924ec319dec2ea807df0363610622ef8e8d3c6))

## [9.1.7](https://github.com/paritytech/substrate-api-sidecar/compare/v9.1.6..v9.1.7) (2021-09-02)

### Bug Fixes

* Update `/accounts/{accountId}/balance-info` to correctly query historical blocks. ([#653](https://github.com/paritytech/substrate-api-sidecar/pull/653))([e9d7d7b](https://github.com/paritytech/substrate-api-sidecar/commit/e9d7d7b66549aeb0ca134d00183a30bb151e1a03))

## [9.1.6](https://github.com/paritytech/substrate-api-sidecar/compare/v9.1.5..v9.1.6) (2021-08-30)

### Bug Fixes

* Bump @polkdot/api and @polkadot/apps-config to get the latest patch on proxy events, and receive latest chain specific types ([#650](https://github.com/paritytech/substrate-api-sidecar/pull/650))([0cfc6e9](https://github.com/paritytech/substrate-api-sidecar/commit/0cfc6e993cc8a1a2ab4955492832aeb490735dde)) Contribution by [joelamouche](https://github.com/joelamouche)
* Improve the security of the docker container ([#648](https://github.com/paritytech/substrate-api-sidecar/pull/648))([bca36aa](https://github.com/paritytech/substrate-api-sidecar/commit/bca36aa482b6f62d49696f8fcb88bc46ed81d343)) Contribution by [chevdor](https://github.com/chevdor)
* Update dev and non polkadot deps ([#647](https://github.com/paritytech/substrate-api-sidecar/pull/647))([e6ebda7](https://github.com/paritytech/substrate-api-sidecar/commit/e6ebda770fd14205125444ed8bb287a0c309c9ae)) Contribution by [chevdor](https://github.com/chevdor)

## [9.1.5](https://github.com/paritytech/substrate-api-sidecar/compare/v9.1.4..v9.1.5) (2021-08-23)

* **types**  Bump @polkadot-js/deps for the latest substrate based types.
* Add an LRU cache to the `/blocks/head`, and `/blocks/{blockId}` endpoints. ([#630](https://github.com/paritytech/substrate-api-sidecar/pull/630))([9f7a29f](https://github.com/paritytech/substrate-api-sidecar/commit/9f7a29f7bffd4ce225224234865d9c78d2b7f941))
* Bump Yarn ([#643](https://github.com/paritytech/substrate-api-sidecar/pull/643))([12c8fd7](https://github.com/paritytech/substrate-api-sidecar/commit/12c8fd7da686f91109871e9e1facffd71934600a))

### Bug Fixes

* Update the error message for parachain endpoints for when parachains are not supported ([#642](https://github.com/paritytech/substrate-api-sidecar/pull/642))([1f5f6b7](https://github.com/paritytech/substrate-api-sidecar/commit/1f5f6b7252bbdcd06010752265a252583a7661e8))

## [9.1.4](https://github.com/paritytech/substrate-api-sidecar/compare/v9.1.3..v9.1.4) (2021-08-19)

### Bug Fixes

* Update @polkadot/deps in order to fix decoding `ParachainsInherent` type.
* Update @polkadot/deps, and fix metadata imports and tests ([#637](https://github.com/paritytech/substrate-api-sidecar/pull/637))([c143107](https://github.com/paritytech/substrate-api-sidecar/commit/c14310762134fb7eb045d9859243a2204295e342))

### CI

* Remove the workaround of a buildah action bug ([#619](https://github.com/paritytech/substrate-api-sidecar/pull/619))([0562e07](https://github.com/paritytech/substrate-api-sidecar/commit/0562e07f2f0aef1c09748bfb456bbf2bded18d00))

## [9.1.3](https://github.com/paritytech/substrate-api-sidecar/compare/v9.1.2..v9.1.3) (2021-08-10)

* fix: substrate/dev dep, update changelog ([#632](https://github.com/paritytech/substrate-api-sidecar/pull/632)) ([8e8153f](https://github.com/paritytech/substrate-api-sidecar/commit/8e8153fac3dff037ba3de4678f511e064b9d7b74))
* fix: finalization for /blocks/head ([#631](https://github.com/paritytech/substrate-api-sidecar/pull/631)) ([8d0d538](https://github.com/paritytech/substrate-api-sidecar/commit/8d0d53831326f061dce9d111c3f16fd4084afc9b))
* docs(ChainType): fix docs for chaintype return value ([#626](https://github.com/paritytech/substrate-api-sidecar/pull/626)) ([f20b033](https://github.com/paritytech/substrate-api-sidecar/commit/f20b033d51f0e84bf869f056addd00db4c313f68))

## [9.1.2](https://github.com/paritytech/substrate-api-sidecar/compare/v9.1.1..v9.1.2) (2021-08-02)

### Bug Fixes

* Patch global package binary

## [9.1.1](https://github.com/paritytech/substrate-api-sidecar/compare/v9.1.0..v9.1.1) (2021-08-02)

* fix: add --version flag ([#620](https://github.com/paritytech/substrate-api-sidecar/pull/620)) ([9d8bb98](https://github.com/paritytech/substrate-api-sidecar/commit/9d8bb98e68c4b3a563b0613557662ebee063ccb1))
* fix: Added SORA network controller ([#625](https://github.com/paritytech/substrate-api-sidecar/pull/625)) ([f1511c4](https://github.com/paritytech/substrate-api-sidecar/commit/f1511c4fcfc069b1c173e2e80bd4d413bea6ea05))
* docs: alphabetical order for schema types ([#623](https://github.com/paritytech/substrate-api-sidecar/pull/623)) ([d4258e0](https://github.com/paritytech/substrate-api-sidecar/commit/d4258e04a572553d78d7ba1a895824a898104e73))
* Update @polkadot/api to get the latest substrate specific upgrades.
* Update @polkadot/apps-config to get latest chain specific upgrades.

## [9.1.0](https://github.com/paritytech/substrate-api-sidecar/compare/v9.0.0..v9.1.0) (2021-07-27)

* feat: add /blocks/:number/header, and /blocks/head/header ([615](https://github.com/paritytech/substrate-api-sidecar/pull/615)) ([b7c2818](https://github.com/paritytech/substrate-api-sidecar/commit/b7c2818c57718526265f8104d9979a3cca127e3e))
* feat: Basic support for H160 and H256 accounts. ([596](https://github.com/paritytech/substrate-api-sidecar/pull/596)) ([bddc2a2](https://github.com/paritytech/substrate-api-sidecar/commit/bddc2a28c0477126a5aea4418188dedbf483e6d6))
* Update @polkadot/api to get the latest substrate specific upgrades.

### Bug Fixes

* fix: rewrite sidecar e2e script ([618](https://github.com/paritytech/substrate-api-sidecar/pull/618)) ([423574e](https://github.com/paritytech/substrate-api-sidecar/commit/423574e5db9828be6bb3f7721302829b1cd0661c))

## [9.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v8.0.4..v9.0.0) (2021-07-20)

### ⚠ BREAKING CHANGES

To reflect changes in `@polkadot/api@5.1.1` changes have been made to 2 of the endpoints specifically, and 1 implicitly ([#616](https://github.com/paritytech/substrate-api-sidecar/pull/616)) ([7942cd3](https://github.com/paritytech/substrate-api-sidecar/commit/7942cd3323dc48fca55414c8f4d553acacf3631f)).

1. `/pallets/{palletId}/storage`
    The `documentation` field under each item in the `items` field will now be `docs`.

2. `/pallets/{palletId}/storage/{storageItemId}`
    The `documentation` field under each item in the `items` field will now be `docs`.

3. `/runtime/metadata`
    Similar to the above the metadata returned here just follows the most up to date metadata in polkadot-js so this route will
    implicitly have the same result as above.

### Bug Fixes

* fix: support for calculating fees for statemint, and statemine and their test nets. ([613](https://github.com/paritytech/substrate-api-sidecar/pull/613)) ([cea7c36](https://github.com/paritytech/substrate-api-sidecar/commit/cea7c3636f8b1ea0cc89f4dbdfb6580583e5be1e))

## [8.0.4](https://github.com/paritytech/substrate-api-sidecar/compare/v8.0.3..v8.0.4) (2021-07-14)

* Update @polkadot/apps-config to get latest chain specific upgrades, and add resolutions in line with those from polkadot-js to avoid issues duplicate package versions ([#607](https://github.com/paritytech/substrate-api-sidecar/pull/607)) ([86f99c2](https://github.com/paritytech/substrate-api-sidecar/commit/86f99c2a1353e06ac21544aee18626121282e353))

## [8.0.3](https://github.com/paritytech/substrate-api-sidecar/compare/v8.0.2..v8.0.3) (2021-07-13)

* Updates to address the breaking changes that @polkadot/api@5.0.1 introduces for metadata (no breaking changes to the API introduced in this). ([#603](https://github.com/paritytech/substrate-api-sidecar/pull/603)) ([9fface1](https://github.com/paritytech/substrate-api-sidecar/commit/9fface10a4b36aa433229d42ead54288dcd16332))
* Update types for Dock ([#600](https://github.com/paritytech/substrate-api-sidecar/pull/600)) ([0300941](https://github.com/paritytech/substrate-api-sidecar/commit/0300941858eb2cf7b52f8d05af876db2f3e6cf11))

## [8.0.2](https://github.com/paritytech/substrate-api-sidecar/compare/v8.0.1..v8.0.2) (2021-07-07)

### Bug Fixes

* Update @polkadot/apps-config to get latest chain specific upgrades.

## [8.0.1](https://github.com/paritytech/substrate-api-sidecar/compare/v8.0.0..v8.0.1) (2021-07-06)

* Update @polkadot/api to get the latest substrate specific upgrades.

* Update @polkadot/apps-config to get latest chain specific upgrades.


## [8.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v7.0.5..v8.0.0) (2021-07-01)

### ⚠ BREAKING CHANGES

* Update `/experimental/paras/auctions/current` to correctly reflect the newly added `AuctionStatus` enum in polkadot. The `phase` field
within the response will now return either `startPeriod`, `endPeriod`, or `vrfDelay`. ([#593](https://github.com/paritytech/substrate-api-sidecar/pull/593)) ([b4d8662](https://github.com/paritytech/substrate-api-sidecar/commit/b4d86620874b3d49d77d23b89d74fa5d131da65b))

### Chore

* Update the cached runtime versions for Polkadot and Kusama chain configs with the most recent versions. ([#592](https://github.com/paritytech/substrate-api-sidecar/pull/592)) ([4e42877](https://github.com/paritytech/substrate-api-sidecar/commit/4e428775b1bf71f9c6bab05d8639da512212d2c2)).


## [7.0.5](https://github.com/paritytech/substrate-api-sidecar/compare/v7.0.4..v7.0.5) (2021-06-27)

### Bug Fixes

* **types**  Bump polkadot-js/api to decode `electionProviderMultiPhase`.

## [7.0.4](https://github.com/paritytech/substrate-api-sidecar/compare/v7.0.3..v7.0.4) (2021-06-23)

### Bug Fixes

* Fix: fee calculation bug with ancient runtimes ([#587](https://github.com/paritytech/substrate-api-sidecar/pull/587))

### Docs

* Extracting winners from a closed auction guide ([#577](https://github.com/paritytech/substrate-api-sidecar/pull/577))

## [7.0.3](https://github.com/paritytech/substrate-api-sidecar/compare/v7.0.2..v7.0.3) (2021-06-21)

### Bug Fixes

* Fix: update dependencies.

## [7.0.2](https://github.com/paritytech/substrate-api-sidecar/compare/v7.0.1..v7.0.2) (2021-06-14)

### Bug Fixes

* Fix: update deps, reconfigure tests to reflect most recent polkadot-js changes ([#584](https://github.com/paritytech/substrate-api-sidecar/pull/584))

## [7.0.1](https://github.com/paritytech/substrate-api-sidecar/compare/v7.0.0..v7.0.1) (2021-06-07)

### Bug Fixes

* Fix: Update deps, add westmint, and westmine ([#575](https://github.com/paritytech/substrate-api-sidecar/pull/575)) ([8c53b44](https://github.com/paritytech/substrate-api-sidecar/commit/8c53b44550570b8345c55393771d89bfaf6815d7))

* Fix: Remove assets endpoint from chains config for relay chains. Add statemint, and statemine ([#573](https://github.com/paritytech/substrate-api-sidecar/pull/573)) ([0878a3c](https://github.com/paritytech/substrate-api-sidecar/commit/0878a3caf80434e740f8827b6ba5d1553b707160))

## [7.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v6.2.3...v7.0.0) (2021-05-31)


### ⚠ BREAKING CHANGES

* Changes the fields `firstSlot` and `lastSlot` to `firstPeriod` and `lastPeriod` within the `FundInfo` type to match the type generated from `@polkadot/api`. This effects the `/experimental/paras/:paraId/crowdloans-info` endpoint. ([#570](https://github.com/paritytech/substrate-api-sidecar/pull/570/files)) ([0c73631](https://github.com/paritytech/substrate-api-sidecar/commit/3312b73e9b2348484984ea55a61a94713bad90e3))

### Bug Fixes

**test** Turns runtime tests into e2e tests. ([#561](https://github.com/paritytech/substrate-api-sidecar/pull/561/files)) ([0c73631](https://github.com/paritytech/substrate-api-sidecar/commit/0c73631cd1c1f7fd1f2d6d5d95d29994c1371979))

### Types

* Bump @polkadot/api. ([#570](https://github.com/paritytech/substrate-api-sidecar/pull/570/files)) ([0c73631](https://github.com/paritytech/substrate-api-sidecar/commit/3312b73e9b2348484984ea55a61a94713bad90e3))

## [6.2.3](https://github.com/paritytech/substrate-api-sidecar/compare/v6.2.2...v6.2.3) (2021-05-27)


NOTE: No changes or fixes to the API for this release. v6.2.3 is a replacement for v6.2.2 due to an error during the NPM release process when it comes to pulling the `@substrate/api-sidecar` package from NPM. Please see v6.2.2 changelog for the most recent updates.

## [6.2.2](https://github.com/paritytech/substrate-api-sidecar/compare/v6.2.1...v6.2.2) (2021-05-27)


### Features

* Support for Polymesh blockchain ([#563](https://github.com/paritytech/substrate-api-sidecar/pull/563/files)) ([45945fe](https://github.com/paritytech/substrate-api-sidecar/commit/45945fee178fa683c25d887d8d5574e8c4186aeb))

### Bug Fixes

* **docs** Update release docs to use yarn dedupe, fix util-crypto packaging ([#565](https://github.com/paritytech/substrate-api-sidecar/pull/565)) ([87a828f](https://github.com/paritytech/substrate-api-sidecar/commit/87a828fe05ca4b8baa0f6b895d872ef3e4e87f57))


## [6.2.1](https://github.com/paritytech/substrate-api-sidecar/compare/v6.2.0...v6.2.1) (2021-05-24)


### Bug Fixes

* **types**  Asset approval parameter change, bump polkadot-js/api ([#559](https://github.com/paritytech/substrate-api-sidecar/pull/559)) ([c523244](https://github.com/paritytech/substrate-api-sidecar/commit/c5232442ad531c5d4c3a0253adcf3d2696a86d11))

* **test**  Integrate runtime-tests as a helper library ([#549](https://github.com/paritytech/substrate-api-sidecar/pull/549)) ([ea904f3](https://github.com/paritytech/substrate-api-sidecar/commit/ea904f3fd431fbdbf92e8b66e6fe271dd8017f79))

* **docs**  Update controller config in the chain integration guide ([#556](https://github.com/paritytech/substrate-api-sidecar/pull/556)) ([3ae0c3f](https://github.com/paritytech/substrate-api-sidecar/commit/3ae0c3f75d12eee2c78f7a520b1371e4b6d2b0bc))

* Reduce controller config boilerplate ([#555](https://github.com/paritytech/substrate-api-sidecar/pull/555)) ([59795b3](https://github.com/paritytech/substrate-api-sidecar/commit/59795b3684b2ef7a6cc79dd377d1884dd195a729))

## [6.2.0](https://github.com/paritytech/substrate-api-sidecar/compare/v6.1.0...v6.2.0) (2021-05-16)


### Features

* State tracing for balance reconciliation ([#383](https://github.com/paritytech/substrate-api-sidecar/pull/383)) ([bf47b11](https://github.com/paritytech/substrate-api-sidecar/commit/bf47b11cdbbe4e40c147878243c11c99b77f3a9d))

### Bug Fixes

* **types**  Bump polkadot-js/api to decode CompactSolution for 24 noms ([#553](https://github.com/paritytech/substrate-api-sidecar/pull/553)) ([c67ae2f](https://github.com/paritytech/substrate-api-sidecar/commit/c67ae2fc400130ec2908e57b1ddb0b4935cb3659))

## [6.1.0](https://github.com/paritytech/substrate-api-sidecar/compare/v6.0.0...v6.1.0) (2021-05-11)


### Features

* Add `Asset` specific endpoints to `/accounts` and `/pallets` in order to query `Asset` based information from Statemint(polkadot) and Statemine(kusama) Parachains. ([#533](https://github.com/paritytech/substrate-api-sidecar/pull/533)) ([e83bc7e](https://github.com/paritytech/substrate-api-sidecar/commit/e83bc7e663f92f37982906efa3feb90fb2cfcf32))

* Add support for the KILT chain. Contribution by [Dudleyneedham](https://github.com/Dudleyneedham). ([#542](https://github.com/paritytech/substrate-api-sidecar/pull/542)) ([01ae7ac](https://github.com/paritytech/substrate-api-sidecar/commit/01ae7ac1cbcb06cd76d6895bf9ccbe98e99f0d43))

### Bug Fixes

* **docs** Improve release build & process instructions ([#540](https://github.com/paritytech/substrate-api-sidecar/pull/540)) ([ea5b40e](https://github.com/paritytech/substrate-api-sidecar/commit/ea5b40e7edb8ebffa3bf487a2f96d960e8f94a56))

## [6.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v5.0.1...v6.0.0) (2021-05-03)


### ⚠ BREAKING CHANGES

* Changes to serialization of `ConsensusEngineId` in block digest logs. Check spec diffs for details. (#535)

### Types

* Bump @polkadot/api for the latest parachain support. ([#535](https://github.com/paritytech/substrate-api-sidecar/pull/535)) ([`7b96c21`](https://github.com/paritytech/substrate-api-sidecar/commit/7b96c211c3f47c1284628b6fa20cd591d4a1c95a))


## [5.0.1](https://github.com/paritytech/substrate-api-sidecar/compare/v5.0.0...v5.0.1) (2021-05-03)


### Bug Fixes

* docs: update release and publishing instructions ([#529](https://github.com/paritytech/substrate-api-sidecar/pull/529)) ([da33c7f](https://github.com/paritytech/substrate-api-sidecar/commit/da33c7f3a5ab1c0f1c96129736ffbe3285d25573))

* fix: readme docs for node version 14 ([#526](https://github.com/paritytech/substrate-api-sidecar/pull/526)) ([409b611](https://github.com/paritytech/substrate-api-sidecar/commit/409b611d81b6d65c2424b00e4e290d6241ee96f6))

* fix: remove dependabot and add upgrade-interactive plugin ([#531](https://github.com/paritytech/substrate-api-sidecar/pull/531)) ([f22cf3f](https://github.com/paritytech/substrate-api-sidecar/commit/f22cf3ff6ae292144018821fbaa0c21d6f96490d))

* deps: update @polkadot/api for the latest parachain support.

* deps: Update @polkadot/apps-config to get latest chain specific upgrades.

* deps: update @http/errors 1.8.0


## [5.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v4.0.8...v5.0.0) (2021-04-26)


### ⚠ BREAKING CHANGES

* Update the required node version as >= 14.0.0. This is to reflect the most recent updates with @polkadot/api ([#521](https://github.com/paritytech/substrate-api-sidecar/pull/521)) ([f50431c](https://github.com/paritytech/substrate-api-sidecar/commit/f50431c271ceea689a41d5c5f0aa11cd9f41321d))

### Bug Fixes

* Update @polkadot/api to get the latest substrate specific upgrades.

* Update @polkadot/apps-config to get latest chain specific upgrades.

## [4.0.8](https://github.com/paritytech/substrate-api-sidecar/compare/v4.0.7...v4.0.8) (2021-04-21)


### Experimental Feature

* **PLO endpoints** Adds a set of endpoint's in order to query information regarding parachains, parathreads, and the parachain lease offering (PLO) system. These endpoints are marked as experimental because we may break their APIs without bumping this service's major version. Expect changes as polkadot's PLO system develops. ([#509](https://github.com/paritytech/substrate-api-sidecar/pull/509))([1fa4f94](https://github.com/paritytech/substrate-api-sidecar/commit/1fa4f94e5a635256f06392b71d5d75e80533351f))

    * `/experimental/paras/`
    * `/experimental/paras/crowdloans`
    * `/experimental/paras/:paraId/crowdloan-info`
    * `/experimental/paras/:paraId/lease-info`
    * `/experimental/paras/leases/current`
    * `/experimental/paras/auctions/current`

    Please see the docs [here](https://paritytech.github.io/substrate-api-sidecar/dist/) for more information

## [4.0.7](https://github.com/paritytech/substrate-api-sidecar/compare/v4.0.6...v4.0.7) (2021-04-19)


### Bug Fixes

* Update @polkadot/api to get the corrected Kusama/Polkadot runtime 30 session key definitions

* Update @polkadot/apps-config to get latest chain specific upgrades

## [4.0.6](https://github.com/paritytech/substrate-api-sidecar/compare/v4.0.5...v4.0.6) (2021-04-12)


### Bug Fixes

* **types** Update @polkadot/api to get latest substrate types for Parachains

* **types** Update @polkadot/apps-config to get latest chain specific types

* Add Dock Mainnet weight's to Metadata Consts ([#511](https://github.com/paritytech/substrate-api-sidecar/pull/511)) ([7b7451d](https://github.com/paritytech/substrate-api-sidecar/commit/7b7451d1ec61f1f8cf20f4d2543f29a92d6ebbed))

### CI

* Update docker publish realease container to workaround the buildas gha bug ([#506](https://github.com/paritytech/substrate-api-sidecar/pull/506)) ([6294925](https://github.com/paritytech/substrate-api-sidecar/commit/6294925d229208ed6fa755721ee99a81396e4fb6))

## [4.0.5](https://github.com/paritytech/substrate-api-sidecar/compare/v4.0.4...v4.0.5) (2021-04-05)


### Bug Fixes

* **types** Update @polkadot/api to get latest substrate types for `MultiLocation`

* **types** Update @polkadot/apps-config to get latest chain specific types

* Add a defensive check in `createCalcFee` to make sure `weightToFee` is not mapped over when it is undefined ([#501](https://github.com/paritytech/substrate-api-sidecar/pull/501)) ([8347b67](https://github.com/paritytech/substrate-api-sidecar/commit/8347b67fde64985f50d8eeae508941a4e5397842))

## [4.0.4](https://github.com/paritytech/substrate-api-sidecar/compare/v4.0.3...v4.0.4) (2021-03-29)


### Bug Fixes

* Removes a stray console log that made its way into the npm build of v4.0.3. Otherwise read v4.0.3 to see the most recent updates

## [4.0.3](https://github.com/paritytech/substrate-api-sidecar/compare/v4.0.2...v4.0.3) (2021-03-29)


### Optimizations

* Refactor the `ControllerConfigs`, and `BlocksService` to store/cache relevant weight fee calculation data in order to optimize `expandMetadata` calls. The design will now allow chains to store their relevant weight data inside of `metadata-consts` but is not required. This fixes a regression seen in this [commit](https://github.com/paritytech/substrate-api-sidecar/commit/5ec24e63d571eaf348eb58053ccc8a7054276bd0). ([#478](https://github.com/paritytech/substrate-api-sidecar/pull/478)) ([610db42](https://github.com/paritytech/substrate-api-sidecar/commit/610db42001b97131afe9ec917d2f7942e78483a1))

### Bug Fixes

* **types** Update @polkadot/api to get latest substrate `ParaInfo` type update ([#496](https://github.com/paritytech/substrate-api-sidecar/pull/496)) ([d566e31](https://github.com/paritytech/substrate-api-sidecar/commit/d566e31ae775459807a74db390a07372ca09dae8))
* **types** Update @polkadot/apps-config to get latest chain specific types ([#497](https://github.com/paritytech/substrate-api-sidecar/pull/497)) ([6e58b51](https://github.com/paritytech/substrate-api-sidecar/commit/6e58b517dee4acd425d7ca2d6916a14073271a10))
* Reconfigure `eraElectionStatus` inside `PalletsStakingProgressService`  to continue to work with parachains and older runtimes as it will be deprecated with the upcoming runtime v30 ([#485](https://github.com/paritytech/substrate-api-sidecar/pull/485)) ([415f030](https://github.com/paritytech/substrate-api-sidecar/commit/415f0302b05aeac013c93227ac19e4928427206a))

## [4.0.2](https://github.com/paritytech/substrate-api-sidecar/compare/v4.0.1...v4.0.2) (2021-03-22)


### Bug Fixes

* **types** Update @polkadot/api to get latest substrate types for `Extender{Header, SignedBlock}`, and updated metadata
* **types** Update @polkadot/apps-config to get latest chain specific types

### Packaging

* **build** Update all configuration packages to pull from a universal config `@substrate/dev` ([#472](https://github.com/paritytech/substrate-api-sidecar/pull/472))([68db176](https://github.com/paritytech/substrate-api-sidecar/commit/68db1763981ae259851c791f2eeaedef0e09cacf))

## [4.0.1](https://github.com/paritytech/substrate-api-sidecar/compare/v4.0.0...v4.0.1) (2021-03-15)


### Bug Fixes

* **types** Update @polkadot/api to get latest substrate types for crowdloans ([#474](https://github.com/paritytech/substrate-api-sidecar/pull/474))([91f7dfa](https://github.com/paritytech/substrate-api-sidecar/commit/91f7dfad2df11ace4604dbceb2755b7d7a5a2670))
* **types** Update @polkadot/apps-config to get latest substrate types for crowdloans ([#473](https://github.com/paritytech/substrate-api-sidecar/pull/473)) ([dfeec8c](https://github.com/paritytech/substrate-api-sidecar/commit/dfeec8cb0d7e3375147ac3e46f9cdc501dd76b5c))

### CI

* Update release-container for tags list ([#470](https://github.com/paritytech/substrate-api-sidecar/pull/470)) ([8c9bbe9](https://github.com/paritytech/substrate-api-sidecar/commit/8c9bbe99155f9c78898cf5bc385768387528e1bf))

## [4.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v3.0.5...v4.0.0) (2021-03-10)


### ⚠ BREAKING CHANGES

* Enums in responses serialize with [camelCase variants](polkadot-js/api#3024). Check spec diffs for details (#467)

### Features

* **types** camelCase enum serialization; Bump polkadot/api@v4 w. ESM ([#467](https://github.com/paritytech/substrate-api-sidecar/pull/467)) ([179642b](https://github.com/paritytech/substrate-api-sidecar/commit/179642b38057a8eecf5bb74dd33d26d48d55aaaf))

### Bug Fixes

* **types** Update @polkadot/apps-config to get latest chain specific types ([#463](https://github.com/paritytech/substrate-api-sidecar/pull/463)) ([8357b33](https://github.com/paritytech/substrate-api-sidecar/commit/8357b33ca3cc5809d2a7025ec2f9089ae3dade2c))

### CI

* Optimize buildah build x2 ([#452](https://github.com/paritytech/substrate-api-sidecar/pull/452)) ([3dada4f](https://github.com/paritytech/substrate-api-sidecar/commit/3dada4f0e6728700cf35e8d96a7ff9df2b2ae84f))

## [3.0.5](https://github.com/paritytech/substrate-api-sidecar/compare/v3.0.4...v3.0.5) (2021-03-01)


### Bug Fixes

* **types:** Update @polkadot/api to get latest substrate types ([#449](https://github.com/paritytech/substrate-api-sidecar/pull/449)) ([6120dca](https://github.com/paritytech/substrate-api-sidecar/commit/6120dca252f10e14ff7d1df287a9f9bfbacfc7b4))
* **types:** Update @polkadot/apps-config to get latest chain specific types ([#451](https://github.com/paritytech/substrate-api-sidecar/pull/451)) ([226bbc0](https://github.com/paritytech/substrate-api-sidecar/commit/226bbc0f76084c021cab52151d572922c1c470ec))

## [3.0.4](https://github.com/paritytech/substrate-api-sidecar/compare/v3.0.3...v3.0.4) (2021-02-23)


### Bug Fixes

* **types:** Update @polkadot/api to get latest fixes for polkadot 0.8.28 ([#446](https://github.com/paritytech/substrate-api-sidecar/pull/446)) ([67302ff](https://github.com/paritytech/substrate-api-sidecar/commit/67302ff2c2fc7deb5d2c340263958db9cce6de58))

## [3.0.3](https://github.com/paritytech/substrate-api-sidecar/compare/v3.0.2...v3.0.3) (2021-02-15)


### Bug Fixes

* **types:** Update @polkadot/{apps-config, api} to get latest type definitions ([#434](https://github.com/paritytech/substrate-api-sidecar/pull/434)) ([e02818f](https://github.com/paritytech/substrate-api-sidecar/commit/e02818ffda38f4831c23a41894ea0eb1f329f14d))

## [3.0.2](https://github.com/paritytech/substrate-api-sidecar/compare/v3.0.1...v3.0.2) (2021-02-09)


### Bug Fixes

* discriminate `extrinsic_base_weight` based on dispatch class ([#414](https://github.com/paritytech/substrate-api-sidecar/pull/414)) ([ff98c76](https://github.com/paritytech/substrate-api-sidecar/commit/ff98c7626659612773f086e8d4bfaf91b2a4e44b))

## [3.0.1](https://github.com/paritytech/substrate-api-sidecar/compare/v3.0.0...v3.0.1) (2021-02-02)


### Bug Fixes

* **types:** Bump polkadot-js/api to so we have type definitions for runtimes associated with polkadot 0.8.28 ([#410](https://github.com/paritytech/substrate-api-sidecar/pull/410)) ([6a1cd8b](https://github.com/paritytech/substrate-api-sidecar/commit/6a1cd8b030f09f5ea2e7baa82cbc64fc28a76f4a))

## [3.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v2.1.2...v3.0.0) (2021-01-27)


### ⚠ BREAKING CHANGES

* Update polkadot-js/api and account for chainProperties updates (#402)
* Type definition specification with env vars and JSON files (#399)

### Features

* Type definition specification with env vars and JSON files ([#399](https://github.com/paritytech/substrate-api-sidecar/pull/399)) ([8c621b0](https://github.com/paritytech/substrate-api-sidecar/commit/8c621b0874de88a59eaafa81a9ebb9d1856fff77))
* Add finalized tag when querying blocks ([#386](https://github.com/paritytech/substrate-api-sidecar/pull/386)) ([b95f913](https://github.com/paritytech/substrate-api-sidecar/commit/b95f9131ea249638a62f3f5dba8b82ee6ee95c0e))
* Add route /blocks/{blockId}/extrinsics/{extrinsicIndex} ([#400](https://github.com/paritytech/substrate-api-sidecar/pull/400)) ([6507ce7](https://github.com/paritytech/substrate-api-sidecar/commit/6507ce70ff458281d1a2e31b58716e20ad8183dc))

### Bug Fixes

* Update polkadot-js/api and account for chainProperties updates ([#402](https://github.com/paritytech/substrate-api-sidecar/pull/402)) ([37acc7e](https://github.com/paritytech/substrate-api-sidecar/commit/37acc7e93137de486fce67c5d872c9dc7038fafe))

### CI

* Build container on release ([#396](https://github.com/paritytech/substrate-api-sidecar/pull/396)) ([ed52edd](https://github.com/paritytech/substrate-api-sidecar/commit/ed52edd227dd7ec1f3d5570b3288287c46950b52))
* Pre-release dependabot ([#401](https://github.com/paritytech/substrate-api-sidecar/pull/401)) ([5390aa7](https://github.com/paritytech/substrate-api-sidecar/commit/5390aa749688f3dcaa195b7a92d03a28d8625a43))

## [2.1.2](https://github.com/paritytech/substrate-api-sidecar/compare/v2.1.1...v2.1.2) (2021-01-18)


**Upgrade priority**: High; this version is required for Polkadot 27, Kusama 2027, and Westend 47. This release ensures correct fee calculations and decoding of all blocks in the aforementioned runtimes.

### Bug Fixes

* fix: Use correct registry when creating calls; Remove usage of derive.chain.getBlock ([#391](https://github.com/paritytech/substrate-api-sidecar/pull/391)) ([f961cae](https://github.com/paritytech/substrate-api-sidecar/commit/f961cae0544e2fef17f7fe8b0903a5c8ad596ea6))
* fix: Revert stack limit increase and use updated polkadot-js/api instead ([#394](https://github.com/paritytech/substrate-api-sidecar/pull/394)) ([bcd6b40](https://github.com/paritytech/substrate-api-sidecar/commit/bcd6b40af41f5b703aa7deed0b877757783c3294))
* fix: Update fee calc to use `system::constants::BlockWeights.per_class.normal.base_extrinsic` ([#388](https://github.com/paritytech/substrate-api-sidecar/pull/388)) ([5ec24e6](https://github.com/paritytech/substrate-api-sidecar/commit/5ec24e63d571eaf348eb58053ccc8a7054276bd0))

## [2.1.1](https://github.com/paritytech/substrate-api-sidecar/compare/v2.1.0...v2.1.1) (2021-01-07)


### Optimizations

* refactor: Optimize `accounts/{accountId}/staking-payouts` blocking query complexity ([#372](https://github.com/paritytech/substrate-api-sidecar/pull/372)) ([b3cbf61](https://github.com/paritytech/substrate-api-sidecar/commit/b3cbf61688fbee0557f7b82733c7c107c91e3513))

### Bug Fixes

* Account for polkadot-js changes; Harden `createCalcFee` ([#376](https://github.com/paritytech/substrate-api-sidecar/issues/376)) ([fdee04c](https://github.com/paritytech/substrate-api-sidecar/commit/fdee04c6f5a3a8ff309fed5ca7f16a0c65c24576))

## [2.1.0](https://github.com/paritytech/substrate-api-sidecar/compare/v2.0.0...v2.1.0) (2020-12-18)


### Features

* chainSpec based controller config; Types from apps-config ([#351](https://github.com/paritytech/substrate-api-sidecar/issues/351)) ([5936a1c](https://github.com/paritytech/substrate-api-sidecar/commit/5936a1c9907d0a2add8c3265121a8f66d20a62f2))
* Impl `/pallets/{pallets}/storage`; Impl index lookup for `/pallets/{palletId}/storage/{, storageItemId}` ([#356](https://github.com/paritytech/substrate-api-sidecar/issues/356)) ([a8387df](https://github.com/paritytech/substrate-api-sidecar/commit/a8387dfbbcc8ce3df68a7768643e1a5e2202148e))
* Support Dock's multiplier & add Dock controller config ([#365](https://github.com/paritytech/substrate-api-sidecar/issues/365)) ([fb5df84](https://github.com/paritytech/substrate-api-sidecar/commit/fb5df845881a2364df7afa4da14f44dddd947083))


### Bug Fixes

* **env:** typo SAS_EXPRESS_BIND_PORT -> SAS_EXPRESS_PORT in .env.docker ([#364](https://github.com/paritytech/substrate-api-sidecar/issues/364)) ([8cbafea](https://github.com/paritytech/substrate-api-sidecar/commit/8cbafea9edb9ee5c1e69eb4b9cc906603b5dffc4))
* Bump polkadot-js and adjust imports; Update specs ([#344](https://github.com/paritytech/substrate-api-sidecar/issues/344)) ([eeea29b](https://github.com/paritytech/substrate-api-sidecar/commit/eeea29b74ef50eb45356e4a7e1ea04344097cc00))
* Catch errors decoding opaque calls ([#347](https://github.com/paritytech/substrate-api-sidecar/issues/347)) ([d128e54](https://github.com/paritytech/substrate-api-sidecar/commit/d128e54133e1b14c883b68c967b7fa1806f60b2e))
* Use http BadRequest (400) when balance-info not found ([#355](https://github.com/paritytech/substrate-api-sidecar/issues/355)) ([c2a4937](https://github.com/paritytech/substrate-api-sidecar/commit/c2a4937ac5a67f71c89e49ea0237fda01000d217))

## [2.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v1.0.0...v2.0.0) (2020-11-19)


### ⚠ BREAKING CHANGES

* Bump polkadot-js and document runtime/metadata API regression (#338)

### Features

* Bump polkadot-js and document runtime/metadata API regression ([#338](https://github.com/paritytech/substrate-api-sidecar/issues/338)) ([effc5eb](https://github.com/paritytech/substrate-api-sidecar/commit/effc5eb159587b2b3c333f0f545b8a3fe793c789)). [Regression diff;](https://github.com/paritytech/substrate-api-sidecar/pull/338/files#diff-78b11c394fc7a8f9c96da1c99dff8d40d78af87d7b40102165467fa34b95977eL1001) removes polkadot-js type aliases from metadata.


### Bug Fixes

* Bump polkadot-js and adjust imports; Update specs ([#344](https://github.com/paritytech/substrate-api-sidecar/issues/344)) ([eeea29b](https://github.com/paritytech/substrate-api-sidecar/commit/eeea29b74ef50eb45356e4a7e1ea04344097cc00))

## [1.0.0](https://github.com/paritytech/substrate-api-sidecar/compare/v1.0.0-rc4...v1.0.0) (2020-10-23)


### ⚠ BREAKING CHANGES

* Remove all v0 routes to prepare for v1 release ([410a2e9](https://github.com/paritytech/substrate-api-sidecar/commit/410a2e9251bf341b9e0f151bccf9c83617c7673f))

## [1.0.0-rc4](https://github.com/paritytech/substrate-api-sidecar/compare/v1.0.0-rc3...v1.0.0-rc4) (2020-10-21)

### Features

* Add Public URL notice ([#316](https://github.com/paritytech/substrate-api-sidecar/issues/316)) ([d1f01ea](https://github.com/paritytech/substrate-api-sidecar/commit/d1f01eaf066fa7da35eac0a998a190a24d52c346))


### Bug Fixes

* Find pallets with index 0 ([#321](https://github.com/paritytech/substrate-api-sidecar/issues/321)) ([ee0a048](https://github.com/paritytech/substrate-api-sidecar/commit/ee0a0488bf8100a42e713fc287f08d72394677b9))
* Use correct registry when parsing extrinsic `call` arguments ([#323](https://github.com/paritytech/substrate-api-sidecar/issues/323)) ([b4678e1](https://github.com/paritytech/substrate-api-sidecar/commit/b4678e106dab9e3c18d7e7df5eb9b2b3a4139334))

## [1.0.0-rc3](https://github.com/paritytech/substrate-api-sidecar/compare/v1.0.0-rc2...v1.0.0-rc3) (2020-09-29)


### Features

* **types:** Bump polkadot-js to v2.0.1 for new treasuary types ([#310](https://github.com/paritytech/substrate-api-sidecar/issues/310)) ([6d0daf7](https://github.com/paritytech/substrate-api-sidecar/commit/6d0daf77c333cc3fc82038fa85ac1099a285d41b))

## [1.0.0-rc2](https://github.com/paritytech/substrate-api-sidecar/compare/v1.0.0-rc1...v1.0.0-rc2) (2020-09-24)
