#!/usr/bin/env python3

import argparse
import os
import psutil
import signal
import subprocess
import time

def run_process(args):
    return subprocess.check_output(args, stderr=subprocess.STDOUT,
                                   encoding="utf-8")

def run_chain_test(chain) -> bool:
    """
    Run tests against a specific chain, returning a boolean for
    whether the tests passed or not.
    """
    run_process(["yarn"])

    if chain == "polkadot":
        url = "wss://rpc.polkadot.io"
        chain = "polkadot"
    elif chain == "kusama":
        url = "wss://kusama-rpc.polkadot.io"
        chain = "kusama"
    elif chain == "westend":
        url = "wss://westend-rpc.polkadot.io"
        chain = "westend"
    else:
        return -1

    os.environ["SAS_SUBSTRATE_WS_URL"] = url
    proc = subprocess.Popen(
        ["yarn", "dev"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )

    print('Sidecar is loading in development mode...')
    time.sleep(30)

    print('Running `yarn`, and checking/loading cache...')
    run_process(["yarn"])

    print('Running e2e tests for {}'.format(chain))
    res = run_process(["yarn", "test:e2e-tests", "--chain", chain])

    print('Killing all processes...')
    for child in psutil.Process(proc.pid).children(recursive=True):
        child.kill()
    proc.kill()

    print(res)
    return "PASS" in res


def main():
    arg_parser = argparse.ArgumentParser(
        description='Run tests against live chains.'
    )
    arg_parser.add_argument(
        '--chain',
        type=str,
        default='',
        help='Only run the tests against this chain',
        choices=['polkadot', 'kusama', 'westend']
    )

    args = arg_parser.parse_args()

    # Run tests against a specific chain only:
    if args.chain:
        if run_chain_test(args.chain):
            return 0
        else:
            return -1
    # Run tests against all chains of interest to us:
    else:
        if run_chain_test("polkadot") and run_chain_test("kusama") and run_chain_test("westend"):
            return 0
        else:
            return -1


if __name__ == "__main__":
    main()
