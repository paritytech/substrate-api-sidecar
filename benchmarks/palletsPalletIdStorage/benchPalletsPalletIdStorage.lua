package.path = package.path .. ";../util/util.lua"
local util = require('util')
local palletsPalletIdStorage = require('palletsPalletIdStorage')

request = util.request(palletsPalletIdStorage, '/pallets/%s')

delay = util.delay

done = util.done()
