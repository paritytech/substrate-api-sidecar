package.path = package.path .. ";../util/util.lua"
local util = require('util')
local blocksBlockIdHeader = require('blocksBlockIdHeader')

request = util.request(blocksBlockIdHeader, '/blocks/%s')

delay = util.delay

done = util.done()
