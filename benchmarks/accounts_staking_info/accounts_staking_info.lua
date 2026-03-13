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

-- Accounts staking-info endpoint benchmark script
-- Tests the /accounts/{accountId}/staking-info endpoint for latency and throughput
--
-- Chain-aware: uses chain-specific accounts and blocks.

local util = require("util")

local chain = os.getenv("BENCH_CHAIN") or "polkadot"

local endpoints = {}

if chain == "asset-hub-polkadot" or chain == "statemint" then
    -- Asset Hub Polkadot-specific accounts and blocks
    endpoints = {
         -- different accounts @ different blocks @ different spec_versions
        '112E6RqiX78Lm5QPBcVz2QsKVVXSDoHA8JJxu5P3iay15HrF/staking-info?at=13185919',     -- spec_version 2000007, unlocking: []
        '162irz3JWpH3dNLo5vUdEz7RTzStkKJyjeYSmSTQE6yYGi1K/staking-info?at=11896484',     -- spec_version 2000006, unlocking: 8
        '12LdngMrL3xmSSj6bCpAqprZBWWkHBfYdv47RxWMPZtWzuwK/staking-info?at=11430473',     -- spec_version 2000005, unlocking: []
        '12pw22Qyy3o28BLshjce9yrSMs3fhSiLsAjqLPAzGktbXYV7/staking-info?at=11096339',     -- spec_version 2000003, unlocking: 10
        '14n7KYKKjZohVapvNYnWdCVu7oCJMjyWHqehGcC11wE7dKWv/staking-info?at=10401948',     -- spec_version 2000002, unlocking: 1
        '13Agjkd5embbwk3rZ1zrf66E2TbL11gNgWGaa6pTj7Ar41Nr/staking-info?at=10306695',     -- spec_version 2000001, unlocking: 5
        '13Xo4xYdMRQQoWD7TA9yCDHG1BXqQFvnjeGvU6LHhRhUsBhQ/staking-info?at=10265744',     -- spec_version 2000000, unlocking: []
    }
else
    -- Polkadot relay / other chains: validator accounts with historical blocks (matching Sidecar)
    endpoints = {
        '13BN4WksoyexwDWhGsMMUbU5okehD19GzdyqL4DMPR2KkQpP/staking-info?at=11000000',
        '13BN4WksoyexwDWhGsMMUbU5okehD19GzdyqL4DMPR2KkQpP/staking-info?at=10000000',
        '13BN4WksoyexwDWhGsMMUbU5okehD19GzdyqL4DMPR2KkQpP/staking-info?at=9000000',
        '13BN4WksoyexwDWhGsMMUbU5okehD19GzdyqL4DMPR2KkQpP/staking-info?at=8000000',
        '13BN4WksoyexwDWhGsMMUbU5okehD19GzdyqL4DMPR2KkQpP/staking-info?at=7000000',
        '13BN4WksoyexwDWhGsMMUbU5okehD19GzdyqL4DMPR2KkQpP/staking-info?at=6000000',
        '16MNMABGfPChG1RHxeb2YzoWUrX22G5CPnvarkmDJXzsZVRV/staking-info?at=11000000',
        '16MNMABGfPChG1RHxeb2YzoWUrX22G5CPnvarkmDJXzsZVRV/staking-info?at=10000000',
        '16MNMABGfPChG1RHxeb2YzoWUrX22G5CPnvarkmDJXzsZVRV/staking-info?at=9000000',
        '16MNMABGfPChG1RHxeb2YzoWUrX22G5CPnvarkmDJXzsZVRV/staking-info?at=8000000',
        '16MNMABGfPChG1RHxeb2YzoWUrX22G5CPnvarkmDJXzsZVRV/staking-info?at=7000000',
        '16MNMABGfPChG1RHxeb2YzoWUrX22G5CPnvarkmDJXzsZVRV/staking-info?at=6000000',
        '16MNMABGfPChG1RHxeb2YzoWUrX22G5CPnvarkmDJXzsZVRV/staking-info?at=5000000',
        '13KJ3t8w1CKMkXCmZ6s3VwdWo4h747kXE88ZNh6rCBTvojmM/staking-info?at=11000000',
        '13KJ3t8w1CKMkXCmZ6s3VwdWo4h747kXE88ZNh6rCBTvojmM/staking-info?at=10000000',
        '13KJ3t8w1CKMkXCmZ6s3VwdWo4h747kXE88ZNh6rCBTvojmM/staking-info?at=9000000',
        '13KJ3t8w1CKMkXCmZ6s3VwdWo4h747kXE88ZNh6rCBTvojmM/staking-info?at=8000000',
        '13KJ3t8w1CKMkXCmZ6s3VwdWo4h747kXE88ZNh6rCBTvojmM/staking-info?at=7000000',
        '12HFymxpDmi4XXPHaEMp74CNpRhkqwG5qxnrgikkhon1XMrj/staking-info?at=11000000',
        '12HFymxpDmi4XXPHaEMp74CNpRhkqwG5qxnrgikkhon1XMrj/staking-info?at=10000000',
        '12HFymxpDmi4XXPHaEMp74CNpRhkqwG5qxnrgikkhon1XMrj/staking-info?at=9000000',
        '12HFymxpDmi4XXPHaEMp74CNpRhkqwG5qxnrgikkhon1XMrj/staking-info?at=8000000',
        '12HFymxpDmi4XXPHaEMp74CNpRhkqwG5qxnrgikkhon1XMrj/staking-info?at=7000000',
        '12HFymxpDmi4XXPHaEMp74CNpRhkqwG5qxnrgikkhon1XMrj/staking-info?at=6000000',
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
