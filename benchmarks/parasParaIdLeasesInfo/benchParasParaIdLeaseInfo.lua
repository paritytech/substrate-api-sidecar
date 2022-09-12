package.path = package.path .. ";../util/util.lua"
local util = require('util')
local parasParaIdLeaseInfo = require('parasParaIdLeaseInfo')

request = util.request(parasParaIdLeaseInfo, '/paras/%s')

delay = util.delay

done = util.done()
