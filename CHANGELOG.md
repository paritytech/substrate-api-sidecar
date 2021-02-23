# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
