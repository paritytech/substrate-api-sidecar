package.path = package.path .. ";../util/util.lua"
local util = require('util')
local palletsNominationPoolsInfo = require('palletsNominationPoolsInfo')

request = util.request(palletsNominationPoolsInfo, '/pallets/nomination-pools/%s')

delay = util.delay

done = util.done()
