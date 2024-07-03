## Maintenance Guide
Here are some actions required from the maintainers of this repository.

### Keep polkadot-js dependencies up to date
Make sure the polkadot-js deps are up to date. A complete guide can be found [here](../README.md#updating-polkadot-js-dependencies).

**Frequency**: A good update frequency is every week, but we should also monitor Polkadot runtime upgrades, as they may impact PJS and, consequently, Sidecar. In that case, we should implement any necessary changes as soon as possible.

### Monitor runtime upgrades
[Monitoring runtime upgrades](https://wiki.polkadot.network/docs/learn-runtime-upgrades#monitoring-runtime-changes) is another essential task for the maintainer and it involves several key steps:
- Review issues and pull requests that will be included in the upcoming releases of both the [polkadot-sdk](https://github.com/paritytech/polkadot-sdk) and [polkadot-fellows/runtimes](https://github.com/polkadot-fellows/runtimes) repositories.
- Understand the changes thoroughly to identify any potential impact or disruptions to Sidecar endpoints.
- Create a tracking issue (or directly a pull request) to highlight the updates needed in Sidecar for the new release, ensuring backward compatibility with historical blocks.
- Stay updated with changes being implemented in the [polkadot-js API](https://github.com/polkadot-js/api) that might be helpful with the necessary modifications in Sidecar.
- Evaluate how these changes may impact critical Sidecar users, such as exchanges, wallets and custodians, and determine if a notification message needs to be sent (this should be coordinated with the Core Fellowship).
- Changes are first implemented in a testnet, such as Westend, so the maintainer can apply the corresponding updates in Sidecar and test them against the testnet.
- Later, these changes are also applied in production chains (e.g. Kusama, Polkadot) through runtime upgrades. These upgrades can be tracked via the corresponding proposals/referenda and their enactment blocks and dates. It is also recommended to test Sidecar functionality against the production chain once the release is live.

### Provide support
- Monitor the repository for new issues and respond or provide the necessary fixes as soon as possible.
- Monitor [Substrate & Polkadot Stack Exchange](https://substrate.stackexchange.com/) for any Sidecar related questions and respond promptly.

**Frequency**: Approximately daily.

### Keep other dependencies up to date
It is important to also check the rest of the dependencies (non pjs) for any updates. 
We do this with the following steps:
- Check out to a new branch
- Run the command `yarn upgrade-interactive`
- Select the packages to update.
- To ensure each package update is safe, we must review the changes between the current and desired releases in the respective repository.
- After upgrading, we can do the same sanity checks as outlined in the pjs deps section (mentioned [here](../README.md#updating-polkadot-js-dependencies)).
- Once we are ready, we push a PR to get reviews and merge.

**Frequency**: Approximately biweekly or longer.

### Security alerts
Review the security alerts raised by Dependabot [here](https://github.com/paritytech/substrate-api-sidecar/security/dependabot) and make sure to resolve them.

**Frequency**: Monthly (or longer) and if there are any.

### Yarn Berry version
- Check if there is a new version of Yarn Berry [here](https://github.com/yarnpkg/berry).
- To update the version, run the command `yarn set version stable`.
- After upgrading, we can do the usual sanity checks (e.g. `yarn`, `yarn dedupe`).

**NOTE**: This dependency is mentioned separately from the general ones because it is critical, requiring manual checks and thorough testing before updating.

**Frequency**: Monthly or longer.

### Keep `substrate-js-dev` repository up to date
Sidecar is using [substrate-js-dev](https://github.com/paritytech/substrate-js-dev) repository as a dependency. For instance, running `yarn lint` in sidecar triggers the `substrate-dev-run-lint` script which is defined [here](https://github.com/paritytech/substrate-js-dev/blob/58fe47c55610a797c2e780c5cfef0f3dd2fae7ca/scripts/substrate-dev-run-lint.cjs). Therefore, it is important to keep this repository's dependencies up to date as well. This can be done by running `yarn upgrade-interactive` and following the process mentioned in the previous step. Last, we would need to make a new release in that repository and then update the package version in Sidecar.

**Frequency**: Monthly or longer.

### Keep dependencies under `docs` up to date
There is a second `package.json` file located in the `docs` folder. Check periodically if all dependencies are up to date by running:
- `cd docs` (from the root folder)
- `yarn upgrade-interactive`
and following the same process as described previously.

**Frequency**: Monthly or longer.

### Check `confmgr` related dependencies
Another dependency that Sidecar is using is the [Configuration Manager](https://github.com/chevdor/confmgr/). For example, we may receive Dependabot alerts related to this library. If this happens, we could consider opening a PR to update dependencies in that repository. However, the release process is ultimately dependent on the owner, not us, so we would need to wait for a new release to update the version in Sidecar.

**Frequency**: Once per month or longer.

### Check Public instances of Sidecar
There are public instances of Sidecar that need to be kept up to date with latest release:
- [Polkadot Sidecar Public Instance](https://polkadot-public-sidecar.parity-chains.parity.io)
- [Polkadot Asset Hub Sidecar Public Instance](https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/)
- [Kusama Sidecar Public Instance](https://kusama-public-sidecar.parity-chains.parity.io)
- [Kusama Asset Hub Sidecar Public Instance](https://kusama-asset-hub-public-sidecar.parity-chains.parity.io/)

**NOTE**: These are used for light testing and have a rate limit.

The process of updating these instances is now fully automated, triggered by a bot from Parity Devops team, so no action is needed from our side. However, I am still listing them here so we keep an eye that everything works as expected. If there is an issue, such as endpoints not displaying information for early blocks (hence the connected nodes are somehow pruned), we should follow up with the Parity Devops team and fix the issue.

### Docker images of Sidecar
This is another fully automated process requiring no action from the maintainer. Docker images are automatically released per Sidecar release, and the process is managed within the [.gitlab-ci.yml](./.gitlab-ci.yml) file. You can find the images on [Docker Hub](https://hub.docker.com/r/parity/substrate-api-sidecar/tags). In case there are issues with the images, we should:
- Check the corresponding pipelines on Parity Gitlab.
- Contact the CI/CD team at Parity.

### Review repository branches
Usually branches other than master are automatically deleted after a PR is merged. However, there are branches that for some reason are not removed. Review the existing [branches](https://github.com/paritytech/substrate-api-sidecar/branches) and delete any unnecessary ones.

### Perform a release
The complete guide can be found [here](../RELEASE.md)

**Frequency**: Approximately every two weeks, or more frequently if there are important updates in polkadot-js and breaking changes from Polkadot runtime upgrades. The timing also depends on the merged PRs and if we would like to release important fixes or new features.

## Summary by Frequency
The frequency is somewhat flexible.

- Daily
    - Provide support.

- Weekly
    - Keep polkadot-js dependencies up to date.

- Biweekly
    - Monitor runtime upgrades.
    - Keep other dependencies up to date.
    - Perform a release.

- Monthly or longer
    - Security alerts.
    - Yarn Berry version.
    - Keep `substrate-js-dev` repository up to date.
    - Keep dependencies under `docs` up to date.
    - Check `confmgr` related dependencies.
    - Check Public instances of Sidecar.
    - Docker images of Sidecar.
    - Review repository branches.
