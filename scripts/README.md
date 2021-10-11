<div style="text-align:center">
    <h2>Sidecar Scripts</h2>
    <div>
    A set of notes and instructions for scripts used in Substrate-api-sidecar
    </div>
</div>
<br></br>


## Script `runChainTests.ts`

### Summary

This script calls the local e2e-tests helper library in order to test the current branch or development environment against
a collection of different blocks, across different runtimes. It does this for Polkadot, Kusama, and Westend.

### Flags

`--chain`: This sets the specific chain to run the script against. Acceptable values are `['polkadot', 'westend', 'kusama']`. If no chain is selected it will default to run the e2e-tests against all chains.

`--log-level`: Acceptable values are `['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']`. This will enable logging in Sidecar.



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
