package.path = package.path .. ";../util/util.lua"
local util = require('util')
local blocksBlockIdExtrinsics = require('blocksBlockIdExtrinsics')

request = util.request(blocksBlockIdExtrinsics, '/blocks/%s')

delay = util.delay

done = util.done()
