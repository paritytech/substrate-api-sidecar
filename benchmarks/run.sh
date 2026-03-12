#!/bin/bash
# Copyright (C) 2026 Parity Technologies (UK) Ltd.
# SPDX-License-Identifier: GPL-3.0-or-later


# Unified benchmark runner script with chain-aware filtering
#
# Usage: ./run.sh <benchmark_name> [scenario] [hardware_profile]
#        ./run.sh --all [scenario] [hardware_profile] [results_dir]
#
# Chain detection is automatic by querying $API_PREFIX/runtime/spec
#
# Examples:
#   ./run.sh health
#   ./run.sh blocks light_load ci_runner
#   ./run.sh --all light_load development ~/results
#   ./run.sh --all medium_load dedicated_server ~/results

set -e

BENCHMARKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$BENCHMARKS_DIR/.." && pwd)"
CONFIG_FILE="$PROJECT_ROOT/benchmark_config.json"
API_PREFIX="${BENCH_API_PREFIX:-}"

# --- Chain detection functions ---

# Map spec_name to chain type
spec_to_chain_type() {
    local spec="$1"
    case "$spec" in
        polkadot|kusama|westend|rococo|paseo)
            echo "relay" ;;
        asset-hub-*|statemint|statemine|westmint)
            echo "asset-hub" ;;
        coretime-*)
            echo "coretime" ;;
        *)
            echo "parachain" ;;
    esac
}

# Detect chain by querying the API
detect_chain() {
    local host port base_url response chain_spec detect_url
    host=$(jq -r '.server.host' "$CONFIG_FILE")
    port=$(jq -r '.server.port' "$CONFIG_FILE")
    base_url="http://$host:$port"

    local prefix="$API_PREFIX"
    detect_url="$base_url${prefix}/capabilities"
    response=$(curl -sL --connect-timeout 5 "$detect_url" 2>/dev/null) || {
        echo "  (Could not connect to $detect_url)" >&2
        echo ""
        return
    }

    chain_spec=$(echo "$response" | jq -r '.chain // empty' 2>/dev/null) || {
        echo "  (Got response but could not parse chain field)" >&2
        echo ""
        return
    }

    if [ -z "$chain_spec" ]; then
        echo "  (Response missing chain field from $detect_url)" >&2
    fi

    echo "$chain_spec"
}

# Check if a benchmark is compatible with the detected chain type
benchmark_matches_chain() {
    local benchmark_name="$1"
    local chain_type="$2"

    # Get chains list from config (default to ["all"] if not set)
    local chains
    chains=$(jq -r ".benchmarks.\"$benchmark_name\".chains // [\"all\"] | .[]" "$CONFIG_FILE" 2>/dev/null)

    for chain in $chains; do
        if [ "$chain" = "all" ] || [ "$chain" = "$chain_type" ]; then
            return 0
        fi
    done
    return 1
}

# --- Parse arguments ---

ARGS=("$@")

# Resolve chain type by querying the API
resolve_chain_type() {
    CHAIN_SPEC=$(detect_chain)
    if [ -n "$CHAIN_SPEC" ]; then
        CHAIN_TYPE=$(spec_to_chain_type "$CHAIN_SPEC")
        echo "Detected chain: $CHAIN_SPEC (type: $CHAIN_TYPE)"
    else
        CHAIN_TYPE=""
        CHAIN_SPEC=""
        echo "Warning: Could not detect chain. Running all benchmarks without filtering."
    fi
    export BENCH_CHAIN="$CHAIN_SPEC"
    export BENCH_CHAIN_TYPE="$CHAIN_TYPE"
}

# --- --all mode: run all compatible benchmarks ---

