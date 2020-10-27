
<br /><br />

<div align="center">
  <h1 align="center">@substrate/api-sidecar</h1>
  <h4 align="center"> REST service that makes it easy to interact with blockchain nodes built using Substrate's FRAME framework.</h4>

  <p align="center">
    <a href="https://www.npmjs.com/package/@substrate/api-sidecar">
      <img alt="npm" src="https://img.shields.io/npm/v/@substrate/api-sidecar" />
    </a>
    <a href="https://github.com/paritytech/substrate-api-sidecar/actions">
      <img alt="Github Actions" src="https://github.com/paritytech/substrate-api-sidecar/workflows/pr/badge.svg" />
    </a>
    <a href="https://github.com/paritytech/substrate-api-sidecar/blob/master/LICENSE">
      <img alt="GPL-3.0-or-later" src="https://img.shields.io/npm/l/@substrate/api-sidecar" />
    </a>
  </p>
</div>

<br /><br />

## Note

v1.0.0 was released on 2020-10-23. This major release introduced several renamed endpoints as breaking changes. It is important that users complete the transition to the new endpoints ASAP so they are ready for any subsequent emergency updates. Please visit the [MIGRATION_GUIDE](/MIGRATION_GUIDE.md) to
learn more.

## Prerequisites

This service requires Node version 12 or higher.

## Table of contents

