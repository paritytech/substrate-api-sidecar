#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

if [ -z ${CALC_DEBUG} ]; then
    yarn wasm-pack build --target nodejs --scope substrate "$SCRIPT_DIR"
else
    echo "Fee debugging enabled"
    yarn wasm-pack build --debug --target nodejs --scope substrate "$SCRIPT_DIR" -- --features debug
fi
# append a newline to pkg/package.json if it isn't there
if [ "$(tail -c1 "$SCRIPT_DIR/pkg/package.json"; echo x)" != $'\nx' ]; then
    echo "" >>"$SCRIPT_DIR/pkg/package.json"
fi
