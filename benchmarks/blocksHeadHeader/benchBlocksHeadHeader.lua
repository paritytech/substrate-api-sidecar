package.path = package.path .. ";../util/util.lua"
local util = require('util')
local blocksHeadHeader = require('blocksHeadHeader')

request = util.request(blocksHeadHeader, '/blocks/%s')

delay = util.delay

done = util.done()
