package.path = package.path .. ";../util/util.lua"
local util = require('util')
local accountsStakingPayouts = require('accountsStakingPayouts')

request = util.request(accountsStakingPayouts, '/accounts/%s')

delay = util.delay

done = util.done()
