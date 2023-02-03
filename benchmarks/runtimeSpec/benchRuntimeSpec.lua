package.path = package.path .. ";../util/util.lua"
local util = require('util')
local runtimeSpec = require('runtimeSpec')

request = util.request(runtimeSpec, '/runtime/%s')

delay = util.delay

done = util.done()
