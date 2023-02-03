package.path = package.path .. ";../util/util.lua"
local util = require('util')
local palletsStakingValidators = require('palletsStakingValidators')

request = util.request(palletsStakingValidators, '/pallets/staking/validators?at=%s')

delay = util.delay

done = util.done()

