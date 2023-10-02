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
