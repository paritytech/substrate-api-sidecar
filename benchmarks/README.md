## Substrate-Api-Sidecar Benchamarks.

Endpoints in Sidecar that are benchmarked against a archive node:

### Accounts
`/accounts/{accountId}/balance-info?at={blockId}`
`/accounts/{accountId}/vesting-info?at={blockId}`
`/accounts/{accountId}/staking-info?at={blockId}`
`/accounts/{accountId}/staking-payouts`
`/accounts/{accountId}/validate`

### Blocks
`/blocks/{blockId}`

### Pallets
`/pallets/staking/progress?at={blockId}`
`/pallets/{palletId}/storage?at={blockId}`
`/pallets/{palletId}/storage/{storageItemId}?at={blockId}`

### Paras
`/paras?at={blockId}`
`/paras/leases/current?at={blockId}`
`/paras/auctions/current?at={blockId}`
`/paras/crowdloans?at={blockId}`
`/paras/{paraId}/crowdloan-info?at={blockId}`
`/paras/{paraId}/lease-info?at={blockId}`

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

In order to run each benchmark you should `cd` into the appropriate directory you want to run, and then `sh init.sh`. You are required to have sidecar running, as well as a fully synced archive node.
