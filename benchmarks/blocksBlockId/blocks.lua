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

local highLoadBlocks = require('highLoadBlocks')

local blocks = {
    '28831', -- Sudo setKey(0, -> 1)
    '29258', -- sudo.sudo(forceTransfer)
    '188836', -- sudo.sudoUncheckedWeight runtime upgrade(v5 generalized proxies identity)
    '197681', -- sudo.sudo(forceTransfer)
    '199405', -- sudo.sudoUncheckedWeight runtime upgrade(v6 council / sudo can move claims)
    '200732', -- sudo.sudo(batch assign indices)
    '214264', -- sudo.sudoUncheckedWeight runtime upgrade(v7 frozen indices)
    '214576', -- proxy sudo batch of transfers
    '243601', -- proxy sudo batch of transfers
    '244358', -- sudo.sudoUncheckedWeight runtime upgrade(v8 (un)reserve events)
    '287352', -- sudo.sudo forceTransfer
    '300532', -- proxy.addProxy for `Any` from sudo(direct to proxy module)
    '301569', -- proxy sudo mint claim
    '302396', -- proxy sudo set vested claim
    '303079', -- sudo.sudoUncheckedWeight runtime upgrade(v9 add vested forceTransfer and new origin filtering)
    '304468', -- proxy sudo set balance(W3F)(failed)
    '313396', -- proxy sudo set storage
    '314201', -- sudo.sudoUncheckedWeight runtime upgrade(v10 allow sudo to do anything(i.e.fix new filtering))
    '314326', -- proxy sudo set balance(W3F)
    '325148', -- scheduler dispatched
    '326556', -- sudo.sudo force new era always
    '341469', -- proxy sudo force transfer
    '342400', -- sudo.sudoUncheckedWeight runtime upgrade(v11 scale validator count functions)
    '342477', -- sudo.sudo schedule regular validator set increases
    '442600', -- scheduler dispatched
    '443963', -- sudo.sudoUncheckedWeight runtime upgrade(v12 new staking rewards curve)
    '444722', -- proxy sudo batch of transfers
    '516904', -- sudo.sudo batch of transfers
    '528470', -- sudo.sudoUncheckedWeight runtime upgrade(v13 payout creates controller allow voting registrar proxy refactor as_sub)
    '543510', -- sudo.sudo force transfer
    '645697', -- proxy sudo batch of transfers
    '744556', -- proxy sudo batch of transfers
    '746085', -- sudo.sudoUncheckedWeight runtime upgrade(v15 enable council elections purchase)
    '746605', -- sudo.sudoAs add governance proxy
    '786421', -- sudo force transfer
    '787923', -- sudo.sudoUncheckedWeight runtime upgrade(v16 enable governance)
    '790128', -- proxy sudo batch of transfers
    '799302', -- runtime upgraded no more sudo
    '799310', -- after v17
    '943438', -- democracy.vote
    '1603025', -- staking.withdrawUnbonded
    '6800002', -- blocks.transfer
    '11873016', -- vesting.vest
    unpack(highLoadBlocks)
}

return blocks
