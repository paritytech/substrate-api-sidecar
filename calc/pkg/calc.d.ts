/* tslint:disable */
/* eslint-disable */
/**
* Uses the following formula to calculate an extrinsics `partial_fee` (ie the total fee
* minus any tip).
*
* ```
* partial_fee = base_fee + len_fee + ((adjusted_weight_fee/estimated_weight)*actual_weight)
* ```
*
* Where:
* - `base_fee` is a fixed base fee to include some transaction in a block. It accounts
*   for the work needed to verify the signature and such and is constant for any tx.
* - `len_fee` is a fee paid based on the size (length in bytes) of the transaction. Longer
*   transactions require more storage.
* - `adjusted_weight_fee` is a fee that is itself `estimated_weight * targeted_fee_adjustment`.
*   `targeted_fee_adjustment` is some adjustment made based on the network load and such, and is
*   an opaque internal value we have no access to.
* - `estimated_weight` is the "pre-dispatch" weight of the transaction. It's set based on the cost
*   of processing the transaction on reference hardware.
* - `actual_weight` is the weight that is found in the `ExtrinsicSuccess` event for the extrinsic in
*   a block (it's just called `weight` in the event), and is often the same as `estimated_weight`,
*   but the node has the opportunity to change it to whatever it likes, I think.
*
* The RPC endpoint `payment_queryFeeDetails` returns `base_fee`, `len_fee` and `adjusted_weight_fee`/
* The RPC endpoint `payment_queryInfo` returns `estimated_weight` (called `weight` in the response), and
* a `partialFee` value, which is our best guess at the inclusion fee for the tx without actually submitting
* it and seeing whether the node changes the weight/decides not to take a fee at all.
*
* To get the correct values for some extrinsic from both endpoints, provide the extrinsic bytes, and the
* block number **one before the block it made it into** (eg if the extrinsic was in block 100, you'd use
* block 99 as an argument). This is very important.
*
* Once you've called these endpoints, access the `ExtrinsicSuccess` event to find the `actual_weight`, but
* also a `paysFee` value which signals whether the extrinsic actually incurred a fee at all or not (a node
* has the opportunity to refund the fee entirely if it likes by setting this).
*
* With all of those values to hand, the equation above calculates the correct Fee. Why? Well, the basic
* way to calculate a pre-dispatch fee is:
*
* ```
* partial_fee = base_fee + len_fee + adjusted_weight_fee
* ```
*
* We can do this from just the RPC methods. But then once it's in a block, we need to swap out the weight used
* to calculate that `adjusted_weight_fee` with the actual weight that was used from the `ExtrinsicSuccess` event.
* In the end, the maths is simple and gathering the details needed is the main difficulty. We do this all in
* Rust simply to limit any precision loss.
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
