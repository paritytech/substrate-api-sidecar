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
`/paras/crowdloans`
