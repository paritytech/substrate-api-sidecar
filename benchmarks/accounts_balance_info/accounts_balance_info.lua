-- Accounts balance-info endpoint benchmark script
-- Tests the /v1/accounts/{accountId}/balance-info endpoint for latency and throughput
-- Aligned with Sidecar benchmark parameters
--
-- Chain-aware: adds Polkadot-specific endpoints when connected to Polkadot.

local util = require("util")

local chain = os.getenv("BENCH_CHAIN") or "polkadot"

local endpoints = {}

if chain == "asset-hub-polkadot" or chain == "statemint" then
    -- Asset Hub Polkadot-specific accounts and blocks
    local asset_hub_endpoints = {
        '13ezbfrX5PRUAozxBmjV3L3kxX7qtPgkgEfEiuyB6S5MTxfm/balance-info?at=13115694',    -- spec_version 2000007, account with reserved balance, 1 lock
        '14fVzET43H1veBakLMfnBwc6TdyMDcYJp4SvURgvwTnwDTpJ/balance-info?at=12075832',    -- spec_version 2000006, account with 1 lock
        '1HJLZzCPyvkGPiSF8xGVUhdvCfjRNxAgR35ZeVAm7XmMbUq/balance-info?at=11416376',     -- spec_version 2000005, account with 1 lock
        '19KT274PAdSchBjDmnxh6vEMdy4QFU9Bo6jgMZhen3esYGG/balance-info?at=11020674',     -- spec_version 2000003, account with reserved balance, 0 locks
        '1UTL9yUkujidjibJNhK3rQaFxTofpw54ESyPKcyZbfrWBYp/balance-info?at=10354615',     -- spec_version 2000002, account with reserved balance, 1 lock
        '15oZuLbub9eg1A32Cs1cCFsuHtY6D5dYGKDqDAakk5HWXL9v/balance-info?at=10303784',    -- spec_version 2000001, account with reserved balance, 1 lock
        '13GkyD1qaw8PXG58DNKjRJ3ZQ32M4oHGQKjyqpG7rzLo8iGg/balance-info?at=10255440',    -- spec_version 2000000, account with 1 lock
        '12b9AA56Ko2zJ79qtvrb65vzQ6z85VjcYKMafSZY9sB7HaTt/balance-info?at=12732847',    -- spec_version 2000007, account with reserved balance, 1 lock
        '15PduAKJRMbgCHrQpHrfmXzVmLk5vhFKLZ9BmF8zPqf3NGq6/balance-info?at=12027165',    -- spec_version 2000006, account with reserved balance, 1 lock
        '15w1vVwrcXB7nuKqWMiU2KYAaypuz4AnENRF7Yprea7ZyseA/balance-info?at=11739814',    -- spec_version 2000005, account with reserved balance, 1 lock
        '13BL7Xi7EEMExv7j7GaBDZGZNiVCZzDtSCZgbQV8QNzntgDs/balance-info?at=11258574',    -- spec_version 2000003, account with reserved balance, 1 lock
        '13iXsjnpZPK3aagHKDm5p6UrNupUgLs3QMaqgBYdV4R7DmgJ/balance-info?at=10422548',    -- spec_version 2000002, account with reserved balance, 1 lock
        '13JsTxizvEUEeewFagowtFQaWpHbADWCoSkTGAY7QTSkvtWF/balance-info?at=10339370',    -- spec_version 2000001, account with reserved balance, 1 lock
        '12anbRqPN5Xs8D9CeNT7tGjp8QqAzUi3Q9qBvNZJZXrnHCfA/balance-info?at=10255269',    -- spec_version 2000000, account with reserved balance, 1 lock
    }
    for _, ep in ipairs(asset_hub_endpoints) do
        endpoints[#endpoints + 1] = ep
    end
else
    -- Base endpoints: Polkadot relay accounts with historical blocks (matching Sidecar)
    local base_endpoints = {
        '1KvKReVmUiTc2LW2a4qyHsaJJ9eE9LRsywZkMk5hyBeyHgw/balance-info?at=20000', -- v0
        '1KvKReVmUiTc2LW2a4qyHsaJJ9eE9LRsywZkMk5hyBeyHgw/balance-info?at=198702', -- v5
        '14Kq2Gt4buLr8XgRQmLtbWLHkejmhvGhiZDqLEzWcbe7jQTU/balance-info?at=2282256', -- v25
        '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=3574738', -- v26
        '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=4574738', -- v29
        '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=6574738', -- v9080
        '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=7241122', -- v9110
        '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=8000000', -- v9122
        '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=8320000', -- v9130
        '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=8500000', -- v9140
        '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=9000000', -- v9151
        '15kUt2i86LHRWCkE3D9Bg1HZAoc2smhn1fwPzDERTb1BXAkX/balance-info?at=9500000', -- v9170
    }
    for _, ep in ipairs(base_endpoints) do
        endpoints[#endpoints + 1] = ep
    end

    -- Polkadot relay-specific: additional newer blocks
    if chain == "polkadot" then
        local polkadot_endpoints = {
            '13YMK2efcJncYrXsaJCvHbaaDt3vfubdn75r4hdVxcggU4n2/balance-info?at=19500000',
            '13fkJhLhs5cNCZ1GDRtwQifDnTS3BAW3b6SfmwJjThyFh9SH/balance-info?at=21500200',
            '16Drp38QW5UXWMHT7n5d5mPPH1u5Qavuv6aYAhbHfN3nzToe/balance-info?at=23800500',
            '12rgGkphjoZ25FubPoxywaNm3oVhSHnzExnT6hsLnicuLaaj/balance-info?at=24200500',
            '12KHAurRWMFJyxU57S9pQerHsKLCwvWKM1d3dKZVx7gSfkFJ/balance-info?at=25100300',
        }
        for _, ep in ipairs(polkadot_endpoints) do
            endpoints[#endpoints + 1] = ep
        end
    end
end

util.print_endpoints(endpoints)

local counter = 1

request = function()
    local endpoint = endpoints[counter]
    counter = counter + 1
    if counter > #endpoints then
        counter = 1
    end
    return wrk.format("GET", util.prefix .. "/accounts/" .. endpoint)
end

done = util.done()
