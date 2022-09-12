package.path = package.path .. ";../util/util.lua"
local util = require('util')
local parasParaIdCrowdloanInfo = require('parasParaIdCrowdloanInfo')

request = util.request(parasParaIdCrowdloanInfo, '/paras/%s')

delay = util.delay

done = util.done()
