package.path = package.path .. ";../util/util.lua"
local util = require('util')
local nodeTransactionPool = require('nodeTransactionPool')

request = util.request(nodeTransactionPool, '/node/%s')

delay = util.delay

done = util.done()
