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

-- Blocks header endpoint benchmark script
-- Tests the /blocks/{blockId}/header endpoint for latency and throughput
--
-- Chain-aware: uses chain-specific blocks.

local util = require("util")

local chain = os.getenv("BENCH_CHAIN") or "polkadot"

local endpoints = {}

if chain == "asset-hub-polkadot" or chain == "statemint" then
    -- Asset Hub Polkadot-specific blocks (same as blocks.lua)
    endpoints = {
        -- Blocks @ different spec versions
        '12319018/header',      -- spec_version 2000007
        '11896182/header',      -- spec_version 2000006
        '11405258/header',      -- spec_version 2000005
        '10637835/header',      -- spec_version 2000003
        '10344187/header',      -- spec_version 2000002
        '10286866/header',      -- spec_version 2000001
        '10241801/header',      -- spec_version 2000000
        '9784456/header',       -- spec_version 1007001
        '9562299/header',       -- spec_version 1006000
        '8926584/header',       -- spec_version 1005001
        '8548146/header',       -- spec_version 1004002
        '8297525/header',       -- spec_version 1004000
        '7584039/header',       -- spec_version 1003004
        '7342289/header',       -- spec_version 1003003
        '7144963/header',       -- spec_version 1003000
        '6643079/header',       -- spec_version 1002006
        '6593078/header',       -- spec_version 1002005
        '6451357/header',       -- spec_version 1002004
    }
else
    -- Polkadot relay: historical blocks (matching Sidecar)
    endpoints = {
        '28831/header',      -- Sudo setKey(0, -> 1)
        '29258/header',      -- sudo.sudo(forceTransfer)
        '188836/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v5)
        '197681/header',     -- sudo.sudo(forceTransfer)
        '199405/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v6)
        '200732/header',     -- sudo.sudo(batch assign indices)
        '214264/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v7)
        '214576/header',     -- proxy sudo batch of transfers
        '243601/header',     -- proxy sudo batch of transfers
        '244358/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v8)
        '287352/header',     -- sudo.sudo forceTransfer
        '300532/header',     -- proxy.addProxy for `Any` from sudo
        '301569/header',     -- proxy sudo mint claim
        '302396/header',     -- proxy sudo set vested claim
        '303079/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v9)
        '304468/header',     -- proxy sudo set balance(W3F)(failed)
        '313396/header',     -- proxy sudo set storage
        '314201/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v10)
        '314326/header',     -- proxy sudo set balance(W3F)
        '325148/header',     -- scheduler dispatched
        '326556/header',     -- sudo.sudo force new era always
        '341469/header',     -- proxy sudo force transfer
        '342400/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v11)
        '342477/header',     -- sudo.sudo schedule regular validator set increases
        '442600/header',     -- scheduler dispatched
        '443963/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v12)
        '444722/header',     -- proxy sudo batch of transfers
        '516904/header',     -- sudo.sudo batch of transfers
        '528470/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v13)
        '543510/header',     -- sudo.sudo force transfer
        '645697/header',     -- proxy sudo batch of transfers
        '744556/header',     -- proxy sudo batch of transfers
        '746085/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v15)
        '746605/header',     -- sudo.sudoAs add governance proxy
        '786421/header',     -- sudo force transfer
        '787923/header',     -- sudo.sudoUncheckedWeight runtime upgrade(v16)
        '790128/header',     -- proxy sudo batch of transfers
        '799302/header',     -- runtime upgraded no more sudo
        '799310/header',     -- after v17
        '943438/header',     -- democracy.vote
        '1603025/header',    -- staking.withdrawUnbonded
        '6800002/header',    -- blocks.transfer
        '11873016/header',   -- vesting.vest
    }
end

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
