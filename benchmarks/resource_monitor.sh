#!/usr/bin/env bash
# Copyright (C) 2026 Parity Technologies (UK) Ltd.
# SPDX-License-Identifier: GPL-3.0-or-later

# Monitor CPU and memory usage of the API process during benchmarks
#
# Usage: ./resource_monitor.sh [port] [duration_minutes] [output_dir] [endpoint]
#
# All arguments are optional. Auto-detects the process listening on the
# given port, logs RSS/VSZ/CPU every 1 second to a timestamped CSV file,
# and prints a summary when stopped (Ctrl+C or duration reached).
#
# Arguments:
#   port             Port the API listens on (default: 8080, or MONITOR_PORT env)
#   duration_minutes Monitoring duration in minutes (default: 15)
#   output_dir       Output directory (default: ../results)
#   endpoint         Label for filenames/display (default: general).
#                    Used by bench_monitored.sh to tag resource data per benchmark.
#
# Examples:
#   ./resource_monitor.sh                                # monitor port 8080, 15 min
#   ./resource_monitor.sh 8080                           # same, explicit port
#   ./resource_monitor.sh 8080 5                         # port 8080, 5 min
#   ./resource_monitor.sh 8080 15 ~/out                  # custom output dir
#   ./resource_monitor.sh 8080 15 ~/out blocks_head      # label as blocks_head (used by bench_monitored.sh)
#
# Output file: resources_<service>_<endpoint>_<timestamp>.csv
#
# Environment:
#   MONITOR_PORT  — port to find the process on (default: 8080)
#   MONITOR_PID   — skip auto-detection, monitor this PID directly
#   MONITOR_HOST  — SSH host for remote monitoring (e.g., ubuntu@10.0.0.5).
#                   When set, all process detection and sampling runs on the
#                   remote machine via a persistent SSH connection (ControlMaster).
#                   The CSV output is still written locally on the bench machine.
#
# Works on both Linux and macOS (local and remote).

set -euo pipefail

# --- Remote monitoring via SSH (persistent connection) ---

REMOTE="${MONITOR_HOST:-}"
SSH_CTRL=""

if [ -n "$REMOTE" ]; then
    SSH_CTRL_DIR=$(mktemp -d)
    SSH_CTRL="$SSH_CTRL_DIR/ctrl-socket"
    # Open persistent SSH connection (ControlMaster)
    ssh -fN -o ControlMaster=yes -o ControlPath="$SSH_CTRL" \
        -o ConnectTimeout=10 -o ServerAliveInterval=15 "$REMOTE" 2>/dev/null
    rcmd() { ssh -o ControlPath="$SSH_CTRL" "$REMOTE" "$@"; }
    cleanup_ssh() {
        ssh -o ControlPath="$SSH_CTRL" -O exit "$REMOTE" 2>/dev/null || true
        rm -rf "$SSH_CTRL_DIR"
    }
else
    rcmd() { eval "$@"; }
    cleanup_ssh() { :; }
fi

PORT="${1:-${MONITOR_PORT:-8080}}"
DURATION_MINUTES="${2:-15}"
OUTPUT_DIR="${3:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/results}"
ENDPOINT="${4:-general}"

SERVICE="sidecar"

mkdir -p "$OUTPUT_DIR"

# --- Find the API process ---

find_pid_on_port() {
    local port="$1"
    local pid=""

    # Try lsof first, then ss (works both locally and via rcmd for remote)
    pid=$(rcmd "lsof -ti tcp:$port -sTCP:LISTEN 2>/dev/null | head -1" 2>/dev/null) || true
    if [ -z "$pid" ]; then
        pid=$(rcmd "ss -tlnp 'sport = :$port' 2>/dev/null | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1" 2>/dev/null) || true
    fi

    echo "$pid"
}

if [ -n "${MONITOR_PID:-}" ]; then
    PID="$MONITOR_PID"
    if ! rcmd "kill -0 $PID" 2>/dev/null; then
        echo "Error: PID $PID is not running"
        cleanup_ssh
        exit 1
    fi
else
    PID=$(find_pid_on_port "$PORT")
    if [ -z "$PID" ]; then
        echo "Error: No process found listening on port $PORT"
        if [ -n "$REMOTE" ]; then
            echo "Checked on remote host: $REMOTE"
        fi
        echo "Start the API server first, or set MONITOR_PID manually."
        cleanup_ssh
        exit 1
    fi
fi

# Get process name for display and filename
# Try multiple methods: comm (short), then args (full command line)
PROC_NAME=$(rcmd "ps -p $PID -o comm=" 2>/dev/null | xargs) || true
if [ -z "$PROC_NAME" ]; then
    PROC_NAME=$(rcmd "ps -p $PID -o args=" 2>/dev/null | awk '{print $1}' | xargs) || true
