# Substrate API Sidecar

REST API service intended to run next to Substrate, exposing a limited set of endpoints over HTTP
with meaningful responses.

### Installation

```
yarn
```

### Running

```
yarn start
```

### Available paths

- `/block` fetch latest finalized block details.

- `/block/NUMBER` fetch block details at block height `NUMBER`.

- `/balance/ADDRESS` fetch balances for `ADDRESS` at latest finalized block.

- `/balance/ADDRESS/NUMBER` fetch balances for `ADDRESS` at block height `NUMBER`.

- `/payout/ADDRESS` fetch payout info for `ADDRESS` at latest finalized block.

- `/payout/ADDRESS/NUMBER` fetch payout info for `ADDRESS` at block height `NUMBER`.

- `/staking/ADDRESS` fetch the staking ledger info for `ADDRESS` at latest finalized block.

- `/staking/ADDRESS/NUMBER` fetch the staking ledger info for `ADDRESS` at block height `NUMBER`.

- `/vesting/ADDRESS` fetch the vesting info for `ADDRESS` at latest finalized block.

- `/vesting/ADDRESS/NUMBER` fetch the vesting info for `ADDRESS` at block height `NUMBER`.

- `/metadata` fetch chain metadata at latest finalized block.

- `/metadata/NUMBER` fetch chain metadata at block height `NUMBER`.

- `/claims/ADDRESS` fetch claims data for an Ethereum `ADDRESS`.

- `/claims/ADDRESS/NUMBER` fetch claims data for an Ethereum `ADDRESS` at block `NUMBER`.

- `/tx/artifacts/` fetch artifacts used for creating transactions at latest finalized block.

- `/tx/artifacts/NUMBER` fetch artifacts used for creating transactions at block height `NUMBER`.

- `/tx/fee-estimate` submit a transaction in order to get back a fee estimation. Expects a string
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

- `/tx/` submit a signed transaction, expects a string with hex-encoded transaction in a JSON POST
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

### Configuration

Following ENV variables can be set:

- `BIND_HOST`: address on which the server will be listening, defaults to `127.0.0.1`.
- `BIND_PORT`: port on which the server will be listening, defaults to `8080`.
- `NODE_WS_URL`: WebSocket URL to which the RPC proxy will attempt to connect to, defaults to
  `ws://127.0.0.1:9944`.

### Chain compatibility

Sidecar should be compatible with any [Substrate](https://substrate.dev/) based chain, given
constraints:

- The chain ought to use FRAME and the `balances` pallet.
- The chain is being finalized (by running `grandpa`).
- If the chain is running on custom Node binaries, the JSON-RPC API should be backwards compatible
  with the default Substrate Node.
