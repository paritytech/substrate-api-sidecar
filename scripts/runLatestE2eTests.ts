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
import { launchProcess, setLogLevel, killAll, setWsUrl } from './sidecarScriptApi';
import { latestE2eConfig, defaultSasBuildOpts, localWsUrl } from './config';
import { checkTests } from './e2eHelpers';

import { ProcsType, StatusCode } from './types';

// Stores all the processes
const procs: ProcsType = {};

const launchChainTest = async (chain: string, isLocal: boolean) => {
    const { wsUrl, SasStartOpts, e2eStartOpts } = latestE2eConfig[chain];
    const { Success } = StatusCode;

    isLocal ? setWsUrl(localWsUrl) : setWsUrl(wsUrl);

    console.log('Launching Sidecar...');
    const sidecarStart = await launchProcess('yarn', procs, SasStartOpts);

    if (sidecarStart === Success) {
        console.log('Launching latest e2e-tests...');
        const e2e = await launchProcess('yarn', procs, e2eStartOpts);

        if (e2e === Success) {
            killAll(procs);
            return true
        } else {
            killAll(procs);
            return false
        }
    } else {
        console.error('Error launching sidecar... exiting...');
        killAll(procs);
        process.exit(2);
    }
}

const main = async (args: Namespace) => {
    const { Failed } = StatusCode;
    const isLocal = args.local ? true : false;
    
    if (args.log_level) {
        setLogLevel(args.log_level);
    }

    console.log('Building Sidecar...');
    const sidecarBuild = await launchProcess('yarn', procs, defaultSasBuildOpts);

    if (sidecarBuild === Failed) {
        console.log('Sidecar failed to build, exiting...');
        killAll(procs);
        process.exit(2);
    }

    // CheckTests will either return a success exit code of 0, or a failed exit code of 1.
    if (args.chain) {
        const selectedChain = await launchChainTest(args.chain, isLocal);

        checkTests(selectedChain);
    } else {
        const polkadotTest = await launchChainTest('polkadot', isLocal);
        const statemintTest = await launchChainTest('statemint', isLocal);

        checkTests(polkadotTest, statemintTest);
    }
}

const parser = new ArgumentParser();

parser.add_argument('--local', {
    required: false
});
parser.add_argument('--chain', {
    choices: ['polkadot', 'statemint']
});
parser.add_argument('--log-level', {
    choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']
});

const args = parser.parse_args() as Namespace;

main(args).finally(() => process.exit());
