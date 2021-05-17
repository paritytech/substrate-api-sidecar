#!/usr/bin/env python3

import os
import psutil
import signal
import subprocess
import time

def run_process(args):
    return subprocess.check_output(args, stderr=subprocess.STDOUT,
                                   encoding="utf-8")

def run_chain_test(chain):
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
    proc = subprocess.Popen(["yarn", "dev"], stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT)

    print('Sidecar is loading in development mode...')
    time.sleep(30)

    print('Running `yarn`, and checking/loading cache...')
    run_process(["yarn"])

    print('Running runtime tests for {}'.format(chain))
    res = run_process(["yarn", "test:runtime-tests", "--chain", chain])

    print('Killing all processes...')
    for child in psutil.Process(proc.pid).children(recursive=True):
        child.kill()
    proc.kill()

    print(res)
    return res.find("PASS")


def main():
    polka_test = run_chain_test("polkadot")
    kusama_test = run_chain_test("kusama")
    westend_test = run_chain_test("westend")

    if polka_test == 0 and kusama_test == 0 and westend_test == 0:
        return 0
    else:
        return -1


if __name__ == "__main__":
    main()
