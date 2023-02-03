-- Copyright 2017-2023 Parity Technologies (UK) Ltd.
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

local blocksBlockIdExtrinsics = {
    '28831/extrinsics/0', -- Sudo setKey(0, -> 1)
    '29258/extrinsics/0', -- sudo.sudo(forceTransfer)
    '188836/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v5 generalized proxies identity)
    '197681/extrinsics/0', -- sudo.sudo(forceTransfer)
    '199405/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v6 council / sudo can move claims)
    '200732/extrinsics/0', -- sudo.sudo(batch assign indices)
    '214264/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v7 frozen indices)
    '214576/extrinsics/0', -- proxy sudo batch of transfers
    '243601/extrinsics/0', -- proxy sudo batch of transfers
    '244358/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v8 (un)reserve events)
    '287352/extrinsics/0', -- sudo.sudo forceTransfer
    '300532/extrinsics/0', -- proxy.addProxy for `Any` from sudo(direct to proxy module)
    '301569/extrinsics/0', -- proxy sudo mint claim
    '302396/extrinsics/0', -- proxy sudo set vested claim
    '303079/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v9 add vested forceTransfer and new origin filtering)
    '304468/extrinsics/0', -- proxy sudo set balance(W3F)(failed)
    '313396/extrinsics/0', -- proxy sudo set storage
    '314201/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v10 allow sudo to do anything(i.e.fix new filtering))
    '314326/extrinsics/0', -- proxy sudo set balance(W3F)
    '325148/extrinsics/0', -- scheduler dispatched
    '326556/extrinsics/0', -- sudo.sudo force new era always
    '341469/extrinsics/0', -- proxy sudo force transfer
    '342400/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v11 scale validator count functions)
    '342477/extrinsics/0', -- sudo.sudo schedule regular validator set increases
    '442600/extrinsics/0', -- scheduler dispatched
    '443963/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v12 new staking rewards curve)
    '444722/extrinsics/0', -- proxy sudo batch of transfers
    '516904/extrinsics/0', -- sudo.sudo batch of transfers
    '528470/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v13 payout creates controller allow voting registrar proxy refactor as_sub)
    '543510/extrinsics/0', -- sudo.sudo force transfer
    '645697/extrinsics/0', -- proxy sudo batch of transfers
    '744556/extrinsics/0', -- proxy sudo batch of transfers
    '746085/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v15 enable council elections purchase)
    '746605/extrinsics/0', -- sudo.sudoAs add governance proxy
    '786421/extrinsics/0', -- sudo force transfer
    '787923/extrinsics/0', -- sudo.sudoUncheckedWeight runtime upgrade(v16 enable governance)
    '790128/extrinsics/0', -- proxy sudo batch of transfers
    '799302/extrinsics/0', -- runtime upgraded no more sudo
    '799310/extrinsics/0', -- after v17
    '943438/extrinsics/0', -- democracy.vote
    '1603025/extrinsics/0', -- staking.withdrawUnbonded
    '6800002/extrinsics/0', -- blocks.transfer
    '11873016/extrinsics/0', -- vesting.vest
}

return blocksBlockIdExtrinsics
