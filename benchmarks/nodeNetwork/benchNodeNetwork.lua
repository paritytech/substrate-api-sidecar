package.path = package.path .. ";../util/util.lua"
local util = require('util')
local nodeNetwork = require('nodeNetwork')

request = util.request(nodeNetwork, '/node/%s')

delay = util.delay

done = util.done()
