/* tslint:disable */
/* eslint-disable */
/**
* @param {string} base_fee
* @param {string} len_fee
* @param {string} adjusted_weight_fee
* @param {string} estimated_weight
* @param {string} actual_weight
* @returns {string}
*/
export function calc_partial_fee(base_fee: string, len_fee: string, adjusted_weight_fee: string, estimated_weight: string, actual_weight: string): string;
/**
*/
export class CalcPayout {
  free(): void;
/**
* @param {number} total_reward_points
* @param {string} era_payout
* @returns {CalcPayout}
*/
  static from_params(total_reward_points: number, era_payout: string): CalcPayout;
/**
* @param {number} validator_reward_points
* @param {number} validator_commission
* @param {string} nominator_exposure
* @param {string} total_exposure
* @param {boolean} is_validator
* @returns {string}
*/
  calc_payout(validator_reward_points: number, validator_commission: number, nominator_exposure: string, total_exposure: string, is_validator: boolean): string;
}
