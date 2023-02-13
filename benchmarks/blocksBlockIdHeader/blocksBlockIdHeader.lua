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

local blocksBlockIdHeader = {
    '28831/header', -- Sudo setKey(0, -> 1)
    '29258/header', -- sudo.sudo(forceTransfer)
    '188836/header', -- sudo.sudoUncheckedWeight runtime upgrade(v5 generalized proxies identity)
    '197681/header', -- sudo.sudo(forceTransfer)
    '199405/header', -- sudo.sudoUncheckedWeight runtime upgrade(v6 council / sudo can move claims)
    '200732/header', -- sudo.sudo(batch assign indices)
    '214264/header', -- sudo.sudoUncheckedWeight runtime upgrade(v7 frozen indices)
    '214576/header', -- proxy sudo batch of transfers
    '243601/header', -- proxy sudo batch of transfers
    '244358/header', -- sudo.sudoUncheckedWeight runtime upgrade(v8 (un)reserve events)
    '287352/header', -- sudo.sudo forceTransfer
    '300532/header', -- proxy.addProxy for `Any` from sudo(direct to proxy module)
    '301569/header', -- proxy sudo mint claim
    '302396/header', -- proxy sudo set vested claim
    '303079/header', -- sudo.sudoUncheckedWeight runtime upgrade(v9 add vested forceTransfer and new origin filtering)
    '304468/header', -- proxy sudo set balance(W3F)(failed)
    '313396/header', -- proxy sudo set storage
    '314201/header', -- sudo.sudoUncheckedWeight runtime upgrade(v10 allow sudo to do anything(i.e.fix new filtering))
    '314326/header', -- proxy sudo set balance(W3F)
    '325148/header', -- scheduler dispatched
    '326556/header', -- sudo.sudo force new era always
    '341469/header', -- proxy sudo force transfer
    '342400/header', -- sudo.sudoUncheckedWeight runtime upgrade(v11 scale validator count functions)
    '342477/header', -- sudo.sudo schedule regular validator set increases
    '442600/header', -- scheduler dispatched
    '443963/header', -- sudo.sudoUncheckedWeight runtime upgrade(v12 new staking rewards curve)
    '444722/header', -- proxy sudo batch of transfers
    '516904/header', -- sudo.sudo batch of transfers
    '528470/header', -- sudo.sudoUncheckedWeight runtime upgrade(v13 payout creates controller allow voting registrar proxy refactor as_sub)
    '543510/header', -- sudo.sudo force transfer
    '645697/header', -- proxy sudo batch of transfers
    '744556/header', -- proxy sudo batch of transfers
    '746085/header', -- sudo.sudoUncheckedWeight runtime upgrade(v15 enable council elections purchase)
    '746605/header', -- sudo.sudoAs add governance proxy
    '786421/header', -- sudo force transfer
    '787923/header', -- sudo.sudoUncheckedWeight runtime upgrade(v16 enable governance)
    '790128/header', -- proxy sudo batch of transfers
    '799302/header', -- runtime upgraded no more sudo
    '799310/header', -- after v17
    '943438/header', -- democracy.vote
    '1603025/header', -- staking.withdrawUnbonded
    '6800002/header', -- blocks.transfer
    '11873016/header', -- vesting.vest
}

return blocksBlockIdHeader
