### Releases

#### Prerequisites

Before starting the release process, it is recommended to prepare a few things in advance. In order to set the compatibility version (for the node releases) in the Changelog during the last steps of the release process, you will need the following prepared in advance:
- The latest Polkadot-SDK binary already built. Instructions to build from source can be found [here](https://github.com/paritytech/polkadot-sdk/tree/master/polkadot#build-from-source).
- A chain (Polkadot or Kusama) synced in either archive or pruned mode.

_Estimated Time Needed: Depending on your machine and the syncing mode you choose, it can take from a few hours to a few days._

#### Preparation

1. Make sure the polkadot-js dependencies are up to date. Refer to the "Updating polkadot-js dependencies" section in the [README](./README.md).

1. Make sure to be in the `master` branch, and `git pull origin master`.

1. Ensure that all CI/CD jobs from the last merged commit are passing. You can verify this by checking the [commits](https://github.com/paritytech/substrate-api-sidecar/commits/master/) on the master branch, where a green check (✅) should be present. If you see a red cross (❌) then you can click on it and do the following checks:
    - If the failed job is related to benchmarks, e.g. `Benchmark / benchmark (push)` or `Benchmark / benchmark publish (push)`, it is not critical, and you can proceed with the next steps of the release. At a later time though, it is worth checking why they are not pushed / published [here](https://paritytech.github.io/substrate-api-sidecar/dev/bench/).
    - If the failed job is related to staging deployment, e.g. `continuous-integration/gitlab-deploy-staging`, this is critical. In this case, you should check with the CI/CD team to get the relevant logs and fix the issue before continuing with the release.

1. Make sure that you've run `yarn` in this folder, and run `cargo install wasm-pack` so that binary is available on your `$PATH`.

1. Checkout a branch with the format `name-v5-0-1` (with `name` being the name of the person doing the release, e.g. `tarik-v5-0-1`). When deciding what version will be released it is important to look over 1) PRs since the last release and 2) release notes for any updated polkadot-js dependencies as they may affect type definitions.

1. The next step is to run the e2e tests. There are two types of e2e tests: `yarn test:historical-e2e-tests`, and `yarn test:latest-e2e-tests`. If you would like to run either tests against a single chain you may use the flag `--chain` to specify the chain.

    Note: that the e2e tests will connect to running nodes in order to test sidecar against real data, and they may fail owing to those connections taking too long to establish. If you run into any failures, try running the tests again.

1. It is recommended to also test against a local node so that you can later complete the compatibility section of the changelog and release notes. To do this you can use the `--local` flag in conjunction with `--chain` as shown below (example shown for the Polkadot chain):

    ```
    yarn test:latest-e2e-tests --local ws://127.0.0.1:9944 --chain polkadot
    ```

    This should be done while a local node is running and synced with the corresponding chain (example shown for the Polkadot chain): 

    ```
    ./target/release/polkadot --chain polkadot --base-path <THE_DIRECTORY_OF_YOUR_DB>
    ```

1. Before moving forward ensure all tests pass, and if it warns of any missing types feel free to make an issue [here](https://github.com/paritytech/substrate-api-sidecar/issues).

1. Update the version in the package.json (this is very important for releasing on NPM).

1. Update the substrate-api-sidecar version in the docs by going into `docs/src/openapi-v1.yaml`, and changing the `version` field under `info` to the releases respected version. No need to run `yarn build:docs` (refer to the [README](./docs/README.md) for more info).

1. Update `CHANGELOG.md` by looking at merged PRs since the last release. Follow the format of previous releases. Only record dep updates if they reflect type definition updates as those affect the users API. It will also help to sort previous PR's by "recently updated" in order to see all PR's merged since the last release.

    - Make sure to note if it is a high upgrade priority (e.g. it has type definitions for an upcoming runtime upgrade to a Parity maintained network).
    - If it is a breaking change, it can be helpful to add a `NOTE:` underneath to give a brief explanation as to what the breaking change is. Example in the PR of [chore(release): 16.0.0](https://github.com/paritytech/substrate-api-sidecar/commit/ea74d007f9320aba954ca163d3d57d9b64d47d63).

1. Before pushing up as a sanity check run the following 4 commands and ensure they all run with zero errors. There is one exception with `yarn test` where you will see errors logged, that is expected as long as all the test suites pass.

    ```bash
    yarn dedupe
    yarn build
    yarn lint
    yarn test
    ```

1. Commit with ex: `chore(release): 5.0.1`, then `git push` your release branch up, make a PR, get review approval, then merge.

1. If one of the commits for this release includes the `calc` directory and package, make sure to follow the instructions below for releasing it on npm (if a new version hasn't yet been released seperately).

#### Publish on GitHub

1. Double check that `master` is properly merged, pull down `master` branch.

1. [Create a new release](https://github.com/paritytech/substrate-api-sidecar/releases/new) on github, select `Choose a tag` and create a new tag name matching the version like `v5.0.1`. The tag will be automatically published along with the release notes.

1. Generally you can copy the changelog information and set the release notes to that. You can also observe past releases as a reference.

#### Publish on NPM

NOTE: You must be a member of the `@substrate` NPM org and must belong to the `Developers` team within the org. (Please make sure you have 2FA enabled.)

1. Now that master has the commit for the release, pull down `master` branch.

1. Run the following commands. (Please ensure you have 2FA enabled)

    ```bash
    npm login # Only necessary if not already logged in
    yarn deploy # Builds JS target and then runs npm publish
    ```

#### Calc Package Release Prep

1. Head into the `calc` directory in sidecar, and increment the version inside of the `Cargo.toml`, as well as the `pkg/package.json`.

1. Backup the `pkg/README.md` by just making a copy of it.

1. Run `sh build.sh`.

1. Replace the updated boilerplate README with the backed-up README.

1. Confirm that the package compiles correctly, `cargo build --release`.

1. Commit with ex: `chore(release-calc): 0.3.2`, then `git push` your release branch up, make a PR, get review approval, then merge.

1. Continue with the normal sidecar release process.

#### Publish Calc Package

1. `cd` into `calc/pkg` and `npm login`, then `npm publish`.
