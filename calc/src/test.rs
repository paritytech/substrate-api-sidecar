#[cfg(test)]
mod tests {
    use crate::{calc_partial_fee::calc_partial_fee, calc_payout::CalcPayout};
    use wasm_bindgen::prelude::*;

    fn unwrap<T>(val: Result<T, JsError>) -> T {
        match val {
            Ok(v) => v,
            Err(_e) => panic!("Cannot unwrap result"),
        }
    }

    /// Fee calculation example 1:
    /// Extrinsic Hex:
    /// 0x5502840032663236e3cb206fcd0751b43da451089990581becf91cc7bcc48bf5f5a47aaf005baf8efe06ccb5bdd78a1fee70025f4526e6b06419d6acc4555c10d7c164a85bcf61696bdde25a019b2db6e8014ae8d4a12df7d8464f5f512a87d0da01ec10054934a116001f030066470863fba68183688aeeb4f6ed27cbf1085daee54c16cf9caaa7ff0939b27a1700a89123deaa2a8118
    /// Network WS URL:    wss://rpc.shiden.astar.network
    /// Block number:      1820490
    /// Block hash:        0x7b8d40f067cd67191904d43e40225522e491061c170547cf227d791a49e0db62
    /// Actual fee:        1611916814889018
    #[test]
    fn shiden_block_1820490_tx() {
        // **NOTE**: Whatever block number the tx comes from, we use $blockNumber-1 to get the values.
        // It turns out that this is where the values we need should come from.
        
        // From payment.queryFeeDetails (18 decimal places to 1 SDN):
        //      baseFee: 100.0000 µSDN
        //      lenFee: 1.5100 mSDN
        //      adjustedWeightFee: 1.9168 µSDN
        let base_fee: u128 = 100000000000000;
        let len_fee: u128 = 1510000000000000;
        let adjusted_weight_fee: u128 = 1916814889018;
        
        // From payment.queryInfo:
        //      weight: 152822000
        //      partialFee: 1611916814889018
        let estimated_weight: u128 = 152822000;
        
        // From ExtrinsicSuccess event:
        let actual_weight: u128 = 152822000;

        // From https://shiden.subscan.io/extrinsic/1820490-2
        // Also seen in Balances.Withdraw event associated with the tx,
        // so we know this was the total fee amount taken. Also is the
        // actual partialFee, so we are really just testing that our calc
        // call returns this, too.
        let expected_partial_fee = "1611916814889018";

        let actual_partial_fee = calc_partial_fee(
            &base_fee.to_string(),
            &len_fee.to_string(),
            &adjusted_weight_fee.to_string(),
            &estimated_weight.to_string(),
            &actual_weight.to_string(),
        );

        assert_eq!(expected_partial_fee, unwrap(actual_partial_fee));
    }
    
    /// Fee calculation example 2:
    /// 
    /// Extrinsic Hex:
    /// 0x5502840032663236e3cb206fcd0751b43da451089990581becf91cc7bcc48bf5f5a47aaf00c9e0ce04135a6c150301c53de2f98f9f45cf62025be3e5f28de0769798f855c8bb5cb92aa9cdf4811675122df4e32b21938a3e72be790e1a4fda1c99933c740e192b9d16001f030042d3bfbf83ea4576b85b63b83a58a60ebc5c89e8820ebb92f21926c59be46c1a170040ed0989910d320f
    /// 
    /// Network WS URL:    wss://rpc.shiden.astar.network
    /// Block number:      1820341
    /// Block hash:        0x9f81ab761c40a03ef14e46197a4c00e44c5ee1d225eb1eee37d4ba6a730dc628
    /// Actual fee:        1611917528885264
    
    #[test]
    fn shiden_block_1820341_tx() {
        // **NOTE**: Whatever block number the tx comes from, we use $blockNumber-1 to get the values.
        // It turns out that this is where the values we need should come from.

        // From payment.queryFeeDetails:
        let base_fee: u128 = 100000000000000;
        let len_fee: u128 = 1510000000000000;
        let adjusted_weight_fee: u128 = 1917528885264;

        // From payment.queryInfo:
        //      weight: 152822000
        //      partialFee: 1611917528885264
        let estimated_weight: u128 = 152822000;

        // From ExtrinsicSuccess event:
        let actual_weight: u128 = 152822000;

        // From https://shiden.subscan.io/extrinsic/1820341-2
        // Also seen in Balances.Withdraw event associated with the tx,
        // so we know this was the total fee amount taken.
        let expected_partial_fee = "1611917528885264";

        let actual_partial_fee = calc_partial_fee(
            &base_fee.to_string(),
            &len_fee.to_string(),
            &adjusted_weight_fee.to_string(),
            &estimated_weight.to_string(),
            &actual_weight.to_string(),
        );

        assert_eq!(expected_partial_fee, unwrap(actual_partial_fee));
    }

