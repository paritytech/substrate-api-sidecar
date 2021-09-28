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


## Script `runYarnPack.ts`

### Summary

This scripts purpose is to do a dry-run npm release, and check if sidecar builds correctly. It uses `yarn pack` in order to create a tarball. That tarball is then used to create a binary inside of the repo, and that binary is then run. After the test the dependency tree is cleaned and the tarball deleted.
