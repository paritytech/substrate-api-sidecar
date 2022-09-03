// Copyright (C) 2022 Parity Technologies (UK) Ltd. (admin@parity.io)
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

/// Uses the following formula to calculate an extrinsics `partial_fee` (ie the total fee
/// minus any tip).
///
/// ```
/// partial_fee = base_fee + len_fee + ((adjusted_weight_fee/estimated_weight)*actual_weight)
/// ```
///
/// Where:
/// - `base_fee` is a fixed base fee to include some transaction in a block. It accounts
///   for the work needed to verify the signature and such and is constant for any tx.
/// - `len_fee` is a fee paid based on the size (length in bytes) of the transaction. Longer
///   transactions require more storage.
/// - `adjusted_weight_fee` is a fee that is itself `estimated_weight * targeted_fee_adjustment`.
///   `targeted_fee_adjustment` is some adjustment made based on the network load and such, and is
///   an opaque internal value we have no access to.
/// - `estimated_weight` is the "pre-dispatch" weight of the transaction. It's set based on the cost
///   of processing the transaction on reference hardware.
/// - `actual_weight` is the weight that is found in the `ExtrinsicSuccess` event for the extrinsic in
///   a block (it's just called `weight` in the event), and is often the same as `estimated_weight`,
///   but the node has the opportunity to change it to whatever it likes, I think.
///
/// The RPC endpoint `payment_queryFeeDetails` returns `base_fee`, `len_fee` and `adjusted_weight_fee`/
/// The RPC endpoint `payment_queryInfo` returns `estimated_weight` (called `weight` in the response), and
/// a `partialFee` value, which is our best guess at the inclusion fee for the tx without actually submitting
/// it and seeing whether the node changes the weight/decides not to take a fee at all.
///
/// To get the correct values for some extrinsic from both endpoints, provide the extrinsic bytes, and the
/// block number **one before the block it made it into** (eg if the extrinsic was in block 100, you'd use
/// block 99 as an argument). This is very important.
///
/// Once you've called these endpoints, access the `ExtrinsicSuccess` event to find the `actual_weight`, but
/// also a `paysFee` value which signals whether the extrinsic actually incurred a fee at all or not (a node
/// has the opportunity to refund the fee entirely if it likes by setting this).
///
/// With all of those values to hand, the equation above calculates the correct Fee. Why? Well, the basic
/// way to calculate a pre-dispatch fee is:
///
/// ```
/// partial_fee = base_fee + len_fee + adjusted_weight_fee
/// ```
///
/// We can do this from just the RPC methods. But then once it's in a block, we need to swap out the weight used
/// to calculate that `adjusted_weight_fee` with the actual weight that was used from the `ExtrinsicSuccess` event.
/// In the end, the maths is simple and gathering the details needed is the main difficulty. We do this all in
/// Rust simply to limit any precision loss.
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
    // calculate new adjusted_weight_fee, trying to maintain precision:
    let adjusted_weight_fee = Perbill::from_rational(estimated_weight, actual_weight) * adjusted_weight_fee;

    // add the fee components together to get the partial/inclusion fee:
    base_fee.saturating_add(len_fee).saturating_add(adjusted_weight_fee)
}

#[cfg(test)]
mod test_fees {
    use super::*;

    fn unwrap<T>(val: Result<T, JsError>) -> T {
        match val {
            Ok(v) => v,
            Err(_e) => panic!("Cannot unwrap result")
        }
    }

    // Fee calculation example 1:
    //
    // Extrinsic Hex:
    // 0x5502840032663236e3cb206fcd0751b43da451089990581becf91cc7bcc48bf5f5a47aaf005baf8efe06ccb5bdd78a1fee70025f4526e6b06419d6acc4555c10d7c164a85bcf61696bdde25a019b2db6e8014ae8d4a12df7d8464f5f512a87d0da01ec10054934a116001f030066470863fba68183688aeeb4f6ed27cbf1085daee54c16cf9caaa7ff0939b27a1700a89123deaa2a8118
    //
    // Network WS URL:    wss://rpc.shiden.astar.network
    // Block number:      1820490
    // Block hash:        0x7b8d40f067cd67191904d43e40225522e491061c170547cf227d791a49e0db62
    // Actual fee:        1611916814889018
    #[test]
    fn shiden_block_1820490_tx() {
        // NOTE: Whatever block number the tx comes from, we use $blockNumber-1 to get the values.
        // It turns out that this is where the values we need should come from.

        // From payment.queryFeeDetails (18 decimal places to 1 SDN):
        //   baseFee: 100.0000 µSDN
        //   lenFee: 1.5100 mSDN
        //   adjustedWeightFee: 1.9168 µSDN
        let base_fee: u128 = 100000000000000;
        let len_fee: u128 = 1510000000000000;
        let adjusted_weight_fee: u128 = 1916814889018;

        // From payment.queryInfo:
        //   weight: 152822000
        //   partialFee: 1611916814889018
        let estimated_weight: u128 = 152822000;

        // From ExtrinsicSuccess event:
        let actual_weight: u128 = 152822000;

        // From https://shiden.subscan.io/extrinsic/1820490-2
        // Also seen in Balances.Withdraw event associated with the tx,
        // so we know this was the total fee amount taken. Also is the
        // actual partialFee, so we are really just testing that our calc
        // call returns this, too.
        let expected_partial_fee = "1611916814889018";

        let actual_partial_fee = calc_partial_fee(
            &base_fee.to_string(),
            &len_fee.to_string(),
            &adjusted_weight_fee.to_string(),
            &estimated_weight.to_string(),
            &actual_weight.to_string()
        );

        assert_eq!(expected_partial_fee, unwrap(actual_partial_fee));
    }

    // Fee calculation example 2:
    //
    // Extrinsic Hex:
    // 0x5502840032663236e3cb206fcd0751b43da451089990581becf91cc7bcc48bf5f5a47aaf00c9e0ce04135a6c150301c53de2f98f9f45cf62025be3e5f28de0769798f855c8bb5cb92aa9cdf4811675122df4e32b21938a3e72be790e1a4fda1c99933c740e192b9d16001f030042d3bfbf83ea4576b85b63b83a58a60ebc5c89e8820ebb92f21926c59be46c1a170040ed0989910d320f
    //
    // Network WS URL:    wss://rpc.shiden.astar.network
    // Block number:      1820341
    // Block hash:        0x9f81ab761c40a03ef14e46197a4c00e44c5ee1d225eb1eee37d4ba6a730dc628
    // Actual fee:        1611917528885264
    #[test]
    fn shiden_block_1820341_tx() {
        // NOTE: Whatever block number the tx comes from, we use $blockNumber-1 to get the values.
        // It turns out that this is where the values we need should come from.

        // From payment.queryFeeDetails:
        let base_fee: u128 = 100000000000000;
        let len_fee: u128 = 1510000000000000;
        let adjusted_weight_fee: u128 = 1917528885264;

        // From payment.queryInfo:
        //   weight: 152822000
        //   partialFee: 1611917528885264
        let estimated_weight: u128 = 152822000;

        // From ExtrinsicSuccess event:
        let actual_weight: u128 = 152822000;

        // From https://shiden.subscan.io/extrinsic/1820341-2
        // Also seen in Balances.Withdraw event associated with the tx,
        // so we know this was the total fee amount taken.
        let expected_partial_fee = "1611917528885264";

        let actual_partial_fee = calc_partial_fee(
            &base_fee.to_string(),
            &len_fee.to_string(),
            &adjusted_weight_fee.to_string(),
            &estimated_weight.to_string(),
            &actual_weight.to_string()
        );

        assert_eq!(expected_partial_fee, unwrap(actual_partial_fee));
    }

    // Fee Calculation Example 3:
    //
    // Extrinsic Hex:
    // 0x4d028400a9a38c06cfb948f7176027985ec9632a690a1f9e8a64f244f749c117f45aaec50053c5dc9b60c3b73ee49b08d35b79755556280520b2121ad795a0130ff1899d2ccdcc8bffc5ea606cb0e8c05138d336945b1c2d7be22c033b239d4c1dee802700c92ded56000a0300daa641169afddb7e3480071c91348155e9d5543f6dcfd8583667183103cbde0f0f003cc373933e01
    //
    // Network WS URL:     wss://acala-rpc-0.aca-api.network
    // Block Number:       1285857
    // Block Hash:         0x0a7ce4030de0d3d9629ca67381f96ca2936f57fa7a73440bc4a55fe2603e9dc1
    // Actual Fee:         2490128143
    #[test]
    fn acala_block_1285857_tx() {
        // NOTE: Whatever block number the tx comes from, we use $blockNumber-1 to get the values.
        // It turns out that this is where the values we need should come from.

        // From payment.queryFeeDetails:
        let adjusted_weight_fee: u128 = 128143;
        let base_fee: u128 = 1000000000;
        let len_fee: u128 = 1490000000;

        // From payment.queryInfo:
        //    weight: 152822000
        //    partialFee: 2490128142
        let estimated_weight: u128 = 152822000;

        // From ExtrinsicSuccess event:
        let actual_weight: u128 = 152822000;

        // From https://acala.subscan.io/extrinsic/1285857-2
        // Also seen in Balances.Withdraw event associated with the tx,
        // so we know this was the total fee amount taken.
        let expected_partial_fee = "2490128143";

        let actual_partial_fee = calc_partial_fee(
            &base_fee.to_string(), 
            &len_fee.to_string(), 
            &adjusted_weight_fee.to_string(), 
            &estimated_weight.to_string(), 
            &actual_weight.to_string()
        );

        assert_eq!(expected_partial_fee, unwrap(actual_partial_fee));
    }
}