fi
if [ -z "$PROC_NAME" ]; then
    # Linux: read from /proc if ps fails
    PROC_NAME=$(rcmd "cat /proc/$PID/comm" 2>/dev/null) || true
fi
if [ -z "$PROC_NAME" ]; then
    PROC_NAME="unknown"
fi
# Extract just the binary name (strip path)
PROC_SHORT=$(basename "$PROC_NAME")

# Get number of CPU cores for calculating CPU percentage
NUM_CPUS=$(rcmd "nproc" 2>/dev/null) || true
if [ -z "$NUM_CPUS" ]; then
    NUM_CPUS=$(rcmd "sysctl -n hw.ncpu" 2>/dev/null) || true
fi
if [ -z "$NUM_CPUS" ]; then
    NUM_CPUS=1
fi

# --- Setup output file ---

# RUN_ID can be passed via env (from bench_monitored.sh) or generated here
RUN_ID="${RUN_ID:-${SERVICE}_${ENDPOINT}_$(date +%Y%m%d_%H%M%S)}"
CSV_FILE="$OUTPUT_DIR/resources_${RUN_ID}.csv"

echo "Resource Monitor"
if [ -n "$REMOTE" ]; then
    echo "  Remote:   $REMOTE"
fi
echo "  Service:  $SERVICE (port $PORT)"
echo "  Endpoint: $ENDPOINT"
echo "  Process:  $PROC_SHORT (PID $PID)"
echo "  Command:  $PROC_NAME"
echo "  CPUs:     $NUM_CPUS"
echo "  Duration: ${DURATION_MINUTES}m"
echo "  Interval: 1s"
echo "  Output:   $CSV_FILE"
echo ""
echo "Monitoring... (Ctrl+C to stop early)"
echo ""

echo "# run_id: $RUN_ID | service: $SERVICE | endpoint: $ENDPOINT | process: $PROC_SHORT (PID $PID)" > "$CSV_FILE"
echo "timestamp,elapsed_s,rss_kb,vsz_kb,rss_mb,cpu_pct" >> "$CSV_FILE"

# --- Collect samples ---

TOTAL_SECONDS=$((DURATION_MINUTES * 60))
START_TIME=$(date +%s)
SAMPLE=0
PEAK_RSS=0
START_RSS=0
END_RSS=0
PEAK_CPU="0.0"
CPU_SUM="0.0"

# Detect if remote/local target is Linux (has /proc)
HAS_PROC=$(rcmd "test -f /proc/$PID/stat && echo yes || echo no" 2>/dev/null) || true
[ "$HAS_PROC" != "yes" ] && HAS_PROC="no"

# Get CPU time in centiseconds (portable)
get_cpu_time() {
    if [ "$HAS_PROC" = "yes" ]; then
        # Linux: fields 14 (utime) + 15 (stime) in clock ticks
        rcmd "awk '{print \$14 + \$15}' /proc/$PID/stat" 2>/dev/null
    else
        # macOS: use ps cputime (format MM:SS.xx) and convert to centiseconds
        local cputime
        cputime=$(rcmd "ps -p $PID -o cputime=" 2>/dev/null | tr -d ' ')
        if [ -n "$cputime" ]; then
            echo "$cputime" | awk -F'[:.]' '{
                if (NF == 3) print ($1 * 6000) + ($2 * 100) + $3
                else if (NF == 2) print ($1 * 100) + $2
                else print 0
            }'
        else
            echo "0"
        fi
    fi
}

# Determine clock ticks per second (Linux)
if [ "$HAS_PROC" = "yes" ]; then
    CLK_TCK=$(rcmd "getconf CLK_TCK" 2>/dev/null || echo 100)
else
    CLK_TCK=100
fi

PREV_CPU_TIME=$(get_cpu_time)
PREV_WALL_TIME=$(date +%s%N 2>/dev/null || echo "${START_TIME}000000000")

# Small delay to get first delta
sleep 0.1

