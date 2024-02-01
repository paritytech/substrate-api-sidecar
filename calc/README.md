<br /><br />

<div align="center">
  <h1 align="center">@substrate/calc</h1>
  <h4 align="center">Off-chain calculations for @substrate/api-sidecar.</h4>

  <p align="center">
    <a href="https://www.npmjs.com/package/@substrate/api-sidecar">
      <img alt="npm" src="https://img.shields.io/npm/v/@substrate/calc" />
    </a>
    <a href="https://github.com/paritytech/substrate-api-sidecar/actions">
      <img alt="Github Actions" src="https://github.com/paritytech/substrate-api-sidecar/workflows/pr/badge.svg" />
    </a>
    <a href="https://opensource.org/licenses/Apache-2.0">
      <img alt="apache-2.0" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" />
    </a>
  </p>
</div>

<br /><br />

## About

This package is generated from the [`calc`](https://github.com/paritytech/substrate-api-sidecar/tree/master/calc) Rust crate using `wasm-bindgen` and was initially developed
solely to use as a dependency for `substrate-api-sidecar`. We are now offering this package as a
standalone through the npm registry.

## Usage

Example usage for the package can be found in Sidecar's 
[staking payout service](https://github.com/paritytech/substrate-api-sidecar/blob/master/src/services/accounts/AccountsStakingPayoutsService.ts) 
and Sidecar's [block service](https://github.com/paritytech/substrate-api-sidecar/blob/master/src/services/blocks/BlocksService.ts).

## Build

In order to build the rust source code with `wasm-pack`, please run `sh build.sh`.
This will require `wasm-pack` being installed globally. The script will install it for you, but before it does it will ask you whether you want it installed or not.

## Contributing

We welcome [contributions for documentation and code](https://github.com/paritytech/substrate-api-sidecar/pulls). 
If you have any questions you can reach the maintainers by [filing an issue on github.](https://github.com/paritytech/substrate-api-sidecar/issues)
