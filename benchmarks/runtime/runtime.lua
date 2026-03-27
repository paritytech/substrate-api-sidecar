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

-- Runtime/spec endpoint benchmark script
-- Tests the /runtime/spec endpoint for latency and throughput

local util = require("util")

local chain = os.getenv("BENCH_CHAIN") or "polkadot"

local endpoints

if chain == "statemint" or chain == "asset-hub-polkadot" then
    -- Polkadot Asset Hub: runtime spec across spec versions
    endpoints = {
        'spec',
        'spec?at=12319018',      -- spec_version 2000007
        'spec?at=11896182',      -- spec_version 2000006
        'spec?at=11405258',      -- spec_version 2000005
        'spec?at=10637835',      -- spec_version 2000003
        'spec?at=10344187',      -- spec_version 2000002
        'spec?at=10286866',      -- spec_version 2000001
        'spec?at=10241801',      -- spec_version 2000000
        'spec?at=9784456',       -- spec_version 1007001
        'spec?at=9562299',       -- spec_version 1006000
        'spec?at=8926584',       -- spec_version 1005001
        'spec?at=8548146',       -- spec_version 1004002
        'spec?at=8297525',       -- spec_version 1004000
        'spec?at=7584039',       -- spec_version 1003004
        'spec?at=7342289',       -- spec_version 1003003
        'spec?at=7144963',       -- spec_version 1003000
        'spec?at=6643079',       -- spec_version 1002006
        'spec?at=6593078',       -- spec_version 1002005
        'spec?at=6451357',       -- spec_version 1002004
    }
else
    -- Polkadot relay: historical blocks (matching Sidecar)
    endpoints = {
        'spec',
        'spec?at=1000000',
        'spec?at=2000000',
        'spec?at=3000000',
        'spec?at=4000000',
        'spec?at=5000000',
        'spec?at=6000000',
        'spec?at=7000000',
        'spec?at=8000000',
        'spec?at=9000000',
        'spec?at=10000000',
        'spec?at=11000000',
    }
end

local counter = 1

request = function()
    local endpoint = endpoints[counter]
    counter = counter + 1
    if counter > #endpoints then
        counter = 1
    end
    return wrk.format("GET", util.prefix .. "/runtime/" .. endpoint)
end

done = util.done()