if [ "${ARGS[0]}" = "--all" ]; then
    SCENARIO="${ARGS[1]:-medium_load}"
    HARDWARE_PROFILE="${ARGS[2]:-dedicated_server}"
    RESULTS_DIR="${ARGS[3]:-$HOME/results}"

    mkdir -p "$RESULTS_DIR"

    resolve_chain_type

    echo "Scenario: $SCENARIO | Hardware: $HARDWARE_PROFILE"
    echo "Results: $RESULTS_DIR"
    echo "---"

    TOTAL=0
    SKIPPED=0
    FAILED=0

    for bench_dir in "$BENCHMARKS_DIR"/*/; do
        name=$(basename "$bench_dir")
        [ ! -f "$bench_dir/${name}.lua" ] && continue

        # Filter by chain type if detected
        if [ -n "$CHAIN_TYPE" ] && ! benchmark_matches_chain "$name" "$CHAIN_TYPE"; then
            echo "SKIP: $name"
            SKIPPED=$((SKIPPED + 1))
            continue
        fi

        echo "RUN:  $name"
        if "$BENCHMARKS_DIR/run.sh" "$name" "$SCENARIO" "$HARDWARE_PROFILE" \
            > "$RESULTS_DIR/${name}.txt" 2>&1; then
            TOTAL=$((TOTAL + 1))
        else
            echo "FAIL: $name (see $RESULTS_DIR/${name}.txt)"
            FAILED=$((FAILED + 1))
        fi
    done

    echo "---"
    echo "Done. Ran: $TOTAL | Skipped: $SKIPPED | Failed: $FAILED"
    echo "Results: $RESULTS_DIR"
    exit 0
fi

# --- Single benchmark mode ---

BENCHMARK_NAME="${ARGS[0]:-}"
SCENARIO="${ARGS[1]:-light_load}"
HARDWARE_PROFILE="${ARGS[2]:-ci_runner}"

if [ -z "$BENCHMARK_NAME" ]; then
    echo "Usage: $0 <benchmark_name> [scenario] [hardware_profile]"
    echo "       $0 --all [scenario] [hardware_profile] [results_dir]"
    echo ""
    echo "Available benchmarks:"
    for dir in "$BENCHMARKS_DIR"/*/; do
        name=$(basename "$dir")
        if [ -f "$dir/${name}.lua" ]; then
            chains=$(jq -r ".benchmarks.\"$name\".chains // [\"all\"] | join(\",\")" "$CONFIG_FILE" 2>/dev/null)
            echo "  - $name [$chains]"
        fi
    done
    exit 1
fi

# Validate benchmark exists
SCRIPT_DIR="$BENCHMARKS_DIR/$BENCHMARK_NAME"
if [ ! -d "$SCRIPT_DIR" ] || [ ! -f "$SCRIPT_DIR/${BENCHMARK_NAME}.lua" ]; then
    echo "Error: Benchmark '$BENCHMARK_NAME' not found"
    echo "Expected directory: $SCRIPT_DIR"
    echo "Expected lua file: $SCRIPT_DIR/${BENCHMARK_NAME}.lua"
    exit 1
fi

# Resolve chain and check compatibility
resolve_chain_type

if [ -n "$CHAIN_TYPE" ] && ! benchmark_matches_chain "$BENCHMARK_NAME" "$CHAIN_TYPE"; then
    chains=$(jq -r ".benchmarks.\"$BENCHMARK_NAME\".chains // [\"all\"] | join(\", \")" "$CONFIG_FILE" 2>/dev/null)
    echo "SKIP: '$BENCHMARK_NAME' is not compatible with chain type '$CHAIN_TYPE' (requires: $chains)"
    exit 0
fi

# Validate hardware profile
if ! jq -e ".hardware_profiles.\"$HARDWARE_PROFILE\"" "$CONFIG_FILE" > /dev/null; then
    echo "Error: Hardware profile '$HARDWARE_PROFILE' not found in config"
    echo "Available profiles:"
    jq -r '.hardware_profiles | keys[]' "$CONFIG_FILE"
    exit 1
fi

# Check if scenario is supported by hardware profile
SUPPORTED_SCENARIOS=$(jq -r ".hardware_profiles.\"$HARDWARE_PROFILE\".scenarios[]" "$CONFIG_FILE")
if ! echo "$SUPPORTED_SCENARIOS" | grep -q "^$SCENARIO$"; then
    echo "Warning: Scenario '$SCENARIO' not recommended for hardware profile '$HARDWARE_PROFILE'"
    echo "Recommended scenarios: $SUPPORTED_SCENARIOS"
    echo "Continuing anyway..."
