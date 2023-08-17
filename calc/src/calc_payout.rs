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

        let calc_payout = Self {
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

        // This is the fraction of the total reward that the validator and the
        // nominators will get.
        let validator_total_reward_part =
            Perbill::from_rational(validator_reward_points, self.total_reward_points);

        // This is how much validator + nominators are entitled to.
        let validator_total_payout = validator_total_reward_part * self.era_payout;

        let validator_commission = Perbill::from_percent(validator_commission);
        let validator_commission_payout = validator_commission * validator_total_payout;

        let validator_leftover_payout = validator_total_payout - validator_commission_payout;

        let own_exposure = Balance::from_str(nominator_exposure).unwrap();
        let total_exposure = Balance::from_str(total_exposure).unwrap();
        // This is the fraction of the validators leftover payout that the staker is entitled to
        let own_exposure_part = Perbill::from_rational(own_exposure, total_exposure);

        // Now let's calculate how this is split to the account
        let own_staking_payout = if is_validator {
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

        println!("{:?}", own_staking_payout);
        own_staking_payout.to_string()
    }
}

#[cfg(test)]
mod test_payout {
    use super::*;

    #[test]
    fn kusama_era_5529_validator() {
        // era: 5529
        // total_reward_points : 6_341_260 api.query.staking.erasRewardPoints.total
        // era_payout: 792_713_971_465_885 gotten from api.query.staking.erasValidatorReward
        // validator: CaxeCQ3JWSrZiRNyCTnE4vT8aMrX1sJDJWCXSwrEpxWkiL5
        // validator_comission: 10 %
        // validator_reward_points: 3_920 api.query.staking.erasRewardPoints
        // total_exposure: 9_676_879_871_438_978 api.query.staking.erasStakers
        // nominator_exposure: 5_545_118_499_777 api.query.staking.erasStakers

        let validator_reward_points = 3_920u32;
        let validator_commission = 10u32;
        let nominator_exposure = String::from("5545118499777");
        let total_exposure = String::from("9676879871438978");
        let is_validator = true;

        let total_reward_points = 6_341_260u32;
        let era_payout = String::from("792713971465885");

        let params = CalcPayout::from_params(total_reward_points, &era_payout);
        println!("{:?}", params);

        let estimated_payout = CalcPayout::calc_payout(
            &params,
            validator_reward_points,
            validator_commission,
            &nominator_exposure,
            &total_exposure,
            is_validator,
        );
        println!("estimated {:?}", estimated_payout);

        let total_actual_payout: Balance = 49256160022; //https://kusama.subscan.io/event?address=CaxeCQ3JWSrZiRNyCTnE4vT8aMrX1sJDJWCXSwrEpxWkiL5&module=staking&event=rewarded&startDate=&endDate=&startBlock=&endBlock=&timeType=date&version=9430
        assert_eq!(estimated_payout, total_actual_payout.to_string())
    }

    #[test]
    fn polkadot_era_1150_validator() {
        // era: 1150
        // total_reward_points : 22_265_020 api.query.staking.erasRewardPoints.total
        // era_payout: 3_213_084_537_093_535 gotten from api.query.staking.erasValidatorReward
        // validator: 14xKzzU1ZYDnzFj7FgdtDAYSMJNARjDc2gNw4XAFDgr4uXgp
        // validator_comission: 3 %
        // validator_reward_points: 56_220 api.query.staking.erasRewardPoints
        // total_exposure: 20_509_805_345_780_557 api.query.staking.erasStakers
        // nominator_exposure: 4_423_101_721_494 api.query.staking.erasStakers

        let validator_reward_points = 56_220u32;
        let validator_commission = 3u32;
        let nominator_exposure = String::from("4423101721494");
        let total_exposure = String::from("20509805345780557");
        let is_validator = true;

        let total_reward_points = 22_265_020u32;
        let era_payout = String::from("3213084537093535");

        let params = CalcPayout::from_params(total_reward_points, &era_payout);
        println!("{:?}", params);

        let estimated_payout = CalcPayout::calc_payout(
            &params,
            validator_reward_points,
            validator_commission,
            &nominator_exposure,
            &total_exposure,
            is_validator,
        );

        let total_actual_payout = Balance::from_str("245091889606").unwrap(); //https://polkadot.subscan.io/extrinsic/16584606-2?event=16584606-230
        assert_eq!(estimated_payout, total_actual_payout.to_string())
    }

    #[test]
    fn polkadot_era_1150_nominator() {
        // era: 1150
        // total_reward_points : 22_265_020 api.query.staking.erasRewardPoints.total
        // era_payout: 3_213_084_537_093_535 gotten from api.query.staking.erasValidatorReward
        // nominator: 1SWFK4bcbDe4FisWjtN5JQ47VYyQDMPfbuiw8WF7UFDw1Zm
        // validator_comission: 3 %
        // validator_reward_points: 56_220 api.query.staking.erasRewardPoints
        // total_exposure: 20_509_805_345_780_557 api.query.staking.erasStakers
        // nominator_exposure: 444_042_232_428_190 api.query.staking.erasStakers

        let validator_reward_points = 56_220u32;
        let validator_commission = 3u32;
        let nominator_exposure = String::from("444042232428190");
        let total_exposure = String::from("20509805345780557");
        let is_validator = false;

        let total_reward_points = 22_265_020u32;
        let era_payout = String::from("3213084537093535");

        let params = CalcPayout::from_params(total_reward_points, &era_payout);
        println!("{:?}", params);

        let estimated_payout = CalcPayout::calc_payout(
            &params,
            validator_reward_points,
            validator_commission,
            &nominator_exposure,
            &total_exposure,
            is_validator,
        );
        println!("estimation {:?}", estimated_payout);

        let total_actual_payout = Balance::from_str("170382257338").unwrap(); //https://polkadot.subs can.io/extrinsic/16584606-2?event=16584606-230
        assert_eq!(estimated_payout, total_actual_payout.to_string())
    }
}
