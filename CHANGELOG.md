# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
