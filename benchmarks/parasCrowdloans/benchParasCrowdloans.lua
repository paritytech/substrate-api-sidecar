package.path = package.path .. ";../util/util.lua"
local util = require('util')
local parasCrowdloans = require('parasCrowdloans')

request = util.request(parasCrowdloans, '/paras/crowdloans?at=%s')

delay = util.delay

done = util.done()
