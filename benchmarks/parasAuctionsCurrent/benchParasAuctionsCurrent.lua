package.path = package.path .. ";../util/util.lua"
local util = require('util')
local parasAuctionsCurrent = require('parasAuctionsCurrent')

request = util.request(parasAuctionsCurrent, '/paras/auctions/current?at=%s')

delay = util.delay

done = util.done()
