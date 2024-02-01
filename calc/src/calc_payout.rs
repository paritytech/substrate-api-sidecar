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

use crate::debug;
use core::str::FromStr;
use log::info;
use sp_arithmetic::Perbill;
use wasm_bindgen::prelude::*;

type Balance = u128;
type RewardPoint = u32;

#[wasm_bindgen]
#[derive(Debug)]
pub struct CalcPayout {
    total_reward_points: RewardPoint,
    era_payout: Balance,
}

/// ### calc_payout
/// 
/// This is a tool to calculate the payout of a staking era, either for a validator 
/// or a nominator. This is not a predictive estimation, instead it intakes data 
/// from a concluded [era](https://wiki.polkadot.network/docs/kusama-parameters#periods-of-common-actions-and-attributes)
/// to arrive to the final amount. For this it takes the following parameters:
/// - `total_reward_points` are the total [era points](https://wiki.polkadot.network/docs/maintain-guides-validator-payout#era-points)
///   for a determined [era](https://wiki.polkadot.network/docs/kusama-parameters#periods-of-common-actions-and-attributes). 
/// - `era_payout` is the [payout](https://wiki.polkadot.network/docs/maintain-guides-validator-payout#payout-scheme)
///   for a determined [era](https://wiki.polkadot.network/docs/kusama-parameters#periods-of-common-actions-and-attributes).
/// - `validator_reward_points` are the [era points](https://wiki.polkadot.network/docs/maintain-guides-validator-payout#era-points)
///   earned by the validator in a determined [era](https://wiki.polkadot.network/docs/kusama-parameters#periods-of-common-actions-and-attributes). 
/// - `validator_commission` is the commission that the validator takes of its assigned
///   payout before distribituing the remainder between itself and it's nominators.
/// - `nominator_exposure` is the amount staked by the nominator or validator,
///   depending on who we are inquiring about. 
/// - `total_exposure` the total amount staked.
/// - `is_validator` is a `bool` that states whether the inquired account is a validator.
#[wasm_bindgen]
impl CalcPayout {
    pub fn from_params(total_reward_points: u32, era_payout: &str) -> Self {
        debug::setup();

        info!("from_params({}, {}) -> ", total_reward_points, era_payout);

        let calc_payout: CalcPayout = Self {
            total_reward_points: total_reward_points as RewardPoint,
            era_payout: Balance::from_str(era_payout).unwrap(),
        };

        info!("calc_payout: {:#?}", calc_payout);

        calc_payout
    }

    pub fn calc_payout(
        &self,
        validator_reward_points: RewardPoint,
        validator_commission: u32,
        nominator_exposure: &str,
        total_exposure: &str,
        is_validator: bool,
    ) -> String {
        debug::setup();

        info!(
            "calc_payout: ({}, {}, {}, {}, {}) -> ",
            validator_reward_points,
            validator_commission,
            nominator_exposure,
            total_exposure,
            is_validator,
        );

        // This is the fraction of the total reward that will be split between the
        // validator and its nominators
        let validator_total_reward_part: Perbill =
            Perbill::from_rational(validator_reward_points, self.total_reward_points);

        // Using the previous info, here we calculate the portion of the era's reward
        // that the nominator and its validators are entitled to
        let validator_total_payout: u128 = validator_total_reward_part * self.era_payout;        
        // This is the validator's commission, independent of their share of the
        // reward for their stake
        let validator_commission: Perbill = Perbill::from_percent(validator_commission);
        let validator_commission_payout: u128 = validator_commission * validator_total_payout;

        // Subtracting the validator's commission, how much is left to split between
        // the validator and its nominators
        let validator_leftover_payout: u128 = validator_total_payout.saturating_sub(validator_commission_payout);

        let own_exposure: u128 = Balance::from_str(nominator_exposure).unwrap();
        let total_exposure: u128 = Balance::from_str(total_exposure).unwrap();

        // This is the portion of the validator/nominator's leftover payout that
        // the staker is entitled to
        let own_exposure_part: Perbill = Perbill::from_rational(own_exposure, total_exposure);
        
        // This is the payout for the address we are interested in, depending on
        // whether it's a validator or a nominator
        let own_staking_payout: u128 = if is_validator {
            (own_exposure_part * validator_leftover_payout).saturating_add(validator_commission_payout)
        } else {
            own_exposure_part * validator_leftover_payout
        };

        info!(
            "validator_total_payout: {}, validator_commission_payout: {}, \
			 own_exposure_part: {:#?}, validator_leftover_payout: {}, own_staking_payout: {}",
            validator_total_payout,
            validator_commission_payout,
            own_exposure_part,
            validator_leftover_payout,
            own_staking_payout
        );

        own_staking_payout.to_string()
    }
}
