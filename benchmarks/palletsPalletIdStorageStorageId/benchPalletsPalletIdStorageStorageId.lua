package.path = package.path .. ";../util/util.lua"
local util = require('util')
local palletsPalletIdStorageStorageId = require('palletsPalletIdStorageStorageId')

request = util.request(palletsPalletIdStorageStorageId, '/pallets/%s')

delay = util.delay

done = util.done()
