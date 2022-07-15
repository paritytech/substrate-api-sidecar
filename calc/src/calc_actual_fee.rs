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
}
