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

-- Pallets storage endpoint benchmark script
-- Tests the /pallets/{palletId}/storage endpoint for latency and throughput

local util = require("util")

local chain = os.getenv("BENCH_CHAIN") or "polkadot"

local endpoints

if chain == "statemint" or chain == "asset-hub-polkadot" then
    -- Polkadot Asset Hub
    endpoints = {
        -- System pallet storage across spec versions
        'System/storage?at=12319018',      -- spec_version 2000007
        'System/storage?at=11896182',      -- spec_version 2000006
        'System/storage?at=11405258',      -- spec_version 2000005
        'System/storage?at=10637835',      -- spec_version 2000003
        'System/storage?at=10344187',      -- spec_version 2000002
        'System/storage?at=10286866',      -- spec_version 2000001
        'System/storage?at=10241801',      -- spec_version 2000000
        'System/storage?at=9784456',       -- spec_version 1007001
        'System/storage?at=9562299',       -- spec_version 1006000
        'System/storage?at=8926584',       -- spec_version 1005001
        'System/storage?at=8548146',       -- spec_version 1004002
        'System/storage?at=8297525',       -- spec_version 1004000
        'System/storage?at=7584039',       -- spec_version 1003004
        'System/storage?at=7342289',       -- spec_version 1003003
        'System/storage?at=7144963',       -- spec_version 1003000
        'System/storage?at=6643079',       -- spec_version 1002006
        'System/storage?at=6593078',       -- spec_version 1002005
        'System/storage?at=6451357',       -- spec_version 1002004
        -- Other Pallets
        'Staking/storage?at=12550000',     -- spec_version 2000007
        'Scheduler/storage?at=10550000',   -- spec_version 2000002
        'Balances/storage?at=10288000',    -- spec_version 2000001
    }
else
    -- Polkadot relay: multiple pallets at two block heights (matching Sidecar)
    endpoints = {
        'System/storage?at=11900000',
        'Scheduler/storage?at=11900000',
        'Preimage/storage?at=11900000',
        'Babe/storage?at=11900000',
        'Timestamp/storage?at=11900000',
        'Indices/storage?at=11900000',
        'Balances/storage?at=11900000',
        'TransactionPayment/storage?at=11900000',
        'Authorship/storage?at=11900000',
        'Staking/storage?at=11900000',
        'Offences/storage?at=11900000',
        'Session/storage?at=11900000',
        'Grandpa/storage?at=11900000',
        'ImOnline/storage?at=11900000',
        'Democracy/storage?at=11900000',
        'TechnicalCommittee/storage?at=11900000',
        'Council/storage?at=11900000',
        'PhragmenElection/storage?at=11900000',
        'Treasury/storage?at=11900000',
        'Claims/storage?at=11900000',
        'System/storage?at=6000000',
        'Scheduler/storage?at=6000000',
        'Babe/storage?at=6000000',
        'Timestamp/storage?at=6000000',
        'Indices/storage?at=6000000',
        'Balances/storage?at=6000000',
        'TransactionPayment/storage?at=6000000',
        'Authorship/storage?at=6000000',
        'Staking/storage?at=6000000',
        'Offences/storage?at=6000000',
        'Session/storage?at=6000000',
        'Grandpa/storage?at=6000000',
        'ImOnline/storage?at=6000000',
        'Democracy/storage?at=6000000',
        'TechnicalCommittee/storage?at=6000000',
        'Council/storage?at=6000000',
        'PhragmenElection/storage?at=6000000',
        'Treasury/storage?at=6000000',
        'Claims/storage?at=6000000',
    }
end

local counter = 1

request = function()
    local endpoint = endpoints[counter]
    counter = counter + 1
    if counter > #endpoints then
        counter = 1
    end
    return wrk.format("GET", util.prefix .. "/pallets/" .. endpoint)
end

done = util.done()