fi

# Helper function to get config value with fallback
get_config_value() {
    local key="$1"
    local value

    # Try custom scenarios first
    value=$(jq -r ".benchmarks.\"$BENCHMARK_NAME\".custom_scenarios[]? | select(.name == \"$SCENARIO\") | .$key" "$CONFIG_FILE")

    # Fall back to standard scenarios
    if [ -z "$value" ] || [ "$value" == "null" ]; then
        value=$(jq -r ".standard_scenarios[] | select(.name == \"$SCENARIO\") | .$key" "$CONFIG_FILE")
    fi

    echo "$value"
}

# Get benchmark configuration
THREADS=$(get_config_value "threads")
CONNECTIONS=$(get_config_value "connections")
DURATION=$(get_config_value "duration")
TIMEOUT=$(get_config_value "timeout")

if [ -z "$THREADS" ] || [ "$THREADS" == "null" ]; then
    echo "Error: Scenario '$SCENARIO' not found in config"
    exit 1
fi

# Get server configuration
SERVER_HOST=$(jq -r '.server.host' "$CONFIG_FILE")
SERVER_PORT=$(jq -r '.server.port' "$CONFIG_FILE")

# Get hardware profile description
PROFILE_DESC=$(jq -r ".hardware_profiles.\"$HARDWARE_PROFILE\".description" "$CONFIG_FILE")

# Generate display name from benchmark name (replace underscores with spaces)
DISPLAY_NAME=$(echo "$BENCHMARK_NAME" | tr '_' ' ')

ENDPOINT_PATH="${API_PREFIX}$(jq -r ".benchmarks.\"$BENCHMARK_NAME\".endpoint // \"unknown\"" "$CONFIG_FILE")"

echo "=========================================="
echo "Benchmark:  $DISPLAY_NAME"
echo "Endpoint:   $ENDPOINT_PATH"
echo "Scenario:   $SCENARIO"
echo "Hardware:   $HARDWARE_PROFILE ($PROFILE_DESC)"
echo "Config:     threads=$THREADS, connections=$CONNECTIONS, duration=$DURATION, timeout=${TIMEOUT:-120s}"
echo "=========================================="

# Clean up endpoint print lock from previous run
rm -f /tmp/_wrk_bench_endpoints_printed

# Export env vars for report.lua (used to label metrics)
export BENCH_ENDPOINT="$BENCHMARK_NAME"
export BENCH_SERVICE="polkadot-rest-api"
export BENCH_SCENARIO="$SCENARIO"
export BENCH_HARDWARE="$HARDWARE_PROFILE"
export BENCH_THREADS="$THREADS"
export BENCH_CONNECTIONS="$CONNECTIONS"
export BENCH_DURATION="$DURATION"

# Results directory
RESULTS_DIR="${BENCH_RESULTS_DIR:-$PROJECT_ROOT/results}/$BENCHMARK_NAME"
mkdir -p "$RESULTS_DIR"

# Run wrk benchmark
# stdout = human-readable output (displayed)
# stderr = JSON metrics line from report.lua (captured)
cd "$SCRIPT_DIR"
# Set LUA_PATH to include the benchmarks directory for require("report") etc.
export LUA_PATH="$BENCHMARKS_DIR/?.lua;;"
WRK_STDERR=$(mktemp)
wrk -d"$DURATION" -t"$THREADS" -c"$CONNECTIONS" --timeout "${TIMEOUT:-120s}" --latency \
    -s "./${BENCHMARK_NAME}.lua" "http://$SERVER_HOST:$SERVER_PORT" \
    2>"$WRK_STDERR"

# Save JSON results to file
if [ -s "$WRK_STDERR" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    RESULT_FILE="$RESULTS_DIR/${BENCHMARK_NAME}_${TIMESTAMP}.json"
    cp "$WRK_STDERR" "$RESULT_FILE"
    echo ""
    echo "Results saved: $RESULT_FILE"
fi

rm -f "$WRK_STDERR"
