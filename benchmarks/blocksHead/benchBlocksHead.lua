package.path = package.path .. ";../util/util.lua"
local util = require('util')
local blocksHead = require('blocksHead')

request = util.request(blocksHead, '/blocks/%s')

delay = util.delay

done = util.done()
