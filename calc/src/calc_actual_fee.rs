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
use std::ops::Div;

use sp_arithmetic::FixedU128;
use sp_arithmetic::traits::Saturating;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, PartialEq)]
pub struct CalcActualFee {
    actual_fee: FixedU128,
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
        let fixed_base_fee = new_u128(base_fee);
        let fixed_len_fee = new_u128(len_fee);

        let fee_sum = fixed_base_fee.saturating_add(fixed_len_fee);
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
        sum: FixedU128, 
        adj_weight: FixedU128, 
        est_weight: FixedU128, 
        weight: FixedU128) -> FixedU128 
    {
        adj_weight.div(est_weight).saturating_mul(weight).saturating_add(sum)
    }
    
}

fn new_u128(inner: &str) -> FixedU128 {
    FixedU128::from_inner(u128::from_str(inner).unwrap())
}

#[cfg(test)]
mod test_fees {
    use sp_arithmetic::FixedPointNumber;
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

        assert_eq!(actual_fee.actual_fee.into_inner(), new_u128("2490128143").into_inner());
    }
}
