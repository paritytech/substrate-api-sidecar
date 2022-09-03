package.path = package.path .. ";../util/util.lua"
local util = require('util')
local blocks = require('blocks')

counter = 1
request = function()
    local shuffle_data = util.shuffle(blocks)

    if counter > #shuffle_data then
      counter = 1
    end

    local height = shuffle_data[counter]
    counter = counter + 1

    local path  = string.format('/blocks/%s', height)

    return wrk.format('GET', path)
end

delay = function()
    -- delay each request by 1 millisecond
    return 1
end

done = function(summary, latency, requests)
    local bytes = summary.bytes
    local errors = summary.errors.status -- http status is not at the beginning of 200,300
    local requests = summary.requests -- total requests

    print("--------------------------\n")
    print("Total completed requests: ", summary.requests)
    print("Failed requests: ", summary.errors.status)
    print("Timeouts: ", summary.errors.status)
    print("Average latency: ", (latency.mean/1000).."ms")
    print("--------------------------\n")
    print("Total completed requests: " .. requests .. "\n")
    print("Failed requests: " .. errors .. "\n")
    print("Timeouts: " .. errors .. "\n")
    print("Avg RequestTime(Latency):          "..string.format("%.2f",latency.mean / 1000).."ms".."\n")
    print("Max RequestTime(Latency):          "..(latency.max / 1000).."ms".."\n")
    print("Min RequestTime(Latency):          "..(latency.min / 1000).."ms".."\n")
    print("--------------------------\n")
    print("AvgRequestTime(Latency,ms):        "..string.format("%.2f",latency.mean / 1000).."\n")
    print("--------------------------\n")
end
