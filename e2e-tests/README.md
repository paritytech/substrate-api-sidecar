## Summary

This is a helper library to run e2e tests. There are two types of tests to run:

1. Historical: Tests that focus on the integrity of the api service with older runtimes. 

2. Latest: Tests that focus on the integrity of the api service with the current runtime, and most recent block. 

### Historical

Historical tests use jest to run the api service at specific blocks where the result is known. Jest compares the known result to what we receive, and operates like any other test. It requires having the api service running against a live chain (Archive nodes are preferred). 

To run the tests locally:

```bash
$ yarn build:e2e-tests
$ node ./e2e-tests/build/historical/historical.js --config=./e2e-tests/jest.config.js
```

`--chain`: The chain you would like to test against. It defaults to `polkadot`.
`--config`: The path to the jest config.

### Latest

Latest tests run a set of known endpoints with the latest block against the chain. The tests will pass as long as all the responses are succesfull. If any test is 400 or above it will fail, and log each failed query along with its error. 

To run the tests locally:

```bash
$ yarn build:e2e-tests
$ node ./e2e-tests/build/latest/index.js
```

#### Flags

`--chain`: The chain you would like to test against. It defaults to `polkadot`.
