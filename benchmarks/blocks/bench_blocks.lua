package.path = package.path .. ";../util/util.lua"
local util = require('util')
local blocks = require('blocks')

request = util.request(blocks, '/blocks/%s')

delay = util.delay

done = util.done()
