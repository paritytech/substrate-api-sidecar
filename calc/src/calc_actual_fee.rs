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

use core::str::FromStr;

use sp_arithmetic::Perbill;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, PartialEq)]
pub struct CalcActualFee {
    actual_fee: u128,
}

/// Uses the following formula to calculate an extrinsics `actual_fee`.
///
/// (base_fee + len_fee)+((adjusted_weight_fee/estimated_weight)*actual_weight)
#[wasm_bindgen]
impl CalcActualFee {
    pub fn calc(
        base_fee: &str,
        len_fee: &str,
        adjusted_weight_fee: &str,
        estimated_weight: &str,
        actual_weight: &str
    ) -> CalcActualFee {
        let fee_sum = new_u128(base_fee).saturating_add(new_u128(len_fee));
        let actual_fee = Self::calc_actual_fee(
            fee_sum,
            new_u128(adjusted_weight_fee),
            new_u128(estimated_weight),
            new_u128(actual_weight)
        );

        Self {
            actual_fee
        }
    }

    /// Handle (base_fee + len_fee)+((adjusted_weight_fee/estimated_weight)*actual_weight)
    fn calc_actual_fee(
        sum: u128,
        adj_weight: u128,
        est_weight: u128,
        weight: u128) -> u128
    {
        let a = Perbill::from_rational(adj_weight, est_weight);
        (a * weight) + sum
    }

}

fn new_u128(inner: &str) -> u128 {
    u128::from_str(inner).unwrap()
}

#[cfg(test)]
mod test_fees {
    use super::new_u128;

    use super::CalcActualFee;

    #[test]
    fn calc() {
        let adjusted_weight_fee = "128142";
        let estimated_weight = "152822000";
        let actual_weight = "152822000";
        let base_fee = "1000000000";
        let len_fee = "1490000000";

        let actual_fee = CalcActualFee::calc(base_fee, len_fee, adjusted_weight_fee, estimated_weight, actual_weight);

        assert_eq!(actual_fee.actual_fee, new_u128("2490128143"));
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
        // From payment.queryFeeDetails (18 decimal places to 1 SDN):
        //   baseFee: 100.0000 µSDN
        //   lenFee: 1.5100 mSDN
        //   adjustedWeightFee: 1.9168 µSDN
        let base_fee: u128 = 100_000_000_000_000;
        let len_fee: u128 = 1_510_000_000_000_000;
        let adjusted_weight_fee: u128 = 1_916_800_000_000;

        // From payment.queryInfo:
        //   weight: 152,822,000
        //   partialFee: 1.6119 mSDN
        let estimated_weight: u128 = 152_822_000;

        // From ExtrinsicSuccess event:
        let actual_weight: u128 = 152_822_000;

        // From https://shiden.subscan.io/extrinsic/1820490-2
        // Also seen in Balances.Withjdraw event associated with the tx,
        // so we know this was the total fee amount taken.
        let expected_partial_fee = "1611916814889018";

        let actual_partial_fee = CalcActualFee::calc(
            &base_fee.to_string(),
            &len_fee.to_string(),
            &adjusted_weight_fee.to_string(),
            &estimated_weight.to_string(),
            &actual_weight.to_string()
        );

        assert_eq!(expected_partial_fee, actual_partial_fee.actual_fee.to_string());
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
        // From payment.queryFeeDetails (18 decimal places to 1 SDN):
        //   baseFee: 100.0000 µSDN
        //   lenFee: 1.5100 mSDN
        //   adjustedWeightFee: 1.9175 µSDN
        let base_fee: u128 = 100_000_000_000_000;
        let len_fee: u128 = 1_510_000_000_000_000;
        let adjusted_weight_fee: u128 = 1_917_500_000_000;

        // From payment.queryInfo:
        //   weight: 152,822,000
        //   partialFee: 1.6119 mSDN
        let estimated_weight: u128 = 152_822_000;

        // From ExtrinsicSuccess event:
        let actual_weight: u128 = 152_822_000;

        // From https://shiden.subscan.io/extrinsic/1820341-2
        // Also seen in Balances.Withjdraw event associated with the tx,
        // so we know this was the total fee amount taken.
        let expected_partial_fee = "1611917528885264";

        let actual_partial_fee = CalcActualFee::calc(
            &base_fee.to_string(),
            &len_fee.to_string(),
            &adjusted_weight_fee.to_string(),
            &estimated_weight.to_string(),
            &actual_weight.to_string()
        );

        assert_eq!(expected_partial_fee, actual_partial_fee.actual_fee.to_string());
    }
}
