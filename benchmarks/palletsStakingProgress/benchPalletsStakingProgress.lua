package.path = package.path .. ";../util/util.lua"
local util = require('util')
local palletsStakingProgress = require('palletsStakingProgress')

request = util.request(palletsStakingProgress, '/pallets/staking/progress?at=%s')

delay = util.delay

done = util.done()
