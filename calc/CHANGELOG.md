# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.3.0](https://github.com/paritytech/substrate-api-sidecar/tree/master/calc/) (2022-08-12)

### BREAKING CHANGE

- fix!(calc): fee calculation ([974](https://github.com/paritytech/substrate-api-sidecar/pull/974)) ([b4a8781](https://github.com/paritytech/substrate-api-sidecar/commit/b4a8781982b97ee6593290a5b137467bd0c93e22))
    - NOTE: This is a breaking change that removes the `CalcFee` class and exposes a new function called `calc_partial_fee`.
