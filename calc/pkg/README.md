<br /><br />

<div align="center">
  <h1 align="center">@substrate/calc</h1>
  <h4 align="center">Off-chain calculations for @substrate/api-sidecar.</h4>

  <p align="center">
    <a href="https://www.npmjs.com/package/@substrate/api-sidecar">
      <img alt="npm" src="https://img.shields.io/npm/v/@substrate/calc" />
    </a>
    <a href="https://github.com/paritytech/substrate-api-sidecar/actions">
      <img alt="Github Actions" src="https://github.com/paritytech/substrate-api-sidecar/workflows/pr/badge.svg" />
    </a>
    <a href="https://opensource.org/licenses/Apache-2.0">
      <img alt="apache-2.0" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" />
    </a>
  </p>
</div>

<br /><br />

## About

This package is generated from the [`calc`](https://github.com/paritytech/substrate-api-sidecar/tree/master/calc) Rust crate using `wasm-bindgen` and was initially developed
solely to use as a dependency for `substrate-api-sidecar`. We are now offering this package as a
standalone through the npm registry.

## Usage

Example usage for the package can be found in Sidecar's 
[staking payout service](https://github.com/paritytech/substrate-api-sidecar/blob/master/src/services/accounts/AccountsStakingPayoutsService.ts) 
and Sidecar's [block service](https://github.com/paritytech/substrate-api-sidecar/blob/master/src/services/blocks/BlocksService.ts).

### calc_partial_fee
Tool to calculate an extrinsics' `partial_fee` (i.e. the total fee minus any tip).
It uses the following formula:

```
partial_fee = base_fee + len_fee + ((adjusted_weight_fee/estimated_weight)*actual_weight)
```

Where:
- `base_fee` is a fixed base fee to include some transaction in a block. It accounts
  for the work needed to verify the signature and the computing work common to any tx.
  It is constant for any tx.
- `len_fee` is a fee paid based on the size (length in bytes) of the transaction.
  Longer transactions require more storage, and therefore are more expensive.
- `adjusted_weight_fee` is a fee that is itself `estimated_weight * targeted_fee_adjustment`:
  - `targeted_fee_adjustment` is some adjustment made based on the network load and
    other circumstantial factors, and is an opaque internal value we have no access to.
  - `estimated_weight` is the "pre-dispatch" weight of the transaction. It's set 
    based on the cost of processing the transaction on reference hardware.
- `actual_weight` is the weight that is found in the `ExtrinsicSuccess` event for 
  the extrinsic in a block (it's just called `weight` in the event), and it's 
  value is often close to `estimated_weight`, but the node has the opportunity 
  to change it depending on the actual computing work necessary to process the tx.

The RPC endpoint `payment_queryFeeDetails` returns `base_fee`, `len_fee` and 
`adjusted_weight_fee`. The RPC endpoint `payment_queryInfo` returns `estimated_weight`
(called `weight` in the response), and a `partialFee` value, which is our best 
guess at the inclusion fee for the tx without actually submitting it and seeing
whether the node changes the weight or decides not to take a fee at all.

To get the correct values for some extrinsic from both endpoints, provide the 
extrinsic bytes, and the number of the block **before the block it is included in** 
(e.g. if the extrinsic was in block 100, you'd use block 99 as an argument). This 
is very important.

Once you've called these endpoints, access the `ExtrinsicSuccess` event to find 
the `actual_weight`, but also a `paysFee` value which signals whether the extrinsic 
actually incurred a fee at all or not (a node has the opportunity to refund the 
fee entirely).

With all of those values at hand, the equation above calculates the correct Fee.
Why? Well, the basic way to calculate a pre-dispatch fee is:

```
partial_fee = base_fee + len_fee + adjusted_weight_fee
```

We can do this from just the RPC methods. But then once it's in a block, we need 
to swap out the weight used to calculate that `adjusted_weight_fee` with the 
actual weight that was used from the `ExtrinsicSuccess` event. In the end, the 
calculation itself is simple, but gathering the details needed is the main difficulty.
We do this all in Rust simply to limit any precision loss.

### calc_payout

This is a tool to calculate the payout of a staking era, either for a validator 
or a nominator. This is not a predictive estimation, instead it intakes data 
from a concluded [era](https://wiki.polkadot.network/docs/kusama-parameters#periods-of-common-actions-and-attributes)
to arrive to the final amount. For this it takes the following parameters:
- `total_reward_points` are the total [era points](https://wiki.polkadot.network/docs/maintain-guides-validator-payout#era-points)
  for a determined [era](https://wiki.polkadot.network/docs/kusama-parameters#periods-of-common-actions-and-attributes). 
- `era_payout` is the [payout](https://wiki.polkadot.network/docs/maintain-guides-validator-payout#payout-scheme)
  for a determined [era](https://wiki.polkadot.network/docs/kusama-parameters#periods-of-common-actions-and-attributes).
- `validator_reward_points` are the [era points](https://wiki.polkadot.network/docs/maintain-guides-validator-payout#era-points)
  earned by the validator in a determined [era](https://wiki.polkadot.network/docs/kusama-parameters#periods-of-common-actions-and-attributes). 
- `validator_commission` is the commission that the validator takes of its assigned
  payout before distribituing the remainder between itself and it's nominators.
- `nominator_exposure` is the amount staked by the nominator or validator,
  depending on who we are inquiring about. 
- `total_exposure` the total amount staked.
- `is_validator` is a `bool` that states whether the inquired account is a validator.


## Contributing

We welcome [contributions for documentation and code](https://github.com/paritytech/substrate-api-sidecar/pulls). 
If you have any questions you can reach the maintainers by [filing an issue on github.](https://github.com/paritytech/substrate-api-sidecar/issues)