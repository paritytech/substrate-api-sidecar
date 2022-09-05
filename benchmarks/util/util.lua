local U = {}

function U.shuffle(paths)
    local j, k
    local n = #paths

    for i = 1, n do
        j, k = math.random(n), math.random(n)
        paths[j], paths[k] = paths[k], paths[j]
    end

    return paths
end

function U.request(paths_obj, path)
    counter = 1

    return function() 
        local shuffle_data = U.shuffle(paths_obj)

        if counter > #shuffle_data then
            counter = 1
        end
    
        local height = shuffle_data[counter]
        counter = counter + 1
    
        local path  = string.format(path, height)
    
        return wrk.format('GET', path)
    end
end

function U.delay()
    return 1
end

function U.done()
    return function(summary, latency, requests)
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
end

return U
