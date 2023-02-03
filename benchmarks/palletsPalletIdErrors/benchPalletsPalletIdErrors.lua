package.path = package.path .. ";../util/util.lua"
local util = require('util')
local palletsPalletIdErrors = require('palletsPalletIdErrors')

request = util.request(palletsPalletIdErrors, '/pallets/%s')

delay = util.delay

done = util.done()