print_summary() {
    local end_time
    end_time=$(date +%s)
    local actual_duration=$((end_time - START_TIME))
    local mins=$((actual_duration / 60))
    local secs=$((actual_duration % 60))
    local avg_cpu="0.0"
    if [ "$SAMPLE" -gt 0 ]; then
        avg_cpu=$(awk -v sum="$CPU_SUM" -v n="$SAMPLE" 'BEGIN {printf "%.1f", sum/n}')
    fi

    echo ""
    echo ""
    echo "=========================================="
    echo "Resource Monitor Summary"
    echo "=========================================="
    echo "  Service:   $SERVICE (port $PORT)"
    echo "  Endpoint:  $ENDPOINT"
    echo "  Process:   $PROC_SHORT (PID $PID)"
    echo "  Duration:  ${mins}m ${secs}s"
    echo "  Samples:   $SAMPLE"
    echo "  ---"
    echo "  Start RSS: $(awk -v kb="$START_RSS" 'BEGIN {printf "%.1f", kb/1024}')MB"
    echo "  Peak RSS:  $(awk -v kb="$PEAK_RSS" 'BEGIN {printf "%.1f", kb/1024}')MB"
    echo "  End RSS:   $(awk -v kb="$END_RSS" 'BEGIN {printf "%.1f", kb/1024}')MB"
    echo "  Delta:     $(awk -v last="$END_RSS" -v start="$START_RSS" 'BEGIN {printf "%+.1f", (last-start)/1024}')MB"
    echo "  ---"
    echo "  Avg CPU:   ${avg_cpu}%"
    echo "  Peak CPU:  ${PEAK_CPU}%"
    echo "=========================================="
    echo "Full data: $CSV_FILE"
}

cleanup() {
    print_summary
    cleanup_ssh
    exit 0
}
trap cleanup INT TERM

while [ "$SAMPLE" -lt "$TOTAL_SECONDS" ]; do
    # Check process is still alive
    if ! rcmd "kill -0 $PID" 2>/dev/null; then
        echo ""
        echo "Process $PID exited after ${SAMPLE}s"
        break
    fi

    # Single ps call for RSS and VSZ (KB)
    MEM=$(rcmd "ps -p $PID -o rss=,vsz=" 2>/dev/null)
    if [ -z "$MEM" ]; then
        echo ""
        echo "Process $PID exited after ${SAMPLE}s"
        break
    fi

    RSS_KB=$(echo "$MEM" | awk '{print $1}')
    VSZ_KB=$(echo "$MEM" | awk '{print $2}')
    RSS_MB=$(awk -v kb="$RSS_KB" 'BEGIN {printf "%.1f", kb/1024}')

    # Calculate CPU % since last sample
    CURR_CPU_TIME=$(get_cpu_time)
    CURR_WALL_TIME=$(date +%s%N 2>/dev/null || echo "$(date +%s)000000000")

    if [ "$HAS_PROC" = "yes" ]; then
        # Linux: CPU ticks delta / (wall time delta * CLK_TCK)
        CPU_PCT=$(awk -v curr="$CURR_CPU_TIME" -v prev="$PREV_CPU_TIME" \
                      -v wc="$CURR_WALL_TIME" -v wp="$PREV_WALL_TIME" \
                      -v clk="$CLK_TCK" \
            'BEGIN {
                wall_delta = (wc - wp) / 1000000000
                if (wall_delta > 0) printf "%.1f", ((curr - prev) / clk / wall_delta) * 100
                else printf "0.0"
            }')
    else
        # macOS: centisecond delta / (wall time delta * 100)
        CPU_PCT=$(awk -v curr="$CURR_CPU_TIME" -v prev="$PREV_CPU_TIME" \
                      -v wc="$CURR_WALL_TIME" -v wp="$PREV_WALL_TIME" \
            'BEGIN {
                wall_delta = (wc - wp) / 1000000000
                if (wall_delta > 0) printf "%.1f", ((curr - prev) / 100 / wall_delta) * 100
                else printf "0.0"
            }')
    fi

    PREV_CPU_TIME="$CURR_CPU_TIME"
    PREV_WALL_TIME="$CURR_WALL_TIME"

    # Track stats
    if [ "$SAMPLE" -eq 0 ]; then
        START_RSS="$RSS_KB"
    fi
    END_RSS="$RSS_KB"
    if [ "$RSS_KB" -gt "$PEAK_RSS" ]; then
        PEAK_RSS="$RSS_KB"
    fi
    PEAK_CPU=$(awk -v curr="$CPU_PCT" -v peak="$PEAK_CPU" 'BEGIN {
        if (curr+0 > peak+0) printf "%.1f", curr; else printf "%.1f", peak
    }')
    CPU_SUM=$(awk -v sum="$CPU_SUM" -v curr="$CPU_PCT" 'BEGIN {printf "%.1f", sum + curr}')

    # Write to CSV
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ),$SAMPLE,$RSS_KB,$VSZ_KB,$RSS_MB,$CPU_PCT" >> "$CSV_FILE"

    # Print live update (overwrite line)
    printf "\r  [%ss] RSS: %sMB | Peak: %sMB | CPU: %s%%" "$SAMPLE" "$RSS_MB" "$(awk -v kb="$PEAK_RSS" 'BEGIN {printf "%.1f", kb/1024}')" "$CPU_PCT"

    SAMPLE=$((SAMPLE + 1))
    sleep 1
done

print_summary
cleanup_ssh
