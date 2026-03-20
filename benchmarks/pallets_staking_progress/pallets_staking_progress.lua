-- Copyright 2017-2025 Parity Technologies (UK) Ltd.
-- This file is part of Substrate API Sidecar.
--
-- Substrate API Sidecar is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see <http://www.gnu.org/licenses/>.

-- Pallets staking progress endpoint benchmark script
-- Tests the /pallets/staking/progress endpoint for latency and throughput
--
-- Chain-aware: uses chain-specific blocks.

local util = require("util")

local chain = os.getenv("BENCH_CHAIN") or "polkadot"

local blocks = {}

if chain == "asset-hub-polkadot" or chain == "statemint" then
    -- Asset Hub Polkadot-specific blocks (matching accounts_staking_payouts.lua)
    blocks = {
        '13185919',     -- spec_version 2000007
        '11896484',     -- spec_version 2000006
        '11430473',     -- spec_version 2000005
        '11096339',     -- spec_version 2000003
        '10401948',     -- spec_version 2000002
        '10306695',     -- spec_version 2000001
        '10265744',     -- spec_version 2000000
    }
else
    -- Polkadot relay: historical blocks (matching Sidecar)
    blocks = {
        '11000000',
        '10500000',
        '10000000',
        '9500000',
        '9000000',
        '8500000',
        '8000000',
        '7500000',
        '7000000',
        '6500000',
        '6000000',
        '5500000',
        '5000000',
        '4500000',
        '4000000',
        '3500000',
        '3000000',
        '2000000',
        '1000000',
    }
end

local counter = 1

request = function()
    local block = blocks[counter]
    counter = counter + 1
    if counter > #blocks then
        counter = 1
    end
    return wrk.format("GET", util.prefix .. "/pallets/staking/progress?at=" .. block)
end

done = util.done()