- [NPM package installation and usage](#npm-package-installation-and-usage)
- [Source code installation and usage](#source-code-installation-and-usage)
- [Configuration](#configuration)
- [Debugging fee and payout calculations](#debugging-fee-and-payout-calculations)
- [Available endpoints](https://paritytech.github.io/substrate-api-sidecar/dist/)
- [Chain compatibility](#chain-compatibility)
- [Docker](#docker)
- [Note for maintainers](#note-for-maintainers)
- [Roadmap](#roadmap)

## NPM package installation and usage

### Global installation

Install the service globally:

```bash
npm install -g @substrate/api-sidecar
# OR
yarn global add @substrate/api-sidecar
```

Run the service from any directory on your machine:

```bash
substrate-api-sidecar
```

### Local installation

Install the service locally:

```bash
npm install @substrate/api-sidecar
# OR
yarn add @substrate/api-sidecar
```

Run the service from within the local directory:

```bash
node_modules/.bin/substrate-api-sidecar
```

### Finishing up

[Jump to the configuration section](#configuration) for more details on connecting to a node.

[Click here for full endpoint docs.](https://paritytech.github.io/substrate-api-sidecar/dist/)

## Source code installation and usage

### Quick install

Simply run `yarn`.

### Rust development installation

If you are looking to hack on the `calc` Rust crate make sure your machine has an [up-to-date version of `rustup`](https://www.rust-lang.org/tools/install) 
installed to manage Rust dependencies.

Install `wasm-pack` if your machine does not already have it:

```bash
cargo install wasm-pack
```

Use yarn to do the remaining setup:

```bash
yarn
```

### Running

```bash
# For live reload in development
yarn dev

# To build and run
yarn start
```

[Jump to the configuration section](#configuration) for more details on connecting to a node.

## Configuration

To use a specific env profile (here for instance a profile called 'env.sample'):

```bash
NODE_ENV=sample yarn start
```

For more information on our configuration manager visit its readme [here](https://gitlab.com/chevdor/confmgr/-/raw/master/README.adoc). See `Specs.ts` to view the env configuration spec.

### Express server

-   `SAS_EXPRESS_BIND_HOST`: address on which the server will be listening, defaults to `127.0.0.1`.
-   `SAS_EXPRESS_PORT`: port on which the server will be listening, defaults to `8080`.
-   `SAS_EXPRESS_LOG_MODE`: enable console logging of "all" HTTP requests, only "errors", or nothing by
    setting it to anything else. LOG_MODE defaults to only "errors".

### Substrate node

-   `SAS_SUBSTRATE_WS_URL`: WebSocket URL to which the RPC proxy will attempt to connect to, defaults to
    `ws://127.0.0.1:9944`.

#### Custom substrate types

Some chains require custom type definitions in order for Sidecar to know how to decode the data
retrieved from the node. You can define chain specific types in `config/types.json`. Read more about [defining
types for polkadot-js here.](https://polkadot.js.org/api/start/types.extend.html)

If you are connecting to [Substrate Node Template](https://github.com/substrate-developer-hub/substrate-node-template), please add the following custom types in `config/types.json`.

```json
{
	"CUSTOM_TYPES": {
		"Address": "AccountId",
		"LookupSource": "AccountId"
	}
}
```

### Logging

-   `SAS_LOG_LEVEL`: the lowest priority log level to surface, defaults to `info`. Tip: set to `http`
    to see all HTTP requests.
-   `SAS_LOG_JSON`: wether or not to have logs formatted as JSON, defaults to `false`.
    Useful when using `stdout` to programmatically process Sidecar log data.
-   `SAS_LOG_FILTER_RPC`: wether or not to filter polkadot-js API-WS RPC logging, defaults to `false`.
-   `SAS_LOG_STRIP_ANSI`: wether or not to strip ANSI characters from logs, defaults
    to `false`. Useful when logging RPC calls with JSON written to transports.

#### Log levels

Log levels in order of decreasing importance are: `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`.

| http status code range | log level |
|------------------------|-----------|
| `code` < 400           | `http`    |
| 400 <= `code` < 500    | `warn`    |
| 500 < `code`           | `error`   |

#### RPC logging

If looking to track raw RPC requests/responses, one can use `yarn start:log-rpc` to turn on polkadot-js's 
logging. It is recommended to also set `SAS_LOG_STRIP_ANSI=true` to increase the readability of the logging stream.

**N.B.** If running `yarn start:log-rpc`, the NODE_ENV will be set to `test`. In order still run your `.env`
file you can `symlink` it with `.env.test`. For example you could run
`ln -s .env.myEnv .env.test && yarn start:log-rpc` to use `.env.myEnv` to set ENV variables. (see linux
commands `ln` and `unlink` for more info.)

## Debugging fee and payout calculations

It is possible to get more information about the fee and payout calculation process logged to
the console. Because this fee calculation happens in the statically compiled web assembly part
a re-compile with the proper environment variable set is necessary:

```bash
CALC_DEBUG=1 yarn
```

## Available endpoints

[Click here for full endpoint docs.](https://paritytech.github.io/substrate-api-sidecar/dist/)

## Chain compatibility

Sidecar should be compatible with any [Substrate](https://substrate.dev/) based chain, given
constraints:

-   The chain ought to use FRAME and the `balances` pallet.
-   The chain is being finalized (by running `grandpa`).
-   If the chain is running on custom Node binaries, the JSON-RPC API should be backwards compatible
    with the default Substrate Node.

## Docker

### Build

```bash
yarn build:docker
```

### Run

```bash
# For default use run:
docker run --rm -it -p 8080:8080 substrate-api-sidecar

# Or if you want to use environment variables set in `.env.docker`, run:
docker run --rm -it --env-file .env.docker -p 8080:8080 substrate-api-sidecar
```

then you can test with:

```bash
curl -s http://0.0.0.0:8080/block | jq
```

**N.B.** The docker flow presented here is just a sample to help get started. Modifications may be necessary for secure usage.

## Contribute

Need help or want to contribute ideas or code? Head over to our [CONTRIBUTING](CONTRIBUTING.md) doc for more information.

## Note for maintainers

All the commits in this repo follow the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/#summary). When merging a PR, make sure 1/ to
use squash merge and 2/ that the title of the PR follows the Conventional Commits spec.

The history of commits will be used to generate the `CHANGELOG`. To do so, run `yarn deploy` on the master
branch. This command will look at all the commits since the latest tag, bump the package version according
to semver rules, and generate a new `CHANGELOG`.

If you don't want to follow semver or need to do a dry run, consult the [`standard-version` CLI usage](https://github.com/conventional-changelog/standard-version#cli-usag)
docs. Flags for `standard-version` can be passed to `yarn deploy`.

`yarn deploy`, which only does local operations and doesn't push anything, will output more or
less the following lines:

``` bash
$ yarn deploy
yarn run v1.21.1
$ yarn build && standard-version -r minor
$ rimraf lib/ && tsc
✔ bumping version in package.json from 0.18.1 to 0.18.2
✔ outputting changes to CHANGELOG.md
✔ committing package.json and CHANGELOG.md
✔ tagging release v0.18.2
ℹ Run `git push --follow-tags origin master && npm publish` to publish
```

To publish the new package, just follow the instructions: `git push --follow-tags origin master && npm publish.`
You must have access to the @substrate organization on npm to publish.

## Roadmap

- Investigate and implement support for parachains in Sidecar. At this moment there is no concrete
plan, but options that allow configuration and plugins specified by parachain development teams is
one possible path forward. Initial support will be focused on enabling the workflow for core balance
transfer and monitoring features.
