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

        /*
        This is the fraction of the total reward that will be split between the
        validator and its nominators
        */
        let validator_total_reward_part: Perbill =
            Perbill::from_rational(validator_reward_points, self.total_reward_points);

        /*
        Using the previous info, here we calculate the portion of the era's reward
        that the nominator and its validators are entitled to
        */
        let validator_total_payout: u128 = validator_total_reward_part * self.era_payout;

        /*
        This is the validator's commission, independent of their share of the
        reward for their stake
        */
        let validator_commission: Perbill = Perbill::from_percent(validator_commission);
        let validator_commission_payout: u128 = validator_commission * validator_total_payout;

        /*
        Subtracting the validator's commission, how much is left to split between
        the validator and its nominators
        */
        let validator_leftover_payout: u128 = validator_total_payout - validator_commission_payout;

        let own_exposure: u128 = Balance::from_str(nominator_exposure).unwrap();
        let total_exposure: u128 = Balance::from_str(total_exposure).unwrap();

        /*
        This is the portion of the validator/nominator's leftover payout that
        the staker is entitled to
        */
        let own_exposure_part: Perbill = Perbill::from_rational(own_exposure, total_exposure);

        /*
        This is the payout for the address we are interested in, depending on
        whether it's a validator or a nominator
        */
        let own_staking_payout: u128 = if is_validator {
            own_exposure_part * validator_leftover_payout + validator_commission_payout
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

#[cfg(test)]
mod test_payout {
    use super::*;
    /*
    These tests are designed to test the accuracy of the preceding functions.
    All the data can be retrieved and checked with polkadot-js and subscan.io.
    */
    #[test]
    fn kusama_era_5529_validator() {
        /*
        Parameters:
            era: 5529
            total_reward_points: 6_341_260 retrieved via api.query.staking.erasRewardPoints
            era_payout: 792_713_971_465_885 retrieved via api.query.staking.erasValidatorReward
            validator: CaxeCQ3JWSrZiRNyCTnE4vT8aMrX1sJDJWCXSwrEpxWkiL5
            validator_reward_points: 3_920 retrieved via api.query.staking.erasRewardPoints
            validator_commission: 10 % retrieved via api.query.staking.erasValidatorPrefs
            nominator_exposure: 5_545_118_499_777 retrieved via api.query.staking.erasStakers
            total_exposure: 9_676_879_871_438_978 retrieved via api.query.staking.erasStakers
        */

        let total_reward_points = 6_341_260u32;
        let era_payout = String::from("792713971465885");

        let params = CalcPayout::from_params(total_reward_points, &era_payout);

        let validator_reward_points = 3_920u32;
        let validator_commission = 10u32;
        let nominator_exposure = String::from("5545118499777");
        let total_exposure = String::from("9676879871438978");
        let is_validator = true;

        let estimated_payout = CalcPayout::calc_payout(
            &params,
            validator_reward_points,
            validator_commission,
            &nominator_exposure,
            &total_exposure,
            is_validator,
        );

        //https://kusama.subscan.io/event?address=CaxeCQ3JWSrZiRNyCTnE4vT8aMrX1sJDJWCXSwrEpxWkiL5&module=staking&event=rewarded&startDate=&endDate=&startBlock=&endBlock=&timeType=date&version=9430
        let total_actual_payout = "49256160022";
        assert_eq!(estimated_payout, total_actual_payout)
    }

    #[test]
    fn polkadot_era_1150_validator() {
        /*
        Parameters:
            era: 1150
            total_reward_points: 22_265_020 retrieved via api.query.staking.erasRewardPoints
            era_payout: 3_213_084_537_093_535 retrieved via api.query.staking.erasValidatorReward
            validator: 14xKzzU1ZYDnzFj7FgdtDAYSMJNARjDc2gNw4XAFDgr4uXgp
            validator_reward_points: 56_220 retrieved via api.query.staking.erasRewardPoints
            validator_commission: 3 % retrieved via api.query.staking.erasValidatorPrefs
            nominator_exposure: 4_423_101_721_494 retrieved via api.query.staking.erasStakers
            total_exposure: 20_509_805_345_780_557 retrieved via api.query.staking.erasStakers
        */

        let total_reward_points = 22_265_020u32;
        let era_payout = String::from("3213084537093535");

        let params = CalcPayout::from_params(total_reward_points, &era_payout);

        let validator_reward_points = 56_220u32;
        let validator_commission = 3u32;
        let nominator_exposure = String::from("4423101721494");
        let total_exposure = String::from("20509805345780557");
        let is_validator = true;

        let estimated_payout = CalcPayout::calc_payout(
            &params,
            validator_reward_points,
            validator_commission,
            &nominator_exposure,
            &total_exposure,
            is_validator,
        );

        //https://polkadot.subscan.io/extrinsic/16584606-2?event=16584606-230
        let total_actual_payout: &str = "245091889606";
        assert_eq!(estimated_payout, total_actual_payout)
    }

    #[test]
    fn polkadot_era_1150_nominator() {
        /*
        Parameters:
            era: 1150
            total_reward_points: 22_265_020 retrieved via api.query.staking.erasRewardPoints
            era_payout: 3_213_084_537_093_535 retrieved via api.query.staking.erasValidatorReward
            validator: 12MgK2Sc8Rrh6DXS2gDrt7fWJ24eGeVb23NALbZLMw1grnkL
            nominator: 14xA7KotR6pxt3LpgdZz8BDv3fyokWnP67bBnN6tsCWn5wsF
            validator_reward_points: 74_280 retrieved via api.query.staking.erasRewardPoints
            validator_commission: 3 % retrieved via api.query.staking.erasValidatorPrefs
            nominator_exposure: 4_669_514_624_960 retrieved via api.query.staking.erasStakers
            total_exposure: 20_509_805_345_780_557 retrieved via api.query.staking.erasStakers
        */

        let total_reward_points = 22_265_020u32;
        let era_payout = String::from("3213084537093535");

        let params = CalcPayout::from_params(total_reward_points, &era_payout);

        let validator_reward_points = 74_280u32;
        let validator_commission = 2u32;
        let nominator_exposure = String::from("4669514624960");
        let total_exposure = String::from("20509838437005865");
        let is_validator = false;

        let estimated_payout = CalcPayout::calc_payout(
            &params,
            validator_reward_points,
            validator_commission,
            &nominator_exposure,
            &total_exposure,
            is_validator,
        );

        //https://polkadot.subscan.io/extrinsic/16584521-2?event=16584521-1840
        let total_actual_payout: &str = "2391688616";
        assert_eq!(estimated_payout, total_actual_payout)
    }
}
