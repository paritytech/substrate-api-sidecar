
<br /><br />

<div align="center">
  <h1 align="center">@substrate/api-sidecar</h1>
  <h4 align="center"> REST service that makes it easy to interact with blockchain nodes built using Substrate's
    <a href="https://substrate.dev/docs/en/knowledgebase/runtime/frame">FRAME</a>
    framework.</h4>
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

v1.0.0 was released on 2020-10-23. This major release introduced several renamed endpoints as breaking changes. It is important that users complete the transition to the new endpoints ASAP so they are ready for any subsequent emergency updates. Please visit the [MIGRATION_GUIDE](./guides/MIGRATION_GUIDE.md) to
learn more.

## Prerequisites

This service requires Node versions 14 or higher.

Compatibility:
| Node Version  | Stablility  |
|---------------|:-----------:|
|     v14.x.x   |   Stable    |
|     v16.x.x   |   Stable    |
|     v17.x.x   |  Not Stable |
|     v18.x.x   |   Pending   | 

NOTE: Node LTS (`long term support`) versions start with an even number, and odd number versions are subject to a 6 month testing period with active support before they are unsupported. It is recommended to use sidecar with a stable actively maintained version of node.js.  

## Table of contents

- [NPM package installation and usage](#npm-package-installation-and-usage)
- [Source code installation and usage](#source-code-installation-and-usage)
- [Configuration](#configuration)
- [Debugging fee and payout calculations](#debugging-fee-and-payout-calculations)
- [Available endpoints](https://paritytech.github.io/substrate-api-sidecar/dist/)
- [Chain integration guide](./guides/CHAIN_INTEGRATION.md)
- [Docker](#docker)
- [Note for maintainers](#note-for-maintainers)

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

To check your version you may append the `--version` flag to `substrate-api-sidecar`.

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
yarn build
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

- `SAS_EXPRESS_BIND_HOST`: address on which the server will be listening, defaults to `127.0.0.1`.
- `SAS_EXPRESS_PORT`: port on which the server will be listening, defaults to `8080`.
- `SAS_EXPRESS_LOG_MODE`: enable console logging of "all" HTTP requests, only "errors", or nothing by
    setting it to anything else. LOG_MODE defaults to only "errors".

### Substrate node

- `SAS_SUBSTRATE_WS_URL`: WebSocket URL to which the RPC proxy will attempt to connect to, defaults to
    `ws://127.0.0.1:9944`.

#### Custom substrate types

Some chains require custom type definitions in order for Sidecar to know how to decode the data
retrieved from the node. Sidecar pulls types for chains from [@polkadot/apps-config](https://github.com/polkadot-js/apps/tree/master/packages/apps-config), but in some cases
the types for the chain you are trying to connect to may be out of date or may simply not exist in
@polkadot/apps-config.

Sidecar affords environment variables which allow the user to specify an absolute path to a JSON file
that contains type definitions in the corresponding formats. Consult polkadot-js/api for more info on
the type formats (see `RegisteredTypes`).

**N.B** Types set from environment variables will override the corresponding types pulled from
@polkadot/apps-config.

- `SAS_SUBSTRATE_TYPES_BUNDLE`: a bundle of types with versioning info, type aliases, derives, and
    rpc definitions. Format: `OverrideBundleType` (see [`typesBundle`](https://github.com/polkadot-js/api/blob/21039dec1fcad36061a96bf5526248c5fab38780/packages/types/src/types/registry.ts#L72)).
- `SAS_SUBSTRATE_TYPES_CHAIN`: type definitions keyed by `chainName`. Format: `Record<string, RegistryTypes>` (see [`typesChain`](https://github.com/polkadot-js/api/blob/21039dec1fcad36061a96bf5526248c5fab38780/packages/types/src/types/registry.ts#L76)).
- `SAS_SUBSTRATE_TYPES_SPEC`: type definitions keyed by `specName`. Format: `Record<string, RegistryTypes>` (see [`typesSpec`](https://github.com/polkadot-js/api/blob/21039dec1fcad36061a96bf5526248c5fab38780/packages/types/src/types/registry.ts#L80)).
- `SAS_SUBSTRATE_TYPES`: type definitions and overrides, not keyed. Format: `RegistryTypes` (see [`types`](https://github.com/polkadot-js/api/blob/21039dec1fcad36061a96bf5526248c5fab38780/packages/types/src/types/registry.ts#L64)).

You can read more about [defining types for polkadot-js here.](https://polkadot.js.org/api/start/types.extend.html)

##### Connecting a modified node template

Polkadot-js can recognize the standard node template and inject the correct types, but if you have
modified the name of your chain in the node template you will need to add the types manually in a
JSON `types` file like so:

```json
// my-chains-types.json
{
  "Address": "AccountId",
  "LookupSource": "AccountId"
}
```

and then set the enviroment variable to point to your definitions:

```bash
export SAS_SUBSTRATE_TYPES=/path/to/my-chains-types.json
```

### Logging

- `SAS_LOG_LEVEL`: the lowest priority log level to surface, defaults to `info`. Tip: set to `http`
    to see all HTTP requests.
- `SAS_LOG_JSON`: wether or not to have logs formatted as JSON, defaults to `false`.
    Useful when using `stdout` to programmatically process Sidecar log data.
- `SAS_LOG_FILTER_RPC`: wether or not to filter polkadot-js API-WS RPC logging, defaults to `false`.
- `SAS_LOG_STRIP_ANSI`: wether or not to strip ANSI characters from logs, defaults
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
CALC_DEBUG=1 sh calc/build.sh
```

## Available endpoints

[Click here for full endpoint docs.](https://paritytech.github.io/substrate-api-sidecar/dist/)

## Chain integration guide

[Click here for chain integration guide.](./guides/CHAIN_INTEGRATION.md))

## Docker

With each release, the maintainers publish a docker image to dockerhub at [parity/substrate-api-sidecar](https://hub.docker.com/r/parity/substrate-api-sidecar/tags?page=1&ordering=last_updated)

### Pull the latest release

```bash
docker pull docker.io/parity/substrate-api-sidecar:latest
```

The specific image tag matches the release version.

### Or build from source

```bash
yarn build:docker
```

### Run

```bash
# For default use run:
docker run --rm -it --read-only -p 8080:8080 substrate-api-sidecar

# Or if you want to use environment variables set in `.env.docker`, run:
docker run --rm -it --read-only --env-file .env.docker -p 8080:8080 substrate-api-sidecar
```

**NOTE**: While you could omit the `--read-only` flag, it is **strongly recommended for containers used in production**.

then you can test with:

```bash
curl -s http://0.0.0.0:8080/blocks/head | jq
```

**N.B.** The docker flow presented here is just a sample to help get started. Modifications may be necessary for secure usage.

## Contribute

Need help or want to contribute ideas or code? Head over to our [CONTRIBUTING](./guides/CONTRIBUTING.md) doc for more information.

## Notes for maintainers

### Commits

All the commits in this repo follow the [Conventional Commits spec](https://www.conventionalcommits.org/en/v1.0.0/#summary). When merging a PR, make sure 1) to use squash merge and 2) that the title of the PR follows the Conventional Commits spec.

### Releases

#### Preparation

1. Make sure that you've run `yarn` in this folder, and run `cargo install wasm-pack` so that that binary is available on your `$PATH`.

1. Checkout a branch with the format `name-v5-0-1`. When deciding what version will be released it is important to look over 1) PRs since the last release and 2) release notes for any updated polkadot-js dependencies as they may affect type definitions.

1. Ensure we have the latest polkadot-js dependencies. Note: Every monday the polkadot-js ecosystem will usually come out with a new release. It's important that we keep up, and read the release notes for any breaking changes, or high priority updates. You can use the following command `yarn upgrade-interactive` to find and update all available releases. Feel free to update other packages that are available for upgrade if reasonable. To upgrade just `@polkadot` scoped deps use `yarn up "@polkadot/*"`

    - @polkadot/api [release notes](https://github.com/polkadot-js/api/releases)
    - @polkadot/apps-config [release notes](https://github.com/polkadot-js/apps/releases)
      - If there are any major changes to this package that includes third party type packages, its worth noting to contact the maintainers of sidecar and do a peer review of the changes in apps-config, and make sure no bugs will be inherited.
    - @polkadot/util-crypto [release notes](https://github.com/polkadot-js/common/releases)
    - @substrate/calc [npm release page](https://www.npmjs.com/package/@substrate/calc)

1. Next make sure the resolutions are up to date inside of the `package.json` for all `@polkadot/*` packages, please refer to the releases of each polkadot package we update as a dependency, and reach out to the maintainers for any questions.

1. After updating the dependencies and resolutions (if applicable), the next step is making sure the release will work against all relevant runtimes for Polkadot, Kusama, and Westend. This can be handled by running `yarn test:init-e2e-tests`. If you would like to test on an individual chain, you may run the same command followed by its chain, ex: `yarn test:init-e2e-tests:polkadot`. Before moving forward ensure all tests pass, and if it warns of any missing types feel free to make an issue [here](https://github.com/paritytech/substrate-api-sidecar/issues).

    Note: that the e2e tests will connect to running nodes in order to test sidecar against real data, and they may fail owing to those connections taking too long to establish. If you run into any failures, try running tests just for the chain that failed with something like `yarn test:init-e2e-tests:polkadot`.

1. Update the version in the package.json (this is very important for releasing on NPM).

1. Update the substrate-api-sidecar version in the docs by going into `docs/src/openapi-v1.yaml`, and changing the `version` field under `info` to the releases respected version. Then run `yarn build:docs`.

1. Update `CHANGELOG.md` by looking at merged PRs since the last release. Follow the format of previous releases. Only record dep updates if they reflect type definition updates as those affect the users API.

    Make sure to note if it is a high upgrade priority (e.g. it has type definitions for an upcoming runtime upgrade to a Parity maintained network).

1. Commit with ex: `chore(release): 5.0.1`, then `git push` your release branch up, make a PR, get review approval, then merge.

    **NOTE**: Before pushing up as a sanity check run the following 4 commands and ensure they all run with zero errors. There is one exception with `yarn test` where you will see errors logged, that is expected as long as all the test suites pass.

    ```bash
    yarn dedupe
    yarn build
    yarn lint
    yarn test
    ```

1. If one of the commits for this release includes the `calc` directory and package, make sure to follow the instructions below for releasing it on npm (if a new version hasn't yet been released seperately).

#### Publish on GitHub

1. Double check that `master` is properly merged, pull down `master` branch.

1. [Create a new release](https://github.com/paritytech/substrate-api-sidecar/releases/new) on github, select `Choose a tag` and create a new tag name matching the version like `v5.0.1`. The tag will be automatically published along with the release notes.

1. Generally you can copy the changelog information and set the release notes to that. You can also observe past releases as a reference.

#### Publish on NPM

NOTE: You must be a member of the `@substrate` NPM org and must belong to the `Developers` team within the org. (Please make sure you have 2FA enabled.)

1. Now that master has the commit for the release, pull down `master` branch.

2. Run the following commands. (Please ensure you have 2FA enabled)

    ```bash
    npm login # Only necessary if not already logged in
    yarn deploy # Builds JS target and then runs npm publish
    ```

#### Calc Package Release Prep

1. Head into the `calc` directory in sidecar, and increment the version inside of the `Cargo.toml`, as well as the `pkg/package.json`.

2. Confirm that the package compiles correctly, `cargo build --release`.

3. Continue with the normal sidecar release process.

#### Publish Calc Package

1. `cd` into `calc/pkg` and `npm login`, then `npm publish`.
