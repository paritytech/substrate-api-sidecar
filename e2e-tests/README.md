## Summary

This is a helper library for Sidecar to run e2e tests against specific chains, at certain blocks. 

## Testing

The below instructions are specific to running the e2e-tests against one chain. 
If you are looking to run the e2e-tests against all chains (Polkadot, Kusama, Westend, Statemine) then run `yarn test:init-e2e-tests` in 
the root directory of sidecar.

### Polkadot 

To run the tests against a single chain, you may use the following below. For more examples, reference the `<ROOT>/package.json`

`yarn test:init-e2e-tests:polkadot`

That's it! 
All the tests should come back with green checkmarks. If you find a bug file an issue [here](https://github.com/paritytech/substrate-api-sidecar/issues).

### Config

If you are looking to update the e2e-tests config, the file to do so exists in `<ROOT>/scripts/config.ts`.
