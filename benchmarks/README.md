## Substrate-Api-Sidecar Benchamarks.

Endpoints in Sidecar that are benchmarked against a archive node:

### Accounts
`/accounts/{accountId}/balance-info?at={blockId}`
`/accounts/{accountId}/vesting-info?at={blockId}`
`/accounts/{accountId}/staking-info?at={blockId}`
`/accounts/{accountId}/staking-payouts`
`/accounts/{accountId}/staking-info`
`/accounts/{accountId}/convert`
`/accounts/{accountId}/validate`

### Blocks
`/blocks/{blockId}`
`/blocks/{blockId}/header`
`/blocks/{blockId}/extrinsics/{extrinsicIndex}`
`/blocks/head`
`/blocks/head/header`

### Node
`/node/network`
`/node/transaction-pool`
`/node/version`

### Pallets
`/pallets/staking/progress?at={blockId}`
`/pallets/{palletId}/storage?at={blockId}`
`/pallets/{palletId}/storage/{storageItemId}?at={blockId}`
`/pallets/nomination-pools/info`
`/pallets/nomination-pools/{poolId}`
`/pallets/{palletId}/errors`
`/pallets/{palletId}/errors/{errorItemId}`
`/pallets/staking/validators`
`/pallets/staking/progress`

### Paras
`/paras?at={blockId}`
`/paras/leases/current?at={blockId}`
`/paras/auctions/current?at={blockId}`
`/paras/crowdloans?at={blockId}`
`/paras/{paraId}/crowdloan-info?at={blockId}`
`/paras/{paraId}/lease-info?at={blockId}`

### Runtime
`/runtime/spec`

### Transaction
`/transaction/material`

### Requirements

1. `wrk`
2. `lua`
3. Fully synced polkadot archive node. 

### Mac

```
brew install wrk lua
```

### Linux

```
sudo apt install lua 5.1

git clone https://github.com/wg/wrk.git wrk
cd wrk
make

# move the executable to somewhere in your PATH, ex:
sudo cp wrk /usr/local/bin
```

### Running Locally

In order to run each benchmark you should `cd` into the appropriate directory you want to run, set the `WRK_TIME_LENGTH` env var (ex: `export WRK_TIME_LENGTH=30s`) and then `sh init.sh`. You are required to have sidecar running, as well as a fully synced archive node.

NOTE: Some benchmarks might have multiple `sh` scripts with different names in order to run specific benchmarks.

### Running via Scripts (Root)

Below are flags, and examples on how to run these benchmarks from the root of the repository. See <root>/scripts/README.md for more information. 

### Flags

`--ws-url`: The Ws Url to run the benchmarks against. Default is `ws://127.0.0.1:9944`.

`--endpoint`: Run a single benchmark by specificing which endpoint to run. If this is absent it will run all benchmarks.

`--log-level`: The log-level to run the benchmarks in. Defaults to `http`.

`--time`: The amount of time each benchmark should run for. Ex: `1m`, `30s`, `15s`. Default is `1m`.

ex1:
```bash
$ yarn
$ yarn bench
```

ex2:
```bash
$ yarn
$ yarn bench --log-level=info --time=30s  
```

ex3:
```
$ yarn
$ yarn bench --log-level=info --time=30s  --endpoint=/accounts/{accountId}/balance-info
```