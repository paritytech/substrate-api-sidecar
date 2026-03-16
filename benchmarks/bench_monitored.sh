#!/usr/bin/env bash
# Copyright (C) 2026 Parity Technologies (UK) Ltd.
# SPDX-License-Identifier: GPL-3.0-or-later

# Run a benchmark with resource monitoring: baseline → load (×N) → cooldown
# Merges resource summary stats into the benchmark JSON file.
# Keeps the resource CSV alongside for full time-series data.
#
# Usage: ./bench_monitored.sh [--runs N] <port> <benchmark_name> <scenario> <hardware>
#
# Options:
#   --runs N    Run the load phase N times (default: 1). Baseline and cooldown
#               run once regardless. Each load run produces its own JSON result.
#
# Baseline and cooldown scale with scenario. Total time (single run):
#   light_load:   ~2.5 min  (1min baseline + 30s load  + 1min cooldown)
#   medium_load:  ~3 min    (1min baseline + 60s load  + 1min cooldown)
#   heavy_load:   ~4 min    (1min baseline + 120s load + 1min cooldown)
#   stress_test:  ~9 min    (2min baseline + 300s load + 2min cooldown)
#
# Examples:
#   ./bench_monitored.sh 8080 blocks_head medium_load dedicated_server
#   ./bench_monitored.sh --runs 5 8080 blocks_head medium_load dedicated_server

set -euo pipefail
export LC_ALL=C

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# --- Colors (only for the 3 phases + results) ---
RESET='\033[0m'
BOLD='\033[1m'
DIM='\033[2m'

C_HEADER='\033[38;5;75m'   # soft blue
C_INFO='\033[38;5;252m'    # light gray
C_IDLE='\033[38;5;114m'    # soft green
C_LOAD='\033[38;5;216m'    # soft orange
C_COOL='\033[38;5;117m'    # soft cyan
C_DONE='\033[38;5;150m'    # soft lime

# --- Parse --runs option ---
TOTAL_RUNS=1
if [ "${1:-}" = "--runs" ]; then
    if [ -z "${2:-}" ] || ! [[ "$2" =~ ^[0-9]+$ ]] || [ "$2" -lt 1 ]; then
        echo "Error: --runs requires a positive integer"
        exit 1
    fi
    TOTAL_RUNS="$2"
    shift 2
fi

if [ $# -lt 4 ]; then
    echo "Usage: $0 [--runs N] <port> <benchmark_name> <scenario> <hardware>"
    echo ""
    echo "Options:"
    echo "  --runs N    Run the load phase N times (default: 1)"
    echo ""
    echo "Baseline and cooldown scale with scenario:"
    echo "  light_load:   2.5 min  (1min + 30s  + 1min)"
    echo "  medium_load:  3 min    (1min + 60s  + 1min)"
    echo "  heavy_load:   4 min    (1min + 120s + 1min)"
    echo "  stress_test:  9 min    (2min + 300s + 2min)"
    echo ""
    echo "Examples:"
    echo "  $0 8080 blocks_head medium_load dedicated_server"
    echo "  $0 --runs 5 8080 blocks_head medium_load dedicated_server"
    exit 1
fi

PORT="$1"
BENCHMARK_NAME="$2"
SCENARIO="$3"
HARDWARE="$4"

# Baseline and cooldown: 2 min each for stress_test, 1 min for everything else
case "$SCENARIO" in
    stress_test) BASELINE_SEC=120; COOLDOWN_SEC=120 ;;
    *)           BASELINE_SEC=60;  COOLDOWN_SEC=60  ;;
esac

SERVICE="sidecar"

# Get benchmark duration from config
CONFIG_FILE="$PROJECT_ROOT/benchmark_config.json"
if [ -f "$CONFIG_FILE" ]; then
    DURATION_SEC=$(jq -r ".standard_scenarios[] | select(.name == \"${SCENARIO}\") | .duration // \"60s\"" "$CONFIG_FILE" | sed 's/s$//')
else
    DURATION_SEC=60
fi

# Total monitor time = baseline + (load × runs) + cooldown
TOTAL_LOAD_SEC=$((DURATION_SEC * TOTAL_RUNS))
TOTAL_MONITOR_SEC=$((BASELINE_SEC + TOTAL_LOAD_SEC + COOLDOWN_SEC))
MONITOR_DURATION_MIN=$(( (TOTAL_MONITOR_SEC + 59) / 60 ))
SESSION_ID="${SERVICE}_${BENCHMARK_NAME}_$(date +%Y%m%d_%H%M%S)_$$"
export RUN_ID="$SESSION_ID"
RESULTS_DIR="$PROJECT_ROOT/results/$BENCHMARK_NAME"
mkdir -p "$RESULTS_DIR"

RUNS_LABEL=""
if [ "$TOTAL_RUNS" -gt 1 ]; then
    RUNS_LABEL=" × ${TOTAL_RUNS} runs"
fi

echo ""
echo -e "${C_HEADER}${BOLD}==========================================${RESET}"
echo -e "${C_HEADER}${BOLD}  Benchmark with Resource Monitoring${RESET}"
echo -e "${C_HEADER}${BOLD}==========================================${RESET}"
echo -e "${C_INFO}  Service:    ${BOLD}$SERVICE${RESET}${C_INFO} (port $PORT)${RESET}"
echo -e "${C_INFO}  Benchmark:  ${BOLD}$BENCHMARK_NAME${RESET}"
echo -e "${C_INFO}  Scenario:   $SCENARIO${RESET}"
echo -e "${C_INFO}  Hardware:   $HARDWARE${RESET}"
echo -e "${C_IDLE}  Baseline:   ${BASELINE_SEC}s ${DIM}(idle before load)${RESET}"
echo -e "${C_LOAD}  Load:       ${DURATION_SEC}s${RUNS_LABEL} ${DIM}(wrk benchmark)${RESET}"
echo -e "${C_COOL}  Cooldown:   ${COOLDOWN_SEC}s ${DIM}(idle after load)${RESET}"
echo -e "${C_INFO}  Monitor:    ${MONITOR_DURATION_MIN}m total${RESET}"
echo -e "${C_INFO}  Session:    ${BOLD}$SESSION_ID${RESET}"
echo -e "${C_HEADER}${BOLD}==========================================${RESET}"
echo ""

# --- Start resource monitor (silent) ---
"$SCRIPT_DIR/resource_monitor.sh" "$PORT" "$MONITOR_DURATION_MIN" "$RESULTS_DIR" "$BENCHMARK_NAME" &
MONITOR_PID=$!

# --- Cleanup on Ctrl+C ---
cleanup() {
    echo ""
    echo -e "${C_LOAD}Interrupted — stopping monitor (PID $MONITOR_PID)...${RESET}"
    kill -INT "$MONITOR_PID" 2>/dev/null || true
    sleep 1
    wait "$MONITOR_PID" 2>/dev/null || true
    exit 130
}
trap cleanup INT TERM

# --- Phase 1: Baseline idle ---
echo -e "${C_IDLE}${BOLD}[1/3] Baseline${RESET}${C_IDLE} — idle for ${BASELINE_SEC}s${RESET}"
echo -e "${C_IDLE}─────────────────────────────────────────${RESET}"
sleep "$BASELINE_SEC"
echo ""

# --- Phase 2: Load (repeated TOTAL_RUNS times) ---
ALL_BENCH_JSONS=()
for CURRENT_RUN in $(seq 1 "$TOTAL_RUNS"); do
    if [ "$TOTAL_RUNS" -gt 1 ]; then
        echo -e "${C_LOAD}${BOLD}[2/3] Load run ${CURRENT_RUN}/${TOTAL_RUNS}${RESET}${C_LOAD} — $BENCHMARK_NAME $SCENARIO $HARDWARE${RESET}"
    else
        echo -e "${C_LOAD}${BOLD}[2/3] Benchmark${RESET}${C_LOAD} — $BENCHMARK_NAME $SCENARIO $HARDWARE${RESET}"
    fi
    echo -e "${C_LOAD}─────────────────────────────────────────${RESET}"
    export RUN_ID="${SERVICE}_${BENCHMARK_NAME}_$(date +%Y%m%d_%H%M%S)_$$"
    "$SCRIPT_DIR/run.sh" "$BENCHMARK_NAME" "$SCENARIO" "$HARDWARE"
    echo -e "${C_LOAD}─────────────────────────────────────────${RESET}"

    # Capture the JSON file produced by this run
    LATEST_JSON="$RESULTS_DIR/${RUN_ID}.json"
    if [ -f "$LATEST_JSON" ]; then
        # Tag with run number if multi-run
        if [ "$TOTAL_RUNS" -gt 1 ]; then
            jq --argjson run_number "$CURRENT_RUN" \
               --argjson total_runs "$TOTAL_RUNS" \
               '. + { run_number: $run_number, total_runs: $total_runs }' \
               "$LATEST_JSON" > "${LATEST_JSON}.tmp" && mv "${LATEST_JSON}.tmp" "$LATEST_JSON"
        fi
        ALL_BENCH_JSONS+=("$LATEST_JSON")
    fi
    echo ""

    # Brief pause between runs to ensure unique timestamps
    if [ "$CURRENT_RUN" -lt "$TOTAL_RUNS" ]; then
        sleep 2
    fi
done

# --- Phase 3: Cooldown ---
echo -e "${C_COOL}${BOLD}[3/3] Cooldown${RESET}${C_COOL} — idle for ${COOLDOWN_SEC}s${RESET}"
echo -e "${C_COOL}─────────────────────────────────────────${RESET}"
sleep "$COOLDOWN_SEC"
echo ""

# --- Stop monitor (give it time to print summary) ---
kill -INT "$MONITOR_PID" 2>/dev/null || true
sleep 2
wait "$MONITOR_PID" 2>/dev/null || true

# --- Merge resource stats into benchmark JSON(s) ---
RESOURCE_CSV="$RESULTS_DIR/resources_${SESSION_ID}.csv"

if [ -f "$RESOURCE_CSV" ]; then
    RESOURCE_STATS=$(awk -F',' '
        /^#/ { next }
        /^timestamp/ { next }
        {
            rss = $3 + 0
            cpu = $6 + 0
            if (NR_DATA == 0) start_rss = rss
            NR_DATA++
            if (rss > peak_rss) peak_rss = rss
            if (cpu + 0 > peak_cpu + 0) peak_cpu = cpu
            sum_cpu += cpu
            end_rss = rss
        }
        END {
            if (NR_DATA > 0) {
                printf "%.2f %.2f %.2f %.2f %.1f %.1f %.0f",
                    start_rss/1024, peak_rss/1024, end_rss/1024,
                    (end_rss - start_rss)/1024,
                    sum_cpu/NR_DATA, peak_cpu, NR_DATA
            }
        }
    ' "$RESOURCE_CSV")

    if [ -n "$RESOURCE_STATS" ]; then
        START_RSS=$(echo "$RESOURCE_STATS" | awk '{print $1}')
        PEAK_RSS=$(echo "$RESOURCE_STATS" | awk '{print $2}')
        END_RSS=$(echo "$RESOURCE_STATS" | awk '{print $3}')
        DELTA_RSS=$(echo "$RESOURCE_STATS" | awk '{print $4}')
        AVG_CPU=$(echo "$RESOURCE_STATS" | awk '{print $5}')
        PEAK_CPU=$(echo "$RESOURCE_STATS" | awk '{print $6}')
        SAMPLES=$(echo "$RESOURCE_STATS" | awk '{print $7}')

        # Merge resource stats into each benchmark JSON
        for BENCH_JSON in "${ALL_BENCH_JSONS[@]}"; do
            jq --arg session_id "$SESSION_ID" \
               --argjson start_rss "$START_RSS" \
               --argjson peak_rss "$PEAK_RSS" \
               --argjson end_rss "$END_RSS" \
               --argjson delta_rss "$DELTA_RSS" \
               --argjson avg_cpu "$AVG_CPU" \
               --argjson peak_cpu "$PEAK_CPU" \
               --argjson samples "$SAMPLES" \
               --argjson baseline_sec "$BASELINE_SEC" \
               --argjson cooldown_sec "$COOLDOWN_SEC" \
               '. + { resources: {
                   session_id: $session_id,
                   start_rss_mb: $start_rss,
                   peak_rss_mb: $peak_rss,
                   end_rss_mb: $end_rss,
                   delta_rss_mb: $delta_rss,
                   avg_cpu_pct: $avg_cpu,
                   peak_cpu_pct: $peak_cpu,
                   samples: $samples,
                   baseline_sec: $baseline_sec,
                   cooldown_sec: $cooldown_sec
               }}' "$BENCH_JSON" > "${BENCH_JSON}.tmp" && mv "${BENCH_JSON}.tmp" "$BENCH_JSON"
        done
    fi
fi

# --- Per-run results ---
echo -e "${C_DONE}${BOLD}==========================================${RESET}"
echo -e "${C_DONE}${BOLD}  Results${RESET}"
echo -e "${C_DONE}${BOLD}==========================================${RESET}"
if [ ${#ALL_BENCH_JSONS[@]} -gt 0 ] && [ -n "${RESOURCE_STATS:-}" ]; then
    echo -e "${C_DONE}  RSS:  ${START_RSS} → ${PEAK_RSS} (peak) → ${END_RSS} MB  (${DELTA_RSS} delta)${RESET}"
    echo -e "${C_DONE}  CPU:  avg ${AVG_CPU}% | peak ${PEAK_CPU}%${RESET}"
    for BENCH_JSON in "${ALL_BENCH_JSONS[@]}"; do
        echo -e "${C_DONE}  JSON: ${BENCH_JSON}${RESET}"
    done
    echo -e "${C_DONE}  CSV:  ${RESOURCE_CSV}${RESET}"
else
    [ ${#ALL_BENCH_JSONS[@]} -eq 0 ] && echo -e "${C_DONE}  Warning: no benchmark JSON found${RESET}"
    [ ! -f "$RESOURCE_CSV" ] && echo -e "${C_DONE}  Warning: no resource CSV found${RESET}"
fi
echo -e "${C_DONE}${BOLD}==========================================${RESET}"

# --- Multi-run summary ---
if [ "$TOTAL_RUNS" -gt 1 ] && [ ${#ALL_BENCH_JSONS[@]} -gt 1 ]; then
    SUMMARY_FILE="$RESULTS_DIR/${BENCHMARK_NAME}_summary_$(date +%Y%m%d_%H%M%S).json"
    echo ""
    echo -e "${C_HEADER}${BOLD}==========================================${RESET}"
    echo -e "${C_HEADER}${BOLD}  Summary: ${#ALL_BENCH_JSONS[@]}/${TOTAL_RUNS} runs${RESET}"
    echo -e "${C_HEADER}${BOLD}==========================================${RESET}"
    jq -s '{
        runs: length,
        avg_rps: ([.[].rps] | add / length),
        min_rps: ([.[].rps] | min),
        max_rps: ([.[].rps] | max),
        avg_p99_ms: ([.[].p99_ms] | add / length),
        min_p99_ms: ([.[].p99_ms] | min),
        max_p99_ms: ([.[].p99_ms] | max),
        avg_avg_latency_ms: ([.[].avg_latency_ms] | add / length),
        total_requests: [.[].total_requests] | add,
        total_errors: [.[].errors] | add
    }' "${ALL_BENCH_JSONS[@]}" | tee "$SUMMARY_FILE" | \
    jq -r '"  RPS:      avg \(.avg_rps | round)  min \(.min_rps | round)  max \(.max_rps | round)\n  P99:      avg \(.avg_p99_ms)ms  min \(.min_p99_ms)ms  max \(.max_p99_ms)ms\n  Latency:  avg \(.avg_avg_latency_ms)ms\n  Requests: \(.total_requests) total  \(.total_errors) errors"' | \
    while IFS= read -r line; do echo -e "${C_DONE}${line}${RESET}"; done
    echo -e "${C_DONE}  File:  ${SUMMARY_FILE}${RESET}"
    echo -e "${C_HEADER}${BOLD}==========================================${RESET}"
fi
echo ""
