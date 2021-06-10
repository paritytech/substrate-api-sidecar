# v0.x.x &rightarrow; v1.0.0-rc1

Full documentation for v1 endpoints is available here: https://paritytech.github.io/substrate-api-sidecar/dist/

For most users, the major bump will require transitioning all the endpoint paths
that they use to an updated version. The v1.0.0.beta.0 release contains both the old
and new endpoints to help facilitate the transition.

**`substrate-api-sidecar` releases after Friday, October 16th, 2020, will not
make any guarantees to include deprecated endpoints.** It is important that users
complete the transition to the new endpoints by this date so they are ready for
any subsequent emergency updates.

Below is a table that gives an overview of what the mapping from deprecated
endpoints to their v1 equivalents. Many of the new endpoints have additional
options for query params, which you can find the documentation linked at the top.

| v0 path                           | v1 equivalent path            	                  |
|--------------------               |---------------------	                            |
| `/block`                          | `/blocks/head`      	                            |
| `/block/{blockId}`                | `/blocks/{blockId}` 	                            |
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

1) Extrinsic and event method names are no longer a string of the form
`pallet.method`; instead they are an object of the form
`{ pallet: string, method: string }`.

2) Unsigned extrinsics and inherents will have `null` for nonce and tip, while
`paysFee` will always be `false`. Previously the latter two fields were 0, while
`paysFee` was often `true`. (#274)

There are some other changes throughout the API, including some slightly updated
error messages that have not yet been updated in the new docs UI.
