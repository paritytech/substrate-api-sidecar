// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { ArgumentParser, Namespace } from 'argparse';
import { checkWsType } from './e2eHelpers';
import { launchProcess, setLogLevel, killAll, setWsUrl } from './sidecarScriptApi';
import { ProcsType, StatusCode } from './types';
import { defaultSasStartOpts, defaultSasBuildOpts } from './config';

type IBenchmarkConfig = {
    [x: string]: {
        /**
         * Relative path to the benchmark related to the key which represents a endpoint.
         */
        path: string;
    }
}

const benchmarkConfig: IBenchmarkConfig = {
    '/accounts/{accountId}/balance-info': {
        path: '/benchmarks/accountsBalance',
    },
    '/accounts/{accountId}/vesting-info': {
        path: '/benchmarks/accountsVestingInfo',
    },
    '/accounts/{accountId}/staking-info': {
        path: '/benchmarks/accountsStakingInfo',
    },
    '/accounts/{accountId}/staking-payouts': {
        path: '/benchmarks/accountsStakingPayouts',
    },
    '/accounts/{accountId}/validate': {
        path: '/benchmarks/accountsValidate',
    },
    '/blocks/{blockId}': {
        path: '/benchmarks/blocks',
    },
    '/pallets/staking/progress': {
        path: '/benchmarks/palletsStakingProgress',
    },
    '/pallets/{palletId}/storage': {
        path: '/benchmarks/palletsPalletIdStorage',
    },
    '/pallets/{palletId}/storage/{storageItemId}': {
        path: '/benchmarks/pallets/palletsPalletIdStorageStorageId',
    },
    '/paras': {
        path: '/benchmarks/paras',
    },
    '/paras/leases/current': {
        path: '/benchmarks/parasLeasesCurrent',
    },
    '/paras/auctions/current': {
        path: '/benchmarks/parasAuctionCurrent',
    },
    '/paras/crowdloans': {
        path: '/benchmarks/parasCrowdloans',
    },
    '/paras/{paraId}/crowdloan-info': {
        path: '/benchmarks/parasParaIdCrowdloanInfo',
    },
    '/paras/{paraId}/lease-info': {
        path: '/benchmarks/parasParaIdLeasesInfo',
    },
}

// Stores all the processes
const procs: ProcsType = {};

const cdToDir = (path: string): void => {
    console.log('cd into: ', process.cwd() + path)
    try {
        process.chdir('.' + path);
    } catch (e) {
        killAll(procs);
        process.exit(4);
    }
}

// Should return the results of the benchmark. 
const launchBenchmark = async (endpoint: string, wsUrl: string): Promise<string> => {
    const { Failed } = StatusCode;
    // Default ws url.
    const defaultUrl = 'ws://127.0.0.1:9944';

    // Set the ws url env var
    if (wsUrl ){
        wsUrl ? setWsUrl(wsUrl) : setWsUrl(defaultUrl);
    }

    console.log('Launching Sidecar...');
	const sidecarStart = await launchProcess('yarn', procs, defaultSasStartOpts);
	if (sidecarStart.code === Failed) {
        console.error('Sidecar failed to start');
		killAll(procs);
		process.exit(1);
	}

    // TODO: Allow a generous amount of time for sidecar to boot.


    // cd into benchmark
    cdToDir(benchmarkConfig[endpoint].path);
    // Run benchmark against the endpoint passed in
    const bench = await launchProcess('sh', procs, {
        proc: 'benchmark',
        resolver: 'Benchmark finished',
        args: ['init.sh']
    });
    // cd back to root
    cdToDir('/../../');

    // Ensure the benches process was sucessful.
    if (bench.code === Failed) {
        killAll(procs);
        process.exit(4);
    }

    // Ensure the stdout is 

    // Ensure before we exit the function that we exit all processes.
    killAll(procs);

    return bench.stdout || '';
}

const main = async (args: Namespace) => {
    const { Failed} = StatusCode;
    const { log_level, endpoint, ws_url } = args;

    // Check if `--endpoint` exists. 
    // If it doesnt run benchmarks on all endpoints.

    if (log_level) {
        setLogLevel(log_level);
    }

    console.log('Building Sidecar...');
    const sidecarBuild = await launchProcess('yarn', procs, defaultSasBuildOpts);

    if (sidecarBuild.code === Failed) {
        console.log('Sidecar failed to build, exiting...');
        killAll(procs);
        process.exit(2);
    }

    if (endpoint) {
        await launchBenchmark(endpoint, ws_url);
    } else {
        // Launch each benchmark for each test
    }

    /**
     * Write the results to file.
     */
}

const parser = new ArgumentParser();

parser.add_argument('--ws-url', {
    required: false,
    nargs: '?',
    type: checkWsType
});
parser.add_argument('--endpoint', {
    choices: [...Object.keys(benchmarkConfig)],
    required: false
});
parser.add_argument('--log-level', {
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
    default: 'http',
});

const args = parser.parse_args() as Namespace;

/**
 * Signal interrupt
 */
 process.on('SIGINT', function () {
	console.log('Caught interrupt signal');
	killAll(procs);
	process.exit();
});

/**
 * Signal hangup terminal
 */
process.on('SIGHUP', function () {
	console.log('Caught terminal termination');
	killAll(procs);
	process.exit();
});

main(args).finally(() => process.exit());
