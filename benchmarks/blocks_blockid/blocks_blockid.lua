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

-- Blocks endpoint benchmark script
-- Tests the /blocks/{blockId} endpoint for latency and throughput
-- Mixes historical sudo blocks with high-load Polkadot blocks (200+ extrinsics).

local util = require("util")

local endpoints = {
    -- Historical sudo / governance / runtime upgrade blocks
    '28831',     -- Sudo setKey(0, -> 1)
    '29258',     -- sudo.sudo(forceTransfer)
    '188836',    -- sudo.sudoUncheckedWeight runtime upgrade(v5)
    '197681',    -- sudo.sudo(forceTransfer)
    '199405',    -- sudo.sudoUncheckedWeight runtime upgrade(v6)
    '200732',    -- sudo.sudo(batch assign indices)
    '214264',    -- sudo.sudoUncheckedWeight runtime upgrade(v7)
    '214576',    -- proxy sudo batch of transfers
    '243601',    -- proxy sudo batch of transfers
    '244358',    -- sudo.sudoUncheckedWeight runtime upgrade(v8)
    '287352',    -- sudo.sudo forceTransfer
    '300532',    -- proxy.addProxy
    '301569',    -- proxy sudo mint claim
    '302396',    -- proxy sudo set vested claim
    '303079',    -- sudo.sudoUncheckedWeight runtime upgrade(v9)
    '304468',    -- proxy sudo set balance(failed)
    '313396',    -- proxy sudo set storage
    '314201',    -- sudo.sudoUncheckedWeight runtime upgrade(v10)
    '314326',    -- proxy sudo set balance
    '325148',    -- scheduler dispatched
    '326556',    -- sudo.sudo force new era always
    '341469',    -- proxy sudo force transfer
    '342400',    -- sudo.sudoUncheckedWeight runtime upgrade(v11)
    '342477',    -- sudo.sudo schedule validator set increases
    '442600',    -- scheduler dispatched
    '443963',    -- sudo.sudoUncheckedWeight runtime upgrade(v12)
    '444722',    -- proxy sudo batch of transfers
    '516904',    -- sudo.sudo batch of transfers
    '528470',    -- sudo.sudoUncheckedWeight runtime upgrade(v13)
    '543510',    -- sudo.sudo force transfer
    '645697',    -- proxy sudo batch of transfers
    '744556',    -- proxy sudo batch of transfers
    '746085',    -- sudo.sudoUncheckedWeight runtime upgrade(v15)
    '746605',    -- sudo.sudoAs add governance proxy
    '786421',    -- sudo force transfer
    '787923',    -- sudo.sudoUncheckedWeight runtime upgrade(v16)
    '790128',    -- proxy sudo batch of transfers
    '799302',    -- runtime upgrade no more sudo
    '799310',    -- after v17
    '943438',    -- democracy.vote
    '1603025',   -- staking.withdrawUnbonded
    '6800002',   -- balances.transfer
    '11873016',  -- vesting.vest

    -- High-load Polkadot blocks (200+ extrinsics each)
    '18687076',  -- 414 extrinsics
    '18687064',  -- 404 extrinsics
    '18687053',  -- 402 extrinsics
    '18687063',  -- 435 extrinsics
    '18687111',  -- 460 extrinsics
    '18687104',  -- 274 extrinsics
    '18687099',  -- 288 extrinsics
    '18687162',  -- 436 extrinsics
    '18687150',  -- 409 extrinsics
    '18687146',  -- 358 extrinsics
    '18687186',  -- 416 extrinsics
    '18687181',  -- 306 extrinsics
    '18687219',  -- 458 extrinsics
    '18687214',  -- 292 extrinsics
    '18687212',  -- 341 extrinsics
    '18687264',  -- 401 extrinsics
    '18687255',  -- 437 extrinsics
    '18687246',  -- 276 extrinsics
    '18687338',  -- 488 extrinsics
    '18687370',  -- 512 extrinsics
    '18687387',  -- 484 extrinsics
    '18687436',  -- 352 extrinsics
    '18687425',  -- 372 extrinsics
    '18687507',  -- 402 extrinsics
    '18687526',  -- 266 extrinsics
    '18687604',  -- 348 extrinsics
    '18687639',  -- 489 extrinsics
    '18687630',  -- 524 extrinsics
    '18687692',  -- 377 extrinsics
    '18687712',  -- 349 extrinsics
}

util.print_endpoints(endpoints)

local counter = 1

request = function()
    local endpoint = endpoints[counter]
    counter = counter + 1
    if counter > #endpoints then
        counter = 1
    end
    return wrk.format("GET", util.prefix .. "/blocks/" .. endpoint)
end

done = util.done()