    /// Fee Calculation Example 3:
    /// 
    /// Extrinsic Hex:
    /// 0x4d028400a9a38c06cfb948f7176027985ec9632a690a1f9e8a64f244f749c117f45aaec50053c5dc9b60c3b73ee49b08d35b79755556280520b2121ad795a0130ff1899d2ccdcc8bffc5ea606cb0e8c05138d336945b1c2d7be22c033b239d4c1dee802700c92ded56000a0300daa641169afddb7e3480071c91348155e9d5543f6dcfd8583667183103cbde0f0f003cc373933e01
    /// 
    /// Network WS URL:     wss://acala-rpc-0.aca-api.network
    /// Block Number:       1285857
    /// Block Hash:         0x0a7ce4030de0d3d9629ca67381f96ca2936f57fa7a73440bc4a55fe2603e9dc1
    /// Actual Fee:         2490128143
    #[test]
    fn acala_block_1285857_tx() {
        
        // **NOTE**: Whatever block number the tx comes from, we use $blockNumber-1 to get the values.
        // It turns out that this is where the values we need should come from.
        // 
        // From payment.queryFeeDetails:
        let adjusted_weight_fee: u128 = 128143;
        let base_fee: u128 = 1000000000;
        let len_fee: u128 = 1490000000;

        // From payment.queryInfo:
        //      weight: 152822000
        //      partialFee: 2490128142
        let estimated_weight: u128 = 152822000;

        // From ExtrinsicSuccess event:
        let actual_weight: u128 = 152822000;

        // From https://acala.subscan.io/extrinsic/1285857-2
        // Also seen in Balances.Withdraw event associated with the tx,
        // so we know this was the total fee amount taken.
        let expected_partial_fee = "2490128143";

        let actual_partial_fee = calc_partial_fee(
            &base_fee.to_string(),
            &len_fee.to_string(),
            &adjusted_weight_fee.to_string(),
            &estimated_weight.to_string(),
            &actual_weight.to_string(),
        );

        assert_eq!(expected_partial_fee, unwrap(actual_partial_fee));
    }
    
    /// These tests are designed to test the accuracy of the preceding functions.
    /// All the data can be retrieved and checked with polkadot-js and subscan.io
    /// with the era and block_number.
    #[test]
    fn kusama_era_5529_validator() {
        // Parameters:
        //     block_number: 19259255
        //     era: 5529
        //     total_reward_points: 6_341_260
        //     era_payout: 792_713_971_465_885
        //     validator: CaxeCQ3JWSrZiRNyCTnE4vT8aMrX1sJDJWCXSwrEpxWkiL5
        //     validator_reward_points: 3_920
        //     validator_commission: 10 %
        //     nominator_exposure: 5_545_118_499_777
        //     total_exposure: 9_676_879_871_438_978
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

        // https://kusama.subscan.io/extrinsic/19259255-4?event=19259255-60
        let total_actual_payout = "49256160022";
        assert_eq!(estimated_payout, total_actual_payout)
    }

    #[test]
    fn polkadot_era_1150_validator() {
        // Parameters:
        //     block_number: 16584606
        //     era: 1150
        //     total_reward_points: 22_265_020
        //     era_payout: 3_213_084_537_093_535
        //     validator: 14xKzzU1ZYDnzFj7FgdtDAYSMJNARjDc2gNw4XAFDgr4uXgp
        //     validator_reward_points: 56_220
        //     validator_commission: 3 %
        //     nominator_exposure: 4_423_101_721_494
        //     total_exposure: 20_509_805_345_780_557
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

        // https://polkadot.subscan.io/extrinsic/16584606-2?event=16584606-230
        let total_actual_payout: &str = "245091889606";
        assert_eq!(estimated_payout, total_actual_payout)
    }

    #[test]
    fn polkadot_era_1150_nominator() {
        // Parameters:
        //     block_number: 16584521
        //     era: 1150
        //     total_reward_points: 22_265_020
        //     era_payout: 3_213_084_537_093_535
        //     validator: 12MgK2Sc8Rrh6DXS2gDrt7fWJ24eGeVb23NALbZLMw1grnkL
        //     nominator: 14xA7KotR6pxt3LpgdZz8BDv3fyokWnP67bBnN6tsCWn5wsF
        //     validator_reward_points: 74_280
        //     validator_commission: 3 %
        //     nominator_exposure: 4_669_514_624_960
        //     total_exposure: 20_509_805_345_780_557
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

        // https://polkadot.subscan.io/extrinsic/16584521-2?event=16584521-1840
        let total_actual_payout: &str = "2391688616";
        assert_eq!(estimated_payout, total_actual_payout)
    }
}
