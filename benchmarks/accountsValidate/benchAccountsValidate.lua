package.path = package.path .. ";../util/util.lua"
local util = require('util')
local accountsValidate = require('accountsValidate')

request = util.request(accountsValidate, '/accounts/%s')

delay = util.delay

done = util.done()
