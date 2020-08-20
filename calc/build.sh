#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ -z ${CALC_DEBUG} ]; then
    wasm-pack build --target nodejs --scope substrate "$SCRIPT_DIR"
else
    echo "Fee debugging enabled"
    wasm-pack build --debug --target nodejs --scope substrate "$SCRIPT_DIR" -- --features debug
fi
