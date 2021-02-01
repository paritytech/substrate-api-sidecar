/* tslint:disable */
/* eslint-disable */
/**
*/
export class CalcFee {
  free(): void;
/**
* @param {any} polynomial
* @param {string} multiplier
* @param {string} per_byte_fee
* @param {string} spec_name
* @param {number} spec_version
* @returns {CalcFee | undefined}
*/
  static from_params(polynomial: any, multiplier: string, per_byte_fee: string, spec_name: string, spec_version: number): CalcFee | undefined;
/**
* @param {BigInt} weight
* @param {number} len
* @param {BigInt} extrinsic_base_weight
* @returns {string}
*/
  calc_fee(weight: BigInt, len: number, extrinsic_base_weight: BigInt): string;
}
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
