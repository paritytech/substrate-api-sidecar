// Copyright 2020 Parity Technologies (UK) Ltd.
// This file is part of Substrate.

// Substrate is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Substrate is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Substrate.  If not, see <http://www.gnu.org/licenses/>.

use codec::{Decode, Encode};
use crate::{
	traits::{Bounded, Saturating, UniqueSaturatedInto, SaturatedConversion}, Perquintill,
};
use sp_std::{
	convert::TryFrom,
	fmt,
	ops,
};

/// A signed fixed-point number.
/// Can hold any value in the range [-170_141_183_460_469_231_731, 170_141_183_460_469_231_731]
/// with fixed-point accuracy of 10 ** 18.
#[derive(Encode, Decode, Default, Copy, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Fixed128(i128);

const DIV: i128 = 1_000_000_000_000_000_000;

impl Fixed128 {
	/// Raw constructor. Equal to `parts / DIV`.
	pub const fn from_parts(parts: i128) -> Self {
		Self(parts)
	}

	/// Performs a saturated multiply and accumulate by unsigned number.
	///
	/// Returns a saturated `int + (self * int)`.
	pub fn saturated_multiply_accumulate<N>(self, int: N) -> N
		where
			N: TryFrom<u128> + From<u64> + UniqueSaturatedInto<u64> + Bounded + Clone + Saturating +
			ops::Rem<N, Output=N> + ops::Div<N, Output=N> + ops::Mul<N, Output=N> +
			ops::Add<N, Output=N>,
	{
		let div = DIV as u128;
		let positive = self.0 > 0;
		// safe to convert as absolute value.
		let parts = self.0.checked_abs().map(|v| v as u128).unwrap_or(i128::max_value() as u128 + 1);


		// will always fit.
		let natural_parts = parts / div;
		// might saturate.
		let natural_parts: N = natural_parts.saturated_into();
		// fractional parts can always fit into u64.
		let perquintill_parts = (parts % div) as u64;

		let n = int.clone().saturating_mul(natural_parts);
		let p = Perquintill::from_parts(perquintill_parts) * int.clone();

		// everything that needs to be either added or subtracted from the original weight.
		let excess = n.saturating_add(p);

		if positive {
			int.saturating_add(excess)
		} else {
			int.saturating_sub(excess)
		}
	}
}


impl fmt::Debug for Fixed128 {
	#[cfg(feature = "std")]
	fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
		let integral = {
			let int = self.0 / DIV;
			let signum_for_zero = if int == 0 && self.is_negative() { "-" } else { "" };
			format!("{}{}", signum_for_zero, int)
		};
		let fractional = format!("{:0>18}", (self.0 % DIV).abs());
		write!(f, "Fixed128({}.{})", integral, fractional)
	}

	#[cfg(not(feature = "std"))]
	fn fmt(&self, _: &mut fmt::Formatter) -> fmt::Result {
		Ok(())
	}
}
