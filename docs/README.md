# Sidecar OpenApi UI

OpenApi spec for [substrate-api-sidecar](https://github.com/paritytech/substrate-api-sidecar).

## Contributing:
If you add a new endpoint or update an existing one (by modifying its parameters or output), you will also need to update the documentation (OpenApi specs). Here are some common steps to follow in order to do that:
- Update this [file](https://github.com/paritytech/substrate-api-sidecar/blob/master/docs/src/openapi-v1.yaml) by adding or updating the corresponding endpoint description in the `paths` and `schemas` sections.
- After you complete the changes, verify that the `yaml` file has no errors by copying the contents of this [file](https://github.com/paritytech/substrate-api-sidecar/blob/master/docs/src/openapi-v1.yaml) into the [Swagger Editor](https://editor.swagger.io/) or the [New Swagger Editor](https://editor-next.swagger.io/).
- If there are no errors, run `yarn build:docs` from the root directory of this repository. This will make sure that the `dist` is updated with the current changes.
- Next, open the `docs/dist/index.html` page (by copying its path) in your browser to confirm that all changes have been applied and appear as expected.
- If everything looks good, push the changes.
