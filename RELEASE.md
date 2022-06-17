### Releases

#### Preparation

1. Make sure the polkadot-js dependencies are up to date. Refer to the "Updating polkadot-js dependencies" section in the [README](./README.md).

1. Make sure that you've run `yarn` in this folder, and run `cargo install wasm-pack` so that that binary is available on your `$PATH`.

1. Checkout a branch with the format `name-v5-0-1`. When deciding what version will be released it is important to look over 1) PRs since the last release and 2) release notes for any updated polkadot-js dependencies as they may affect type definitions.

1. The next step is making sure the release will work against all relevant runtimes for Polkadot, Kusama, and Westend. This can be handled by running `yarn test:init-e2e-tests`. If you would like to test on an individual chain, you may run the same command followed by its chain, ex: `yarn test:init-e2e-tests:polkadot`. Before moving forward ensure all tests pass, and if it warns of any missing types feel free to make an issue [here](https://github.com/paritytech/substrate-api-sidecar/issues).

    Note: that the e2e tests will connect to running nodes in order to test sidecar against real data, and they may fail owing to those connections taking too long to establish. If you run into any failures, try running tests just for the chain that failed with something like `yarn test:init-e2e-tests:polkadot`.

1. Update the version in the package.json (this is very important for releasing on NPM).

1. Update the substrate-api-sidecar version in the docs by going into `docs/src/openapi-v1.yaml`, and changing the `version` field under `info` to the releases respected version. Then run `yarn build:docs`.

1. Update `CHANGELOG.md` by looking at merged PRs since the last release. Follow the format of previous releases. Only record dep updates if they reflect type definition updates as those affect the users API. It will also help to sort previous PR's by "recently updated" in order to see all PR's merged since the last release.

    Make sure to note if it is a high upgrade priority (e.g. it has type definitions for an upcoming runtime upgrade to a Parity maintained network).

1. Commit with ex: `chore(release): 5.0.1`, then `git push` your release branch up, make a PR, get review approval, then merge.

    **NOTE**: Before pushing up as a sanity check run the following 4 commands and ensure they all run with zero errors. There is one exception with `yarn test` where you will see errors logged, that is expected as long as all the test suites pass.

    ```bash
    yarn dedupe
    yarn build
    yarn lint
    yarn test
    ```

1. If one of the commits for this release includes the `calc` directory and package, make sure to follow the instructions below for releasing it on npm (if a new version hasn't yet been released seperately).

#### Publish on GitHub

1. Double check that `master` is properly merged, pull down `master` branch.

1. [Create a new release](https://github.com/paritytech/substrate-api-sidecar/releases/new) on github, select `Choose a tag` and create a new tag name matching the version like `v5.0.1`. The tag will be automatically published along with the release notes.

1. Generally you can copy the changelog information and set the release notes to that. You can also observe past releases as a reference.

#### Publish on NPM

NOTE: You must be a member of the `@substrate` NPM org and must belong to the `Developers` team within the org. (Please make sure you have 2FA enabled.)

1. Now that master has the commit for the release, pull down `master` branch.

2. Run the following commands. (Please ensure you have 2FA enabled)

    ```bash
    npm login # Only necessary if not already logged in
    yarn deploy # Builds JS target and then runs npm publish
    ```

#### Calc Package Release Prep

1. Head into the `calc` directory in sidecar, and increment the version inside of the `Cargo.toml`, as well as the `pkg/package.json`.

2. Confirm that the package compiles correctly, `cargo build --release`.

3. Continue with the normal sidecar release process.

#### Publish Calc Package

1. `cd` into `calc/pkg` and `npm login`, then `npm publish`.
