# Benchmarks

Load testing suite for substrate-api-sidecar using [wrk](https://github.com/wg/wrk).

## Prerequisites

- [wrk](https://github.com/wg/wrk) installed
- [jq](https://jqlang.github.io/jq/) installed
- Sidecar running (default: `http://localhost:8080`)
- Fully synced Polkadot archive node

### Mac

```bash
brew install wrk lua jq
```

### Linux

```bash
sudo apt install lua5.1 jq

git clone https://github.com/wg/wrk.git wrk
cd wrk
make
sudo cp wrk /usr/local/bin
```

## Quick Start

```bash
# Run a single benchmark
./benchmarks/run.sh blocks

# Run with a specific scenario and hardware profile
./benchmarks/run.sh blocks medium_load dedicated_server

# Run all compatible benchmarks
./benchmarks/run.sh --all medium_load dedicated_server

# List available benchmarks
./benchmarks/run.sh
```

## run.sh

```
Usage: ./run.sh <benchmark_name> [scenario] [hardware_profile]
       ./run.sh --all [scenario] [hardware_profile] [results_dir]
```

### Scenarios

| Scenario | Threads | Connections | Duration | Best for |
|----------|---------|-------------|----------|----------|
| `light_load` | 2 | 10 | 30s | Development, CI |
| `medium_load` | 4 | 50 | 60s | General testing |
| `heavy_load` | 8 | 100 | 120s | Dedicated servers |
| `stress_test` | 12 | 200 | 300s | Finding breaking points |

### Hardware Profiles

| Profile | Recommended scenarios |
|---------|----------------------|
| `development` | light_load |
| `macbook` | light_load, medium_load |
| `ci_runner` | light_load, medium_load |
| `dedicated_server` | medium_load, heavy_load, stress_test |

### Chain-Aware Filtering

The runner auto-detects the connected chain by querying `/runtime/spec`. Benchmarks that are incompatible with the detected chain type (relay, asset-hub, coretime, parachain) are automatically skipped.

### Results

Each benchmark run saves a JSON file to `results/` with metrics:

```json
{
  "endpoint": "blocks",
  "service": "sidecar",
  "rps": 587.05,
  "avg_latency_ms": 85.08,
  "p50_ms": 75.90,
  "p90_ms": 99.61,
  "p95_ms": 120.50,
  "p99_ms": 301.12,
  "p999_ms": 450.00,
  "errors": 0,
  "total_requests": 35256,
  "duration_s": 60.00
}
```

Files are named `<benchmark>_<timestamp>.json` (e.g., `blocks_20260306_143022.json`).

## Modes Overview

| Mode | Command | What it does | What you get |
|------|---------|-------------|--------------|
| **Standalone resource monitor** | `./benchmarks/resource_monitor.sh [port]` | Monitors CPU and memory of the sidecar process on a given port | Timestamped CSV with per-second RSS, VSZ, and CPU samples + summary (start/peak/end RSS, avg/peak CPU). Lightweight, no load generation — pair with your own traffic or manual testing. No dependencies beyond `ps`. |
| **Benchmark runner** | `./benchmarks/run.sh <name> <scenario> <hardware>` | Runs wrk-based HTTP load tests against specific endpoints | Human-readable wrk output (RPS, latency percentiles, transfer rates) + JSON results file. Auto-detects the connected chain and skips incompatible benchmarks. |
| **Benchmark with resource monitoring** | `./benchmarks/bench_monitored.sh <port> <name> <scenario> <hardware>` | Combines the benchmark runner with the resource monitor in a 3-phase run: baseline → load → cooldown | Both benchmark metrics (latency, throughput) and resource metrics (memory, CPU) in a single correlated run. Resource stats are merged into the benchmark JSON. Baseline and cooldown phases capture idle resource usage for comparison against load. |

## Standalone resource monitor

Monitors CPU and memory usage of the sidecar process during benchmarks or standalone use. Auto-detects the process listening on the given port.

```
Usage: ./resource_monitor.sh [port] [duration_minutes] [output_dir] [endpoint]
```

All arguments are optional.

| Argument | Default | Description |
|----------|---------|-------------|
| `port` | `8080` (or `MONITOR_PORT` env) | Port sidecar listens on |
| `duration_minutes` | `15` | Monitoring duration in minutes |
| `output_dir` | `../results` | Output directory |
| `endpoint` | `general` | Label for filenames and display. Set automatically by `bench_monitored.sh` to tag resource data per benchmark. |

### Examples

```bash
# Monitor port 8080 for 15 minutes (all defaults)
./benchmarks/resource_monitor.sh

# Monitor port 8080 for 5 minutes
./benchmarks/resource_monitor.sh 8080 5

# Custom output directory
./benchmarks/resource_monitor.sh 8080 15 ~/out

# With endpoint label (used by bench_monitored.sh)
./benchmarks/resource_monitor.sh 8080 15 ~/out blocks
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MONITOR_PORT` | `8080` | Port to find the sidecar process on (used when port arg is omitted) |
| `MONITOR_PID` | _(auto-detect)_ | Skip port detection, monitor this PID directly |

### Output

- **Live**: RSS and CPU updated every second in terminal
- **CSV**: Saved to `results/resources_<service>_<endpoint>_<timestamp>.csv` with columns: `timestamp, elapsed_s, rss_kb, vsz_kb, rss_mb, cpu_pct`
- **Summary**: Printed on exit (Ctrl+C or duration reached) with start/peak/end RSS, delta, avg/peak CPU

### Typical Workflow

Run the resource monitor in one terminal, the benchmark in another:

```bash
# Terminal 1: start monitoring
./benchmarks/resource_monitor.sh

# Terminal 2: run benchmark
./benchmarks/run.sh blocks medium_load dedicated_server

# When the benchmark finishes, Ctrl+C the monitor to see the summary
```

## Benchmark with resource monitoring

Runs a benchmark with resource monitoring in three phases: baseline (idle) → load (wrk benchmark, repeated N times) → cooldown (idle). Resource stats are merged into the benchmark JSON result file.

### Why three phases?

Running `run.sh` alone only gives you metrics during load. The 3-phase structure adds context:

- **Baseline** — records resting memory and CPU before any load hits, giving you the "before" snapshot.
- **Load** — runs the wrk benchmark while resource monitoring continues, capturing memory and CPU under stress. With `--runs N`, the load phase repeats N times back-to-back, each producing its own JSON result. Baseline and cooldown still run only once.
- **Cooldown** — shows whether memory drops back down after load stops. If RSS stays elevated after cooldown, that's a potential memory leak.

This also produces a **single JSON result file** (per run) with both throughput/latency and resource data merged together, instead of having to manually correlate separate wrk output and CSV files. With `--runs`, a summary JSON is also produced with min/max/avg across all runs.

```
Usage: ./bench_monitored.sh [--runs N] <port> <benchmark_name> <scenario> <hardware>
```

| Option | Default | Description |
|--------|---------|-------------|
| `--runs N` | 1 | Repeat the load phase N times. Baseline and cooldown run once. |

Baseline and cooldown durations scale with the scenario:

| Scenario | Total time (1 run) | Breakdown |
|----------|-----------|-----------|
| `light_load` | ~2.5 min | 1 min baseline + 30s load + 1 min cooldown |
| `medium_load` | ~3 min | 1 min baseline + 60s load + 1 min cooldown |
| `heavy_load` | ~4 min | 1 min baseline + 120s load + 1 min cooldown |
| `stress_test` | ~9 min | 2 min baseline + 300s load + 2 min cooldown |

### Examples

```bash
# Single run
./benchmarks/bench_monitored.sh 8080 blocks medium_load dedicated_server

# 5 load runs with shared baseline/cooldown
./benchmarks/bench_monitored.sh --runs 5 8080 blocks medium_load dedicated_server
```

### Output

The JSON result file in `results/<benchmark>/` includes both wrk metrics and a `resources` section:

```json
{
  "endpoint": "blocks",
  "rps": 587.05,
  "p99_ms": 301.12,
  "resources": {
    "start_rss_mb": 45.2,
    "peak_rss_mb": 78.3,
    "end_rss_mb": 72.1,
    "delta_rss_mb": 26.9,
    "avg_cpu_pct": 12.5,
    "peak_cpu_pct": 35.0,
    "baseline_sec": 60,
    "cooldown_sec": 60
  }
}
```

## Benchmarked Endpoints

### Accounts
- `/accounts/{accountId}/balance-info?at={blockId}`
- `/accounts/{accountId}/vesting-info?at={blockId}`
- `/accounts/{accountId}/staking-info?at={blockId}`
- `/accounts/{accountId}/staking-payouts`
- `/accounts/{accountId}/convert`
- `/accounts/{accountId}/validate`

### Blocks
- `/blocks/{blockId}`
- `/blocks/{blockId}/header`
- `/blocks/{blockId}/extrinsics/{extrinsicIndex}`
- `/blocks/head`
- `/blocks/head/header`

### Node
- `/node/network`
- `/node/transaction-pool`
- `/node/version`

### Pallets
- `/pallets/staking/progress?at={blockId}`
- `/pallets/{palletId}/storage?at={blockId}`
- `/pallets/{palletId}/storage/{storageItemId}?at={blockId}`
- `/pallets/nomination-pools/info`
- `/pallets/nomination-pools/{poolId}`
- `/pallets/{palletId}/errors`
- `/pallets/{palletId}/errors/{errorItemId}`
- `/pallets/staking/validators`

### Paras
- `/paras?at={blockId}`
- `/paras/leases/current?at={blockId}`
- `/paras/auctions/current?at={blockId}`
- `/paras/crowdloans?at={blockId}`
- `/paras/{paraId}/crowdloan-info?at={blockId}`
- `/paras/{paraId}/lease-info?at={blockId}`

### Runtime
- `/runtime/spec`

### Transaction
- `/transaction/material`

## Running via yarn (Legacy)

Benchmarks can also be run from the project root using yarn:

```bash
yarn bench
yarn bench --log-level=info --time=30s
yarn bench --log-level=info --time=30s --endpoint=/accounts/{accountId}/balance-info
```

| Flag | Default | Description |
|------|---------|-------------|
| `--ws-url` | `ws://127.0.0.1:9944` | WebSocket URL of the node |
| `--endpoint` | _(all)_ | Run a single benchmark endpoint |
| `--log-level` | `http` | Sidecar log level during benchmarks |
| `--time` | `1m` | Duration per benchmark (`1m`, `30s`, `15s`) |

## Configuration

All benchmark settings are in `benchmark_config.json` at the project root. This includes:

- Server host/port
- Hardware profiles and their allowed scenarios
- Scenario definitions (threads, connections, duration)
- Chain type mappings
- Per-benchmark chain compatibility

## Adding a New Benchmark

1. Create a directory under `benchmarks/` matching the benchmark name
2. Add a Lua script with the same name (e.g., `benchmarks/my_endpoint/my_endpoint.lua`)
3. Add an entry in `benchmark_config.json` under `"benchmarks"`
4. The Lua script should use `util.lua` for the `request()`, `done()`, and optionally `print_endpoints()` helpers

## Benchmarks Published

Benchmarks are automatically published in GitHub Pages at https://paritytech.github.io/substrate-api-sidecar/dev/bench/. The data in the graphs are updated with every new commit/push in the `master` branch (refer to the [benchmark.yml](https://github.com/paritytech/substrate-api-sidecar/blob/master/.github/workflows/benchmark.yml) for more details).