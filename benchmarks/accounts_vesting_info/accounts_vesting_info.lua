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

-- Accounts vesting-info endpoint benchmark script
-- Tests the /accounts/{accountId}/vesting-info endpoint for latency and throughput
--
-- Chain-aware: uses chain-specific accounts and blocks.

local util = require("util")

local chain = os.getenv("BENCH_CHAIN") or "polkadot"

local endpoints = {}

if chain == "asset-hub-polkadot" or chain == "statemint" then
    -- Asset Hub Polkadot-specific accounts and blocks
    endpoints = {
        '15HpzYLuTuHGAo4pjG3uUrUgKAQnBRRAd62ZdRaujAgXjiQa/vesting-info?at=12732847',    -- spec_version 2000007, vesting: 4 items
        '16TaSR2xDjgesAn11WYyfb9eLia9BRCrLxn311MyCYjar8h7/vesting-info?at=11197835',    -- spec_version 2000003, vesting: 5 items
    }
else
    -- Polkadot relay: accounts with historical blocks (matching Sidecar)
    endpoints = {
        '15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=1448', -- v0
        '123PewK4ZYcX7Do8PKzP4KyYbLKMQAAA3EhhZcnBDrxAuidt/vesting-info?at=10254', -- v0
        '16FQxY2L9GbBoE1jYCDRUkJRroYMu5FsKRQfFi29xueu1egj/vesting-info?at=111170', -- v1
        '1BjwMkGfudp4eVAMpqv6CHZJxGsLFkqQv5oaZT9gWc5o7hn/vesting-info?at=213327', -- v6
        '1BjwMkGfudp4eVAMpqv6CHZJxGsLFkqQv5oaZT9gWc5o7hn/vesting-info?at=2413527', -- v25
        '123PewK4ZYcX7Do8PKzP4KyYbLKMQAAA3EhhZcnBDrxAuidt/vesting-info?at=4353425', -- v29
        '16FQxY2L9GbBoE1jYCDRUkJRroYMu5FsKRQfFi29xueu1egj/vesting-info?at=6413249', -- v9080
        '15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=7232861', -- v9110
        '15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=8000000', -- v9122
        '15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=8320000', -- v9130
        '15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=8500000', -- v9140
        '15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=9000000', -- v9151
        '15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info?at=9500000', -- v9170
    }
end

local counter = 1

request = function()
    local endpoint = endpoints[counter]
    counter = counter + 1
    if counter > #endpoints then
        counter = 1
    end
    return wrk.format("GET", util.prefix .. "/accounts/" .. endpoint)
end

done = util.done()
