Substrate Sidecar API is an open source project that welcomes new issues and
PRs.

If you’re new to open source or interested in contributing, this guide is
particularly helpful:
[How to Contribute to Open Source](https://opensource.guide/how-to-contribute/).

## Contributing Code

To contribute to this repo, start by creating a GitHub Issue, which will allow
you to gather feedback before writing any code. In the Issues tab, you’ll be
able to select from a template to create an Issue.

To create a Pull Request after you’ve created an Issue, you’ll need to head over
to the Pull Request tab. This will be where all the PRs will be located, and
where reviewers will be able to review your changes made.

### Before submitting a PR

-   `yarn lint`: Make sure your code follows our linting rules. You can also run `yarn lint:fix` or `yarn lint --fix` to
    automatically fix some of those errors.
-   `yarn test`: Make sure all tests pass.
-   If you add a new endpoint or update an existing one (by modifying its parameters or output), you will also need to update the documentation (OpenApi specs). Here are some common steps to follow in order to do that:
    - Update this [file](https://github.com/paritytech/substrate-api-sidecar/blob/master/docs/src/openapi-v1.yaml) by adding or updating the corresponding endpoint description in the `paths` and `schemas` sections.
    - After you complete the changes, verify that the `yaml` file has no errors by copying the contents of this [file](https://github.com/paritytech/substrate-api-sidecar/blob/master/docs/src/openapi-v1.yaml) into the [Swagger Editor](https://editor.swagger.io/) or the [New Swagger Editor](https://editor-next.swagger.io/).
    - If everything looks good, push the changes.
    - To preview the docs locally, you can run `yarn build:docs` from the root directory of this repository. This will update the `docs/dist/index.html` page which you can open (by copying its path) in your browser and verify that the content appear as expected. Please do not push/commit this file (or the `dist` folder) in your PR since this is not necessary. The docs will be build and published automatically in Github pages from the workflow ([docs.yml](https://github.com/paritytech/substrate-api-sidecar/blob/master/.github/workflows/docs.yml)).

## Rules

There are a few basic ground-rules for contributors (including the maintainer(s)
of the project):

- Try to avoid `--force` pushes or modifying the Git history in any way. If you
  need to rebase, ensure you do it in your own repo.
- Non-master branches, prefixed with a short name moniker (e.g.
  `gav-my-feature`), must be used for ongoing work.
- All modifications must be made in a Pull Request to solicit feedback from
  other contributors.
- Contributors should adhere to the
  [house coding style](https://github.com/paritytech/substrate/blob/master/docs/STYLE_GUIDE.md).

## Reviewing Pull Requests:

When reviewing a Pull Request, the end goal is to suggest useful changes to the
author. Reviews should finish with approval unless there are issues that would
result in:

- Buggy behaviour.
- Undue maintenance burden.
- Breaking with house coding style.
- Poor performance.
- Feature reduction (i.e. it removes some aspect of functionality that a
  significant minority of users rely on).
- Uselessness (i.e. it does not strictly add a feature or fix a known issue).

## Where to Ask for Help

Asking for help in the Parity community is encouraged and welcomed! The best
ways to reach us are:

- Ask a question in the [Substrate and Polkadot Stack Exchange](https://substrate.stackexchange.com/)
- Attend the Biweekly [Substrate Seminars](https://substrate.io/ecosystem/resources/seminar/)

## Heritage

These contributing guidelines are modified from the "OPEN Open Source Project"
guidelines for the Level project:
https://github.com/Level/community/blob/master/CONTRIBUTING.md
