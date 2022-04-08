# Substrate Api Sidecar Fee integration for chain builders

This will serve as a guide to add fee calculation support for a given chain. 

## @substrate/calc-fee

First, in order to get your chain to support fee calculation in sidecar you will need to add your chains calculation spec to `impl Multiplier` inside of `<ROOT>/calc/src/calc_fee.rs`. Specifically inside of the `fn new` functions `match` statement you will add your chains spec name, and the supported calculation method. See other chains configs as reference. 

Make sure you have the latest stable rust version before running:

```bash
# Compile the build to make sure it build correctly
cargo build --release
```

```bash
# Build the wasm package
`sh ./build.sh`
```
