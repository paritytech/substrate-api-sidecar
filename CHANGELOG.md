# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
