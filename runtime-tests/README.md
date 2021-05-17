## Summary

This is a helper library for Sidecar to run runtime tests against specific chains, at certain blocks. 

## Testing

The below instructions are specific to runtime-tests against one chain. 
If you are looking to run the runtime-tests against all 3 chains (Polkadot, Kusama, Westend) then run `yarn test:init-runtime-tests` in 
the root directory of sidecar.

### Polkadot 

Lets first get sidecar ready in a seperate terminal.

```
$ cd substrate-api-sidecar
$ git checkout <your_branch>
$ export SAS_SUBSTRATE_WS_URL=<network archive node>
$ yarn
$ yarn dev
```

Sidecar should be now connected to the node, and running successfully. If you are having issues running sidecar and are receiving some odd behavior, contact the maintainers, or file an issue [here](https://github.com/paritytech/substrate-api-sidecar/issues).

Now lets run our runtime tests against polkadot. Go to the seperate terminal and run:

`yarn test:runtime-tests --chain polkadot`

Thats it! 
All the tests should come back with green checkmarks.
