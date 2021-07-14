# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
