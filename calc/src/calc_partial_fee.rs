// Copyright (C) 2022-2024 Parity Technologies (UK) Ltd. (admin@parity.io)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//         http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use sp_arithmetic::Perbill;
use wasm_bindgen::prelude::*;

/// ### calc_partial_fee
/// 
/// Tool to calculate an extrinsics' `partial_fee` (i.e. the total fee minus any tip).
/// It uses the following formula:
/// 
/// ```
/// partial_fee = base_fee + len_fee + ((adjusted_weight_fee/estimated_weight)*actual_weight)
/// ```
/// 
/// Where:
/// - `base_fee` is a fixed base fee to include some transaction in a block. It accounts
///   for the work needed to verify the signature and the computing work common to any tx.
///   It is constant for any tx.
/// - `len_fee` is a fee paid based on the size (length in bytes) of the transaction.
///   Longer transactions require more storage, and therefore are more expensive.
/// - `adjusted_weight_fee` is a fee that is itself `estimated_weight * targeted_fee_adjustment`:
///   - `targeted_fee_adjustment` is some adjustment made based on the network load and
///     other circumstantial factors, and is an opaque internal value we have no access to.
///   - `estimated_weight` is the "pre-dispatch" weight of the transaction. It's set 
///     based on the cost of processing the transaction on reference hardware.
/// - `actual_weight` is the weight that is found in the `ExtrinsicSuccess` event for 
///   the extrinsic in a block (it's just called `weight` in the event), and it's 
///   value is often close to `estimated_weight`, but the node has the opportunity 
///   to change it depending on the actual computing work necessary to process the tx.
/// 
/// The RPC endpoint `payment_queryFeeDetails` returns `base_fee`, `len_fee` and 
/// `adjusted_weight_fee`. The RPC endpoint `payment_queryInfo` returns `estimated_weight`
/// (called `weight` in the response), and a `partialFee` value, which is our best 
/// guess at the inclusion fee for the tx without actually submitting it and seeing
/// whether the node changes the weight or decides not to take a fee at all.
/// 
/// To get the correct values for some extrinsic from both endpoints, provide the 
/// extrinsic bytes, and the number of the block **before the block it is included in** 
/// (e.g. if the extrinsic was in block 100, you'd use block 99 as an argument). This 
/// is very important.
/// 
/// Once you've called these endpoints, access the `ExtrinsicSuccess` event to find 
/// the `actual_weight`, but also a `paysFee` value which signals whether the extrinsic 
/// actually incurred a fee at all or not (a node has the opportunity to refund the 
/// fee entirely).
/// 
/// With all of those values at hand, the equation above calculates the correct Fee.
/// Why? Well, the basic way to calculate a pre-dispatch fee is:
/// 
/// ```
/// partial_fee = base_fee + len_fee + adjusted_weight_fee
/// ```
/// 
/// We can do this from just the RPC methods. But then once it's in a block, we need 
/// to swap out the weight used to calculate that `adjusted_weight_fee` with the 
/// actual weight that was used from the `ExtrinsicSuccess` event. In the end, the 
/// calculation itself is simple, but gathering the details needed is the main difficulty.
/// We do this all in Rust simply to limit any precision loss.
#[wasm_bindgen]
pub fn calc_partial_fee(
    base_fee: &str,
    len_fee: &str,
    adjusted_weight_fee: &str,
    estimated_weight: &str,
    actual_weight: &str
) -> Result<String, JsError> {
    let base_fee: u128 = base_fee.parse()?;
    let len_fee: u128 = len_fee.parse()?;
    let adjusted_weight_fee: u128 = adjusted_weight_fee.parse()?;
    let estimated_weight: u128 = estimated_weight.parse()?;
    let actual_weight: u128 = actual_weight.parse()?;

    let partial_fee = calc_raw(
        base_fee,
        len_fee,
        adjusted_weight_fee,
        estimated_weight,
        actual_weight
    );

    Ok(partial_fee.to_string())
}

fn calc_raw(
    base_fee: u128,
    len_fee: u128,
    adjusted_weight_fee: u128,
    estimated_weight: u128,
    actual_weight: u128
) -> u128 {

    // Calculate new adjusted_weight_fee, trying to maintain precision.
    let adjusted_weight_fee = Perbill::from_rational(estimated_weight, actual_weight) * adjusted_weight_fee;
    // Add the fee components together to get the partial/inclusion fee and return
    // the result.
    base_fee.saturating_add(len_fee).saturating_add(adjusted_weight_fee)
}
