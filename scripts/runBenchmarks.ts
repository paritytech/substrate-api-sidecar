// Copyright 2017-2023 Parity Technologies (UK) Ltd.
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

import { ArgumentParser } from 'argparse';
import fs from 'fs';

import { benchmarkConfig } from './benchmarkConfig';
import { defaultSasBuildOpts, defaultSasStartOpts } from './config';
import { killAll, launchProcess, setLogLevel, setWsUrl } from './sidecarScriptApi';
import { IBenchParseArgs, IBenchResult, ProcsType, StatusCode } from './types';

// Stores all the processes
const procs: ProcsType = {};

/**
 * The format of `length` will be in an acceptable format for wrk.
 *
 * ex: '1m', '30s', '15s'
 *
 * @param length Time to run each benchmark
 */
const setBenchTime = (length: string) => {
	process.env.WRK_TIME_LENGTH = length;
};

/**
 * Helper function to add a delay.
 *
 * @param ms
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * cd to the correct directory. The benchmarks require being within the write directory in order to run
 * the lua script.
 *
 * @param path Path to directory.
 */
const cdToDir = (path: string): void => {
	try {
		process.chdir('.' + path);
	} catch (e) {
		console.error(e);
		killAll(procs);
		process.exit(4);
	}
};

/**
 * Format and organize the results from the benchmarks in text form.
 *
 * @param results
 */
const formatResults = (results: IBenchResult[]): string => {
	let data = '';
	for (let i = 0; i < results.length; i++) {
		if (i > 0) data += '\n\n';
		data += `Result of ${results[i].endpoint}: \u2193 \n\n${results[i].stdout}`;
	}

	return data;
};

/**
 * Write the results of the benchmarks to file. Per benchmark these will write over the existing benchmarks.
 *
 * @param results Results organized from stdout
 */
const writeResultsToFile = (results: IBenchResult[]) => {
	const FILE_NAME = 'benchmarks.txt';
	const formattedData = formatResults(results);
	fs.writeFileSync(FILE_NAME, formattedData);
};

/**
 * Launch a single benchmark. It returns the stdout from `<root>/benchmarks/util/util.lua`.
 *
 * @param endpoint Endpoint that reflects one of the keys from `benchmarkConfig`.
 * @param wsUrl `wsUrl` to benchmark off of.
 */
const launchBenchmark = async (endpoint: string, wsUrl: string): Promise<string> => {
	const { Failed } = StatusCode;
	// Set the ws url env var
	setWsUrl(wsUrl);

	console.log('Launching Sidecar...');
	const sidecarStart = await launchProcess('yarn', procs, defaultSasStartOpts);
	if (sidecarStart.code === Failed) {
		console.error('Sidecar failed to start');
		killAll(procs);
		process.exit(1);
	}

	// 2 second delay to allow sidecar to boot before we load it with queries.
	await delay(2000);

	// cd into benchmark
	cdToDir(benchmarkConfig[endpoint].path);
	// Run benchmark against the endpoint passed in
	const bench = await launchProcess('sh', procs, {
		proc: 'benchmark',
		resolver: 'Benchmark finished',
		args: ['init.sh'],
	});
	// cd back to root
	cdToDir('/../../');

	// Ensure the benches process was sucessful.
	if (bench.code === Failed) {
		console.log('ERROR code: 4 - Error running launchBenchmark()');
		killAll(procs);
		process.exit(4);
	}
	// Ensure before we exit the function that we exit all processes.
	killAll(procs);

	return bench.stdout;
};

const main = async (args: IBenchParseArgs) => {
	const { Failed } = StatusCode;
	const { log_level, endpoint, ws_url } = args;

	if (log_level) setLogLevel(log_level);
	setBenchTime(args.time);

	console.log('Building Sidecar...');
	const sidecarBuild = await launchProcess('yarn', procs, defaultSasBuildOpts);

	if (sidecarBuild.code === Failed) {
		console.log('Sidecar failed to build, exiting...');
		killAll(procs);
		process.exit(2);
	}

	const results: IBenchResult[] = [];
	if (endpoint) {
		const res = await launchBenchmark(endpoint, ws_url);
		results.push({
			endpoint,
			stdout: res,
		});
	} else {
		// Launch each benchmark for each endpoint
		const endpoints = Object.keys(benchmarkConfig);
		for (const endpoint of endpoints) {
			const res = await launchBenchmark(endpoint, ws_url);
			results.push({
				endpoint,
				stdout: res,
			});
		}
	}

	writeResultsToFile(results);
};

const parser = new ArgumentParser();

parser.add_argument('--ws-url', {
	required: false,
	nargs: '?',
	default: 'ws://127.0.0.1:9944',
	help: 'The WsUrl to run the benchmarks against. Default is `ws://127.0.0.1:9944`.',
});
parser.add_argument('--endpoint', {
	choices: [...Object.keys(benchmarkConfig)],
	required: false,
	help: 'Run a single benchmark by specificing which endpoint to run. If this is absent it will run all benchmarks.',
});
parser.add_argument('--log-level', {
	choices: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
	default: 'http',
	help: 'The log-level to run the benchmarks in. Defaults to `http`.',
});
parser.add_argument('--time', {
	default: '1m',
	help: 'The amount of time each benchmark should run for. Ex: `1m`, `30s`, `15s`. Default is `1m`.',
});

const args = parser.parse_args() as IBenchParseArgs;

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

main(args)
	.catch((err) => console.error(err))
	.finally(() => process.exit());
