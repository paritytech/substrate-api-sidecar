package.path = package.path .. ";../util/util.lua"
local util = require('util')
local nodeVersion = require('nodeVersion')

request = util.request(nodeVersion, '/node/%s')

delay = util.delay

done = util.done()
