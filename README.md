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

Following ENV variables can be set:

-   `SAS_EXPRESS_BIND_HOST`: address on which the server will be listening, defaults to `127.0.0.1`.
-   `SAS_EXPRESS_PORT`: port on which the server will be listening, defaults to `8080`.
-   `SAS_EXPRESS_LOG_MODE`: enable console logging of "all" HTTP requests, only "errors", or nothing by
    setting it to anything else. LOG_MODE defaults to only "errors".
-   `SAS_SUBSTRATE_WS_URL`: WebSocket URL to which the RPC proxy will attempt to connect to, defaults to
    `ws://127.0.0.1:9944`.

If you are connecting to [Substrate Node Template](https://github.com/substrate-developer-hub/substrate-node-template), please add the following custom types in `config/types.json`.

```json
{
	"CUSTOM_TYPES": {
		"Address": "AccountId",
		"LookupSource": "AccountId"
	}
}
```

## Fee Calculation Debugging

It is possible to get more information about the fee calculation process logged to
the console. Because this fee calculation happens in the statically compiled web assembly part
a re-compile with the proper environment variable set is necessary:

```bash
FEE_DEBUG=1 yarn
```

## Available paths

Block IDs may take two forms: a non-negative decimal integer that denotes the block _height_ **or**
a 32-byte hex string (`0x` followed by 64 hexadecimal digits) that denotes the block _hash_.

-   `/block` fetch latest finalized block details.

-   `/block/NUMBER` fetch block details at the block identified by 'NUMBER`.

-   `/balance/ADDRESS` fetch balances for `ADDRESS` at latest finalized block.

-   `/balance/ADDRESS/NUMBER` fetch balances for `ADDRESS` at the block identified by 'NUMBER`.

-   `/staking/ADDRESS` fetch the staking info for `ADDRESS` at latest finalized block.

-   `/staking/ADDRESS/NUMBER` fetch the staking info for `ADDRESS` at the block identified by 'NUMBER`.

-  `/staking-info` fetch information on general staking progress at the latest finalized block.

-  `/staking-info/NUMBER` fetch information on general staking progress at the block identified by 'NUMBER`.

-   `/vesting/ADDRESS` fetch the vesting info for `ADDRESS` at latest finalized block.

-   `/vesting/ADDRESS/NUMBER` fetch the vesting info for `ADDRESS` at the block identified by 'NUMBER`.

-   `/metadata` fetch chain metadata at latest finalized block.

-   `/metadata/NUMBER` fetch chain metadata at the block identified by 'NUMBER`.

-   `/claims/ADDRESS` fetch claims data for an Ethereum `ADDRESS`.

-   `/claims/ADDRESS/NUMBER` fetch claims data for an Ethereum `ADDRESS` at the block identified by 'NUMBER`.

-   `/tx/artifacts/` fetch artifacts used for creating transactions at latest finalized block.

-   `/tx/artifacts/NUMBER` fetch artifacts used for creating transactions at the block identified by 'NUMBER`.

-   `/tx/fee-estimate` submit a transaction in order to get back a fee estimation. Expects a string
    with a hex-encoded transaction in a JSON POST body:

    ```
    curl localhost:8080/tx/fee-estimate -X POST --data '{"tx": "0x..."}' -H 'Content-Type: application/json'
    ```

    Expected result is a JSON with fee information:

    ```
    {
      "weight": "195000000",
      "class": "Normal",
      "partialFee": "165600000"
    }
    ```

-   `/tx/` submit a signed transaction, expects a string with hex-encoded transaction in a JSON POST
    body:
    ```
    curl localhost:8080/tx/ -X POST --data '{"tx": "0x..."}' -H 'Content-Type: application/json'
    ```
    Expected result is a JSON with transaction hash:
    ```
    {
        "hash": "..."
    }
    ```

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

**N.B.**: The docker flow presented here is just a sample to help get started. Modifications may be necessary for secure usage.


## Contribute

We welcome contributions. Before submitting your PR, make sure to run the following commands:

-   `yarn lint`: Make sure your code follows our linting rules. You can also run `yarn lint --fix` to
    automatically fix some of those errors.
-   `yarn test`: Make sure all tests pass.
