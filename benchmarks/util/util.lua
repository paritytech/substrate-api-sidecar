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

return U
