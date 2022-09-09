package.path = package.path .. ";../util/util.lua"
local util = require('util')
local accountsStakingInfo = require('accountsStakingInfo')

request = util.request(accountsStakingInfo, '/accounts/%s')

delay = util.delay

done = util.done()
