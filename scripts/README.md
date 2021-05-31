<div style="text-align:center">
    <h2>Sidecar Scripts</h2>
    <div>
    A set of notes and instructions for scripts used in Substrate-api-sidecar
    </div>
</div>
<br></br>


## Script `run_chain_tests.py`

### Summary

This script calls the local e2e-tests helper library in order to test the current branch or development enviornment against 
a collection of different blocks, across different runtimes. It does this for Polkadot, Kusama, and Westend. 

### Requirements

`python3` - required to run the script

`psutil` - package needed to run the script

Run: `pip install -r requirements.txt` from this directory in order to install necessary dependencies. 
