package.path = package.path .. ";../util/util.lua"
local util = require('util')
local palletsNominationPoolsPoolId = require('palletsNominationPoolsPoolId')

request = util.request(palletsNominationPoolsPoolId, '/pallets/nomination-pools/%s')

delay = util.delay

done = util.done()
