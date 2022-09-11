package.path = package.path .. ";../util/util.lua"
local util = require('util')
local parasLeasesCurrent = require('parasLeasesCurrent')

request = util.request(parasLeasesCurrent, '/paras/leases/current?at=%s')

delay = util.delay

done = util.done()
