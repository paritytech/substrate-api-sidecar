mod panic;

use serde_derive::Deserialize;
use sp_arithmetic::{Fixed128, FixedPointNumber, Perbill};
use wasm_bindgen::prelude::*;
use core::str::FromStr;

type Balance = u128;
type Weight = u64;

#[derive(Deserialize)]
#[allow(non_snake_case)]
pub struct JSCoefficient {
	coeffInteger: String,
	coeffFrac: u32,
	negative: bool,
	degree: u8,
}

struct Coefficient {
	coeff_integer: Balance,
	coeff_frac: Perbill,
	negative: bool,
	degree: u8,
}

#[wasm_bindgen]
pub struct CalcFee {
	polynomial: Vec<Coefficient>,
	multiplier: Fixed128,
	per_byte_fee: Balance,
	base_fee: Balance,
	fixed128_bug: bool,
}

#[wasm_bindgen]
impl CalcFee {
	pub fn from_params(
		polynomial: &JsValue,
		extrinsic_base_weight: Weight,
		multiplier: &str,
		per_byte_fee: &str,
		fixed128_bug: bool,
	) -> Self {
		panic::set_hook();
		let polynomial: Vec<Coefficient> = {
			let poly: Vec<JSCoefficient> = polynomial.into_serde().unwrap();
			poly.iter().map(|c|
				Coefficient {
					coeff_integer: Balance::from_str(&c.coeffInteger).unwrap(),
					coeff_frac: Perbill::from_parts(c.coeffFrac),
					negative: c.negative,
					degree: c.degree
				}
			)
			.collect()
		};
		let multiplier = Fixed128::from_inner(i128::from_str(multiplier).unwrap());
		let per_byte_fee = Balance::from_str(per_byte_fee).unwrap();
		let base_fee = weight_to_fee(&extrinsic_base_weight, &polynomial);
		Self {
			polynomial,
			multiplier,
			per_byte_fee,
			base_fee,
			fixed128_bug,
		}
	}

	pub fn calc_fee(&self, weight: Weight, len: u32) -> String {
		panic::set_hook();

		let len_fee = self.per_byte_fee.saturating_mul(len.into());
		let unadjusted_weight_fee = weight_to_fee(&weight, &self.polynomial);

		let adjustable_fee = len_fee.saturating_add(unadjusted_weight_fee);
		let adjusted_fee = if self.fixed128_bug && self.multiplier.is_negative() {
			adjustable_fee
		} else {
			self.multiplier.saturating_mul_acc_int(adjustable_fee)
		};

		self.base_fee.saturating_add(adjusted_fee).to_string()
	}
}

fn weight_to_fee(weight: &Weight, polynomial: &[Coefficient]) -> Balance {
	polynomial.iter().fold(0, |mut acc: Balance, args| {
		let weight: Balance = weight.saturating_pow(args.degree.into()).into();

		let frac = args.coeff_frac * weight;
		let integer = args.coeff_integer.saturating_mul(weight);

		if args.negative {
			acc = acc.saturating_sub(frac);
			acc = acc.saturating_sub(integer);
		} else {
			acc = acc.saturating_add(frac);
			acc = acc.saturating_add(integer);
		}

		acc
	})
}
