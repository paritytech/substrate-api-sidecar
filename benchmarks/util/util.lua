-- Copyright 2017-2023 Parity Technologies (UK) Ltd.
-- This file is part of Substrate API Sidecar.
--
-- Substrate API Sidecar is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see <http://www.gnu.org/licenses/>.

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

        print("--------------------------")
        print("Total completed requests:       ", summary.requests)
        print("Failed requests:                ", summary.errors.status)
        print("Timeouts:                       ", summary.errors.status)
        print("Avg RequestTime(Latency):          "..string.format("%.2f",latency.mean / 1000).."ms")
        print("Max RequestTime(Latency):          "..(latency.max / 1000).."ms")
        print("Min RequestTime(Latency):          "..(latency.min / 1000).."ms")
        print("Benchmark finished.")
    end
end

return U
