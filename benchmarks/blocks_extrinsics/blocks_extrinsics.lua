-- Blocks extrinsics endpoint benchmark script
-- Tests the /v1/blocks/{blockId}/extrinsics/{extrinsicIndex} endpoint for latency and throughput
-- Aligned with Sidecar benchmark parameters
--
-- Chain-aware: uses chain-specific blocks with interesting extrinsics.

local util = require("util")

local chain = os.getenv("BENCH_CHAIN") or "polkadot"

local endpoints = {}

if chain == "asset-hub-polkadot" or chain == "statemint" then
    -- Asset Hub Polkadot-specific blocks with extrinsics
    endpoints = {
        -- Blocks @ different spec versions
        '12319018/extrinsics/0',      -- spec_version 2000007
        '11896182/extrinsics/0',      -- spec_version 2000006
        '11405258/extrinsics/0',      -- spec_version 2000005
        '10637835/extrinsics/0',      -- spec_version 2000003
        '10344187/extrinsics/0',      -- spec_version 2000002
        '10286866/extrinsics/0',      -- spec_version 2000001
        '10241801/extrinsics/0',      -- spec_version 2000000
        '9784456/extrinsics/0',       -- spec_version 1007001
        '9562299/extrinsics/0',       -- spec_version 1006000
        '8926584/extrinsics/0',       -- spec_version 1005001
        '8548146/extrinsics/0',       -- spec_version 1004002
        '8297525/extrinsics/0',       -- spec_version 1004000
        '7584039/extrinsics/0',       -- spec_version 1003004
        '7342289/extrinsics/0',       -- spec_version 1003003
        '7144963/extrinsics/0',       -- spec_version 1003000
        '6643079/extrinsics/0',       -- spec_version 1002006
        '6593078/extrinsics/0',       -- spec_version 1002005
        '6451357/extrinsics/0',       -- spec_version 1002004
    }
else
    -- Polkadot relay: historical blocks with extrinsics (matching Sidecar)
    endpoints = {
        '28831/extrinsics/0',      -- Sudo setKey(0, -> 1)
        '29258/extrinsics/0',      -- sudo.sudo(forceTransfer)
        '188836/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v5)
        '197681/extrinsics/0',     -- sudo.sudo(forceTransfer)
        '199405/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v6)
        '200732/extrinsics/0',     -- sudo.sudo(batch assign indices)
        '214264/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v7)
        '214576/extrinsics/0',     -- proxy sudo batch of transfers
        '243601/extrinsics/0',     -- proxy sudo batch of transfers
        '244358/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v8)
        '287352/extrinsics/0',     -- sudo.sudo forceTransfer
        '300532/extrinsics/0',     -- proxy.addProxy for `Any` from sudo
        '301569/extrinsics/0',     -- proxy sudo mint claim
        '302396/extrinsics/0',     -- proxy sudo set vested claim
        '303079/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v9)
        '304468/extrinsics/0',     -- proxy sudo set balance(W3F)(failed)
        '313396/extrinsics/0',     -- proxy sudo set storage
        '314201/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v10)
        '314326/extrinsics/0',     -- proxy sudo set balance(W3F)
        '325148/extrinsics/0',     -- scheduler dispatched
        '326556/extrinsics/0',     -- sudo.sudo force new era always
        '341469/extrinsics/0',     -- proxy sudo force transfer
        '342400/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v11)
        '342477/extrinsics/0',     -- sudo.sudo schedule regular validator set increases
        '442600/extrinsics/0',     -- scheduler dispatched
        '443963/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v12)
        '444722/extrinsics/0',     -- proxy sudo batch of transfers
        '516904/extrinsics/0',     -- sudo.sudo batch of transfers
        '528470/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v13)
        '543510/extrinsics/0',     -- sudo.sudo force transfer
        '645697/extrinsics/0',     -- proxy sudo batch of transfers
        '744556/extrinsics/0',     -- proxy sudo batch of transfers
        '746085/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v15)
        '746605/extrinsics/0',     -- sudo.sudoAs add governance proxy
        '786421/extrinsics/0',     -- sudo force transfer
        '787923/extrinsics/0',     -- sudo.sudoUncheckedWeight runtime upgrade(v16)
        '790128/extrinsics/0',     -- proxy sudo batch of transfers
        '799302/extrinsics/0',     -- runtime upgraded no more sudo
        '799310/extrinsics/0',     -- after v17
        '943438/extrinsics/0',     -- democracy.vote
        '1603025/extrinsics/0',    -- staking.withdrawUnbonded
        '6800002/extrinsics/0',    -- blocks.transfer
        '11873016/extrinsics/0',   -- vesting.vest
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
