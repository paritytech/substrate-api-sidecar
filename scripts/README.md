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
