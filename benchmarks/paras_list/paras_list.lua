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

-- Paras list endpoint benchmark script
-- Tests the /paras endpoint for latency and throughput

local util = require("util")

local endpoints = {
    '?at=8500000',
    '?at=8750000',
    '?at=9000000',
    '?at=9250000',
    '?at=9500000',
    '?at=9750000',
    '?at=10000000',
    '?at=10250000',
    '?at=10500000',
    '?at=10750000',
    '?at=11000000',
    '?at=11250000',
    '?at=11500000',
    '?at=11750000',
    '?at=12000000',
}

util.print_endpoints(endpoints)

local counter = 1

request = function()
    local endpoint = endpoints[counter]
    counter = counter + 1
    if counter > #endpoints then
        counter = 1
    end
    return wrk.format("GET", util.prefix .. "/paras" .. endpoint)
end

done = util.done()
