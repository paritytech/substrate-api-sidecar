package.path = package.path .. ";../util/util.lua"
local util = require('util')
local accountsBalance = require('accountsBalance')

request = util.request(accountsBalance, '/accounts/%s')

delay = util.delay

done = util.done()