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
            Perbill::from_rational_approximation(validator_reward_points, self.total_reward_points);

        // This is how much validator + nominators are entitled to.
        let validator_total_payout = validator_total_reward_part * self.era_payout;

        let validator_commission = Perbill::from_parts(validator_commission);
        let validator_commission_payout = validator_commission * validator_total_payout;

        let validator_leftover_payout = validator_total_payout - validator_commission_payout;

        let own_exposure = Balance::from_str(nominator_exposure).unwrap();
        let total_exposure = Balance::from_str(total_exposure).unwrap();
        // This is the fraction of the validators leftover payout that the staker is entitled to
        let own_exposure_part = Perbill::from_rational_approximation(own_exposure, total_exposure);

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

        own_staking_payout.to_string()
    }
}
