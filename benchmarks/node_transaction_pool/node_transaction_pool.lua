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

-- Node transaction-pool endpoint benchmark script
-- Tests the /node/transaction-pool endpoint for latency and throughput

local util = require("util")

local endpoints = {
    'transaction-pool',
    'transaction-pool?includeFee=true',
}

util.print_endpoints(endpoints)

local counter = 1

request = function()
    local endpoint = endpoints[counter]
    counter = counter + 1
    if counter > #endpoints then
        counter = 1
    end
    return wrk.format("GET", util.prefix .. "/node/" .. endpoint)
end

done = util.done()
