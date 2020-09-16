# v0.x.x &rightarrow; v1.0.0-beta.0

Documentation for v1 endpoints are available here: https://paritytech.github.io/substrate-api-sidecar/dist/

For most users, the major bump will require transitioning all the endpoint paths
they use to an updated version. The v1.0.0.beta.0 release contains both the old
and new endpoints to help facilitate the transition.

**`substrate-api-sidecar` releases after Friday, October 2nd, 2020, will not
make any gurantees to include deprecated endpoints.** It is important that users
finishing transitioning to the new endpoints by this date so they are ready for
any subsequent emergency updates.

Below is a table that is intended to give an overview of what the mapping of
deprecated endpoints to there v1 equivalents. Many of the new
endpoints have unlisted options for query params.

| v0 path           	              | v1 equivalent path            	                  |
|--------------------	              |---------------------	                            |
| `/block`           	              | `/blocks/head`      	                            |
| `/block/{blockId}` 	              | `/blocks/{blockId}` 	                            |
| `/balance/{accountId}`            | `accounts/{accountId}/balance-info`               |
| `/balance/{accountId}/{blockId}`  | `accounts/{accountId}/balance-info?at={blockId}`  |
| `/staking/{accountId}`            | `accounts/{accountId}/staking-info`               |
| `/staking/{accountId}/{blockId}`  | `accounts/{accountId}/staking-info?at={blockId}`  |
| `/vesting/{accountId}`            | `accounts/{accountId}/vesting-info`               |
| `/vesting/{accountId}/{blockId}`  | `accounts/{accountId}/vesting-info?at={blockId}`  |
| `/claims/{accountId}`             | (None)                                            |
| `/claims/{accountId}/{blockId}`   | (None)                                            |
| (None)                            | `accounts/{accountId}/staking-payouts`            |
| `/tx/artifacts`                   | `/transaction/material`                           |
| `/tx/artifacts/{blockId}`         | `/transaction/material?at={blockId}`              |
| `/tx/fee-estimate`                | `/transaction/fee-estimate`                       |
| `/tx`                             | `/transaction`                                    |
| (None)                            | `/transaction/dry-run`                            |
| `/metadata`                       | `/runtime/metadata`                               |
| `/metadata/{blockId}`             | `/runtime/metadata?at={blockId}`                  |
| (None)                            | `/runtime/spec`                                   |
| (None)                            | `runtime/code`                                    |
| `/staking-info`                   | `/pallets/staking/progress`                       |
| `/staking-info/{blockId}`         | `/pallets/staking/progress?at={blockId}`          |
| `/staking-info/{blockId}`         | `/pallets/staking/progress?at={blockId}`          |
| (None)                            | `/pallets/{palletId}/storage/{storageItemId}`     |
| (None)                            | `/node/network`                                   |
| (None)                            | `/node/version`                                   |
| (None)                            | `/node/transaction-pool`                          |
| `/`                               | `/`

**N.B.** the `/blocks` endpoint sees two significant breaking changes:

1) extrinsic and event methods names no longer are a string of the form
`pallet.method`, instead they are an object of the form
`{ pallet: string, method: string }`.

2) Unsigned extrinsics and inherents will have `null` for nonce and tip, while
`paysFee` will always be `false`. Previously the latter two fields where 0, while
`paysFee` was often `true`. (#274)

There are some other changes throughout the API, including some slightly updated
error messages which have not yet been updated in the new docs UI.