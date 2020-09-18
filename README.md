# Substrate API Sidecar

REST API service intended to run next to Substrate, exposing a limited set of endpoints over HTTP
with meaningful responses.

## Installation

Make sure your machine has an
[up-to-date version of `rustup`](https://www.rust-lang.org/tools/install) installed to manage Rust
dependencies.

Install `wasm-pack` if your machine does not already have it:

```bash
cargo install wasm-pack
```

Use yarn to do the remaining setup:

```bash
yarn
```

## Running

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

For more information on our configuration manager visit its readme [here](https://gitlab.com/chevdor/confmgr/-/raw/master/README.adoc). See `specs.yaml` to view the env configuration spec.

### Express server

-   `SAS_EXPRESS_BIND_HOST`: address on which the server will be listening, defaults to `127.0.0.1`.
-   `SAS_EXPRESS_PORT`: port on which the server will be listening, defaults to `8080`.
-   `SAS_EXPRESS_LOG_MODE`: enable console logging of "all" HTTP requests, only "errors", or nothing by
    setting it to anything else. LOG_MODE defaults to only "errors".

### Substrate node

-   `SAS_SUBSTRATE_WS_URL`: WebSocket URL to which the RPC proxy will attempt to connect to, defaults to
    `ws://127.0.0.1:9944`.

#### Custom substrate types

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

-   `SAS_LOG_CONSOLE_LEVEL`: log level for console transport, defaults to `info`. Tip: set to `http`
    to see all HTTP requests.
-   `SAS_LOG_CONSOLE_JSON`: wether or not to have JSON written to console transport, defaults to `false`.
    Useful when using `stdout` to programmatically process Sidecar log data.
-   `SAS_LOG_CONSOLE_FILTER_RPC`: wether or not filter polkadot-js API-WS RPC logging for console 
    transport, defaults to `true`.
-   `SAS_LOG_FILE_USE`: wether or not to use a file transport, defaults to `false`. When set to `false`
    no files will be created and all other file logging options have no effect.
-   `SAS_LOG_FILE_LEVEL`: log level for file transport, defaults to `http`.
-   `SAS_LOG_FILE_SIZE`: maximum size, as measured in bytes, that a log file will reach before Sidecar
    starts logging to a new file, defaults to `524288000` (500mb). New files wil take the name of the
    initial file with an increasing digit appended to each new one.
-   `SAS_LOG_FILE_COUNT`: maximum number of log files to store before deleting oldest, defaults to `2`.
-   `SAS_LOG_FILE_PATH`: path from the root directory to the (initial) log file, defaults to 
    `./logs/file-transport.log`
-   `SAS_LOG_STRIP_ANSI`: wether or not to strip ANSI characters in either transport, defaults
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
logging. It is recommended to also set `SAS_LOG_STRIP_ANSI=true` to increase the readability of
written files. Note that RPC requests/responses default to being filtered out of the console transport.

**N.B.** If running `yarn start:log-rpc`, the NODE_ENV will be set to `test`. In order still run your `.env`
file you can `symlink` it with `.env.test`. For example you could run
`ln -s .env.myEnv .env.test && yarn start:log-rpc` to use `.env.myEnv` to set ENV variables. (see linux
commands `ln` and `unlink` for more info.)

## Debugging Fee & Payout Calculations

It is possible to get more information about the fee and payout calculation process logged to
the console. Because this fee calculation happens in the statically compiled web assembly part
a re-compile with the proper environment variable set is necessary:

```bash
CALC_DEBUG=1 yarn
```

## Available paths

Path descriptions link to controllers for detailed docs with usage information.

Block IDs may take two forms: a non-negative decimal integer that denotes the block _height_ **or**
a 32-byte hex string (`0x` followed by 64 hexadecimal digits) that denotes the block _hash_.

-   `/` fetch information on Sidecars version, docs, and available routes.

-   [`/accounts/ADDRESS/staking-payouts` fetch staking payouts for `ADDRESS`.](/src/controllers/accounts/AccountsStakingPayoutsController.ts)

-   [`/accounts/ADDRESS/balance-info` fetch balances info for `ADDRESS`.](src/controllers/accounts/AccountsBalanceInfoController.ts) (Replaces `/balance/ADDRESS`.)

-   [`/accounts/ADDRESS/vesting-info` vesting info for `ADDRESS`.](src/controllers/accounts/AccountsVestingInfoController.ts) (Replaces `/vesting/ADDRESS`.)

-   [`/accounts/ADDRESS/staking-info` fetch the staking info for `ADDRESS`.](src/controllers/accounts/AccountsStakingInfoController.ts) (Replaces `/staking/ADDRESS`.)

-   [`/blocks/{head, BlockId}` fetch the finalized head or block identified by BlockId.](/src/controllers/blocks/BlocksController.ts) (Replaces `/block`.)

-   [`/pallets/staking/progress` fetch information on general staking progress.](src/controllers/pallets/PalletsStakingProgressController.ts) (Replaces `/staking-info`.)

-   [`/pallets/{palletId}/storage/{storageItemId}` fetch the value of a storage item.](src/controllers/pallets/PalletsStorageItemController.ts)

-   [`/node/network` fetch information about the Substrate node's activity in the peer-to-peer network.](src/controllers/node/NodeNetworkController.ts)

-   [`/node/transaction-pool` fetch pending extrinsics from the Substrate node.](src/controllers/node/NodeTransactionPoolController.ts)

-   [`/node/version` fetch information about the Substrates node's implementation and versioning.](src/controllers/node/NodeVersionController.ts)

-   [`/runtime/metadata` fetch the runtime metadata in decoded, JSON form.](src/controllers/runtime/RuntimeMetadataController.ts) (Replaces `/metadata`.)

-   [`/runtime/code` fetch the Wasm code blob of the Substrate runtime.](src/controllers/runtime/RuntimeCodeController.ts)

-   [`/runtime/spec` version information of the Substrate runtime.](src/controllers/runtime/RuntimeSpecController.ts)

-   [`/claims/ADDRESS` fetch claims data for an Ethereum `ADDRESS`.](src/controllers/claims/ClaimsController.ts) (Will be deprecated in v1.)

-   [`/claims/ADDRESS/NUMBER` fetch claims data for an Ethereum `ADDRESS` at the block identified by 'NUMBER`.](src/controllers/claims/ClaimsController.ts) (Will be deprecated in v1.)

-   [`/transaction/material` fetch all the network information needed to construct a transaction offline.](src/controllers/transaction/TransactionMaterialController.ts) (Replaces `/tx/artifacts`.)

-   [`/transaction/fee-estimate` submit a transaction in order to get back a fee estimation.](src/controllers/transaction/TransactionFeeEstimateController.ts) (Replaces `/tx/fee-estimate`.) Expects a string
    with a hex-encoded transaction in a JSON POST body:

    ```
    curl localhost:8080/transaction/fee-estimate -X POST --data '{"tx": "0x..."}' -H 'Content-Type: application/json'
    ```

    Expected result is a JSON with fee information:

    ```
    {
      "weight": "195000000",
      "class": "Normal",
      "partialFee": "165600000"
    }
    ```

-   [`/transaction` submit a signed transaction.](src/controllers/transaction/TransactionSubmitController.ts) (Replaces `/tx`.) Expects a string with hex-encoded transaction in a JSON POST
    body:
    ```
    curl localhost:8080/transaction -X POST --data '{"tx": "0x..."}' -H 'Content-Type: application/json'
    ```
    Expected result is a JSON with transaction hash:
    ```
    {
        "hash": "..."
    }
    ```

- [`/transaction/dry-run` dry run a transaction to check if it is valid.](src/controllers/transaction/TransactionDryRunController.ts)
Expects a string with hex-encoded transaction in a JSON POST
    body:
    ```
    curl localhost:8080/transaction/dry-run -X POST --data '{"tx": "0x..."}' -H 'Content-Type: application/json'
    ```
    See [here for details](src/controllers/transaction/TransactionDryRunController.ts) on expected result.

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

We welcome contributions. Before submitting your PR, make sure to run the following commands:

-   `yarn lint`: Make sure your code follows our linting rules. You can also run `yarn lint --fix` to
    automatically fix some of those errors.
-   `yarn test`: Make sure all tests pass.
