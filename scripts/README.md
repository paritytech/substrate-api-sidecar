<div style="text-align:center">
    <h2>Sidecar Scripts</h2>
    <div>
    A set of notes and instructions for scripts used in Substrate-api-sidecar
    </div>
</div>
<br></br>

## Script `runHistoricalE2eTests.ts`

### Summary

This script calls the local historical e2e tests helper library in order to test the current branch or development environment against a collection of different blocks, across different runtimes.

### Flags

`--chain`: This sets the specific chain to run the script against. Acceptable values are `['polkadot', 'westend', 'kusama', 'kusama-asset-hub', 'polkadot-asset-hub']`. If no chain is selected it will default to run the e2e-tests against all chains.

`--local`: This sets the websocket url for the e2e test. Its to be used along with `--chain`. If `--chain` is not present it will throw an error.

`--log-level`: Acceptable values are `['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']`. This will enable logging in Sidecar.

### Run the script

In order to run the program:

```bash
$ yarn test:historical-e2e-tests
```

## Script `runLatestE2eTests.ts`

### Summary

This script calls the local latest e2e tests helper library in order to test the api service against the most recent runtime. It works through all the available endpoints, and calls them each against the most recent block.

### Flags

`--chain`: This sets the specific chain to run the script against. Acceptable values are `['polkadot', 'polkadot-asset-hub']`. If no chain is selected it will default to run the e2e-tests against all chains.

`--local`: This sets the websocket url for the e2e test. Its to be used along with `--chain`. If `--chain` is not present it will throw an error.

`--log-level`: Acceptable values are `['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']`. This will enable logging in Sidecar.

### Run the script

In order to run the program:

```bash
$ yarn test:latest-e2e-tests
```

## Script `runYarnPack.ts`

### Summary

This script's purpose is to do a dry-run npm release, and check if sidecar builds correctly. It uses `yarn pack` in order to create a tarball called `package.tgz` inside of our root directory. This tarball is a copy of what our release would be within the npm registry. We target that tarball using `yarn add ${__dirname}<path_to_file>/package.tgz` and add it as a dependency. Yarn will read the package.json of sidecar, and publish it as `@substrate/api-sidecar`. Once sidecar is fully installed a binary will be attached in `./node_modules/.bin/substrate-api-sidecar`, we then run that binary to check for any issues. After the test the dependency tree is cleaned and the tarball deleted.

In order to start this script locally, run from the root directory of this repository:

```bash
$ yarn 
$ yarn test:test-release
```

If the cleanup has any issues, you may run from the root directory of this repository:

```bash
$ yarn remove @substrate/api-sidecar
$ rm -rf ./package.tgz
```

# Script `runBenchmarks.ts`

This script's purpose is to run the benchmarks inside of the `<root>/benchmarks` directory. This script requires you to have `wrk`, `lua`, and a fully synced archive node. Please reference `<root>/benchmarks/README.md` for more information on installation. 

In order to start this script locally, run from the root directory of this repository:

ex1:
```bash
$ yarn
$ yarn bench
```

ex2:
```bash
$ yarn
$ yarn bench --log-level=info --time=30s  
```

ex3:
```
$ yarn
$ yarn bench --log-level=info --time=30s  --endpoint=/accounts/{accountId}/balance-info
```

### Flags

`--ws-url`: The Ws Url to run the benchmarks against. Default is `ws://127.0.0.1:9944`.

`--endpoint`: Run a single benchmark by specificing which endpoint to run. If this is absent it will run all benchmarks.

`--log-level`: The log-level to run the benchmarks in. Defaults to `http`.

`--time`: The amount of time each benchmark should run for. Ex: `1m`, `30s`, `15s`. Default is `1m`.

## Errors

These error codes are shared across all scripts.

`0`: The process has finished succesfully and all tests have passed.

`1`: The process has finished succesfully but the tests did not come back all successful. Either one or many have failed.

`2`: The process has exited with an error, and building sidecar has failed. 

`3`: CLI args are used incorrectly internally.

`4`: Benchmarks process has failed.

## Script `memory-profiler/`

### Summary

The memory profiler is a comprehensive tool for analyzing memory usage patterns, detecting potential memory leaks, and understanding performance characteristics across different API endpoints. It consists of two main components:

1. **IsolatedMemoryProfiler** - Tests each endpoint in isolation with system recovery between tests
2. **CustomEndpointProfiler** - Specialized tests for deep diving into specific endpoint categories

### Features

- **Endpoint Isolation**: Each endpoint is tested separately to avoid interference
- **Memory Leak Detection**: Sophisticated algorithms to identify potential memory leaks
- **Query Parameter Testing**: Tests different `at` block heights and `range` parameters
- **Garbage Collection Integration**: Uses Node.js GC for more accurate measurements
- **Comprehensive Reporting**: JSON and CSV outputs for detailed analysis

### Scripts

`yarn memory-profile` - Run full isolated memory profiling suite
`yarn memory-profile:custom` - Run all custom endpoint tests
`yarn memory-profile:blocks` - Deep dive into block-related endpoints
`yarn memory-profile:accounts` - Test account endpoints with different addresses
`yarn memory-profile:pallets` - Test pallet storage endpoints
`yarn memory-profile:runtime` - Test runtime endpoints across versions
`yarn memory-profile:stress` - Stress test specific endpoints

### Usage Examples

```bash
# Profile local development server
yarn memory-profile

# Profile production server
yarn memory-profile http://sidecar.example.com

# Test specific endpoint categories
yarn memory-profile:blocks
yarn memory-profile:accounts

# Stress test a specific endpoint
yarn memory-profile:stress /blocks/head "?range=10" 50
```

### Output

All results are saved to `./memory-profiles/` directory with:
- Comprehensive JSON reports with analyses
- Individual CSV files for each endpoint tested
- Memory leak suspicion scores and performance metrics

For detailed documentation see: `scripts/memory-profiler/README.md`
