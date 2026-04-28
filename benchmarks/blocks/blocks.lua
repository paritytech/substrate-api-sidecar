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
-- Aligned with Sidecar benchmark parameters

local util = require("util")
local report = require("report")

local chain = os.getenv("BENCH_CHAIN") or "polkadot"

local blocks

if chain == "statemint" or chain == "asset-hub-polkadot" then
    -- Polkadot Asset Hub blocks
    blocks = {
        -- Blocks @ different spec versions
        '12319018',      -- spec_version 2000007
        '11896182',      -- spec_version 2000006
        '11405258',      -- spec_version 2000005
        '10637835',      -- spec_version 2000003
        '10344187',      -- spec_version 2000002
        '10286866',      -- spec_version 2000001
        '10241801',      -- spec_version 2000000
        '9784456',      -- spec_version 1007001
        '9562299',      -- spec_version 1006000
        '8926584',      -- spec_version 1005001
        '8548146',      -- spec_version 1004002
        '8297525',      -- spec_version 1004000
        '7584039',      -- spec_version 1003004
        '7342289',      -- spec_version 1003003
        '7144963',      -- spec_version 1003000
        '6643079',      -- spec_version 1002006
        '6593078',      -- spec_version 1002005
        '6451357',      -- spec_version 1002004
        -- Blocks with more extrinsics
        '10259193',      -- 52 extrinsics @ spec_version 2000000
        '10259183',      -- 52 extrinsics @ spec_version 2000000
        '10872783',      -- 53 extrinsics @ spec_version 2000003
        '10873066',      -- 47 extrinsics @ spec_version 2000003
        '10873360',      -- 47 extrinsics @ spec_version 2000003
        '10873648',      -- 50 extrinsics @ spec_version 2000003
        '11038658',      -- 46 extrinsics @ spec_version 2000003
        '11038369',      -- 46 extrinsics @ spec_version 2000003
        '11038074',      -- 46 extrinsics @ spec_version 2000003
        '13255796',      -- 156 extrinsics @ spec_version 2000007
        '13254859',      -- 45 extrinsics @ spec_version 2000007
        -- Blocks @ spec_version 2000000 and with more events under on_finalize
        '10255499',      -- 912 events
        '10256589',      -- 1740 events
        '10257248',      -- 2076 events
        '10257629',      -- 2336 events
        '10257741',      -- 2425 events
        '10257742',      -- 2303 events
        '10257743',      -- 2346 events
        '10257999',      -- 2373 events
    }
else
    -- Polkadot relay historical blocks covering significant events (matching Sidecar)
    blocks = {
        '28831',      -- Sudo setKey(0, -> 1)
        '29258',      -- sudo.sudo(forceTransfer)
        '188836',     -- sudo.sudoUncheckedWeight runtime upgrade(v5)
        '197681',     -- sudo.sudo(forceTransfer)
        '199405',     -- sudo.sudoUncheckedWeight runtime upgrade(v6)
        '200732',     -- sudo.sudo(batch assign indices)
        '214264',     -- sudo.sudoUncheckedWeight runtime upgrade(v7)
        '214576',     -- proxy sudo batch of transfers
        '243601',     -- proxy sudo batch of transfers
        '244358',     -- sudo.sudoUncheckedWeight runtime upgrade(v8)
        '287352',     -- sudo.sudo forceTransfer
        '300532',     -- proxy.addProxy for `Any` from sudo
        '301569',     -- proxy sudo mint claim
        '302396',     -- proxy sudo set vested claim
        '303079',     -- sudo.sudoUncheckedWeight runtime upgrade(v9)
        '304468',     -- proxy sudo set balance(W3F)(failed)
        '313396',     -- proxy sudo set storage
        '314201',     -- sudo.sudoUncheckedWeight runtime upgrade(v10)
        '314326',     -- proxy sudo set balance(W3F)
        '325148',     -- scheduler dispatched
        '326556',     -- sudo.sudo force new era always
        '341469',     -- proxy sudo force transfer
        '342400',     -- sudo.sudoUncheckedWeight runtime upgrade(v11)
        '342477',     -- sudo.sudo schedule regular validator set increases
        '442600',     -- scheduler dispatched
        '443963',     -- sudo.sudoUncheckedWeight runtime upgrade(v12)
        '444722',     -- proxy sudo batch of transfers
        '516904',     -- sudo.sudo batch of transfers
        '528470',     -- sudo.sudoUncheckedWeight runtime upgrade(v13)
        '543510',     -- sudo.sudo force transfer
        '645697',     -- proxy sudo batch of transfers
        '744556',     -- proxy sudo batch of transfers
        '746085',     -- sudo.sudoUncheckedWeight runtime upgrade(v15)
        '746605',     -- sudo.sudoAs add governance proxy
        '786421',     -- sudo force transfer
        '787923',     -- sudo.sudoUncheckedWeight runtime upgrade(v16)
        '790128',     -- proxy sudo batch of transfers
        '799302',     -- runtime upgraded no more sudo
        '799310',     -- after v17
        '943438',     -- democracy.vote
        '1603025',    -- staking.withdrawUnbonded
        '6800002',    -- blocks.transfer
        '11873016',   -- vesting.vest
        -- High-load blocks (250-524 extrinsics)
        '18687076',   -- 414 extrinsics
        '18687064',   -- 404 extrinsics
        '18687053',   -- 402 extrinsics
        '18687063',   -- 435 extrinsics
        '18687111',   -- 460 extrinsics
        '18687104',   -- 274 extrinsics
        '18687099',   -- 288 extrinsics
        '18687162',   -- 436 extrinsics
        '18687150',   -- 409 extrinsics
        '18687146',   -- 358 extrinsics
        '18687186',   -- 416 extrinsics
        '18687181',   -- 306 extrinsics
        '18687219',   -- 458 extrinsics
        '18687214',   -- 292 extrinsics
        '18687212',   -- 341 extrinsics
        '18687264',   -- 401 extrinsics
        '18687255',   -- 437 extrinsics
        '18687246',   -- 276 extrinsics
        '18687338',   -- 488 extrinsics
        '18687370',   -- 512 extrinsics
        '18687387',   -- 484 extrinsics
        '18687436',   -- 352 extrinsics
        '18687425',   -- 372 extrinsics
        '18687507',   -- 402 extrinsics
        '18687526',   -- 266 extrinsics
        '18687604',   -- 348 extrinsics
        '18687639',   -- 489 extrinsics
        '18687630',   -- 524 extrinsics
        '18687692',   -- 377 extrinsics
        '18687712',   -- 349 extrinsics
    }
end

local counter = 1

request = function()
    local block = blocks[counter]
    counter = counter + 1
    if counter > #blocks then
        counter = 1
    end
    return wrk.format("GET", util.prefix .. "/blocks/" .. block)
end

done = util.done()
