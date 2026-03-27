-- Report module for wrk benchmarks
-- Outputs JSON with latency percentiles and throughput to stderr
-- Used by run.sh to capture structured results and save to results/ directory
--
-- Usage: wrk automatically calls the done() function when the benchmark completes.
-- The JSON is written to stderr so it doesn't mix with wrk's stdout output.

local report = {}

function report.done()
    return function(summary, latency, requests)
        local endpoint = os.getenv("BENCH_ENDPOINT") or "unknown"
        local service = os.getenv("BENCH_SERVICE") or "polkadot-rest-api"
        local scenario = os.getenv("BENCH_SCENARIO") or "unknown"
        local hardware = os.getenv("BENCH_HARDWARE") or "unknown"
        local threads = os.getenv("BENCH_THREADS") or "0"
        local connections = os.getenv("BENCH_CONNECTIONS") or "0"
        local chain = os.getenv("BENCH_CHAIN") or "unknown"

        local rps = summary.requests / (summary.duration / 1e6)
        local transfer_per_sec = summary.bytes / (summary.duration / 1e6)
        local errors_total = summary.errors.status
            + summary.errors.connect
            + summary.errors.read
            + summary.errors.write
            + summary.errors.timeout

        local json = string.format(
            '{"endpoint":"%s","service":"%s","scenario":"%s","hardware":"%s","threads":%s,"connections":%s,"chain":"%s",'
            .. '"rps":%.2f,"avg_latency_ms":%.2f,"stdev_ms":%.2f,"max_latency_ms":%.2f,"min_latency_ms":%.2f,'
            .. '"p50_ms":%.2f,"p75_ms":%.2f,"p90_ms":%.2f,"p95_ms":%.2f,"p99_ms":%.2f,"p999_ms":%.2f,'
            .. '"req_sec_avg":%.2f,"req_sec_stdev":%.2f,"req_sec_max":%.2f,'
            .. '"errors_total":%d,"errors_status":%d,"errors_connect":%d,"errors_read":%d,"errors_write":%d,"errors_timeout":%d,'
            .. '"total_requests":%d,"duration_s":%.2f,"bytes":%d,"transfer_per_sec":%.2f}',
            endpoint,
            service,
            scenario,
            hardware,
            threads,
            connections,
            chain,
            rps,
            latency.mean / 1000,
            latency.stdev / 1000,
            latency.max / 1000,
            latency.min / 1000,
            latency:percentile(50) / 1000,
            latency:percentile(75) / 1000,
            latency:percentile(90) / 1000,
            latency:percentile(95) / 1000,
            latency:percentile(99) / 1000,
            latency:percentile(99.9) / 1000,
            requests.mean,
            requests.stdev,
            requests.max,
            errors_total,
            summary.errors.status,
            summary.errors.connect,
            summary.errors.read,
            summary.errors.write,
            summary.errors.timeout,
            summary.requests,
            summary.duration / 1e6,
            summary.bytes,
            transfer_per_sec
        )

        -- Write JSON to stderr (captured by run.sh)
        io.stderr:write(json .. "\n")

        -- Print human-readable summary to stdout (matches original util.done() format)
        print("--------------------------")
        print("Total completed requests:       ", summary.requests)
        print("Failed requests:                ", summary.errors.status)
        print("Timeouts:                       ", summary.errors.connect or 0)
        print("Avg RequestTime(Latency):          "..string.format("%.2f", latency.mean / 1000).."ms")
        print("Max RequestTime(Latency):          "..(latency.max / 1000).."ms")
        print("Min RequestTime(Latency):          "..(latency.min / 1000).."ms")
        print("Benchmark finished.")
    end
end

return report
