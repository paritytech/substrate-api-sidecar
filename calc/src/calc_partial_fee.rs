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
    let adjusted_weight_fee = Perbill::from_rational(estimated_weight, actual_weight) * adjusted_weight_fee;

    base_fee.saturating_add(len_fee).saturating_add(adjusted_weight_fee)
}
