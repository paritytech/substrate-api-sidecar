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

use crate::debug;
use core::str::FromStr;
use std::ops::Div;

use sp_arithmetic::{FixedU128, FixedPointNumber};
use sp_arithmetic::traits::{Saturating};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, PartialEq)]
pub struct CalcActualFee {
    fee: FixedU128,
}

/// 
#[wasm_bindgen]
impl CalcActualFee {
    pub fn calc(
        base_fee: &str,
        len_fee: &str,
        adjusted_weight_fee: &str,
        estimated_weight: &str,
        actual_weight: &str
    ) -> Option<CalcActualFee> {
        debug::setup();

        let fixed_base_fee = new_u128(base_fee);
        let fixed_len_fee = new_u128(len_fee);
        let fixed_adjusted_weight_fee = new_u128(adjusted_weight_fee);
        let fixed_estimated_weight = new_u128(estimated_weight);
        let fixed_actual_weight = new_u128(actual_weight);

        let fee_sum = fixed_base_fee.saturating_add(fixed_len_fee);
        let div_weight = fixed_adjusted_weight_fee.div(fixed_estimated_weight);
        let weight_fee = div_weight.saturating_mul(fixed_actual_weight);
        println!("{}, {}, {}", fee_sum.into_inner(), div_weight.into_inner(), weight_fee.into_inner());
        let result = Self {
            fee: fee_sum.saturating_add(weight_fee)
        };
        Some(result)
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

        let expected_res = new_u128("2490128143");
        let actual_fee = CalcActualFee::calc(base_fee, len_fee, adjusted_weight_fee, estimated_weight, actual_weight);

        assert_eq!(actual_fee.unwrap().fee.into_inner(), expected_res.into_inner());
    }
}
