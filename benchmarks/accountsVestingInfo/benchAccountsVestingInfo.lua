package.path = package.path .. ";../util/util.lua"
local util = require('util')
local accountsVestingInfo = require('accountsVestingInfo')

request = util.request(accountsVestingInfo, '/accounts/%s')

delay = util.delay

done = util.done()
