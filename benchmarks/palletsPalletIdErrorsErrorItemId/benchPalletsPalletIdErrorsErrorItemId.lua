package.path = package.path .. ";../util/util.lua"
local util = require('util')
local palletsPalletIdErrorsErrorItemId = require('palletsPalletIdErrorsErrorItemId')

request = util.request(palletsPalletIdErrorsErrorItemId, '/pallets/%s')

delay = util.delay

done = util.done()
