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

import { ArgumentParser } from 'argparse';
import { request, IRequest } from '../helpers/request';
import { polkadot, statemint } from './endpoints';
import { IConfig } from './types/endpoints';
import { HOST, PORT } from '../helpers/consts';

enum StatusCode {
    Success = 0,
    Failed = 1,
}

interface ILatestE2eParser {
    chain: string
}

const main = async (args: ILatestE2eParser): Promise<StatusCode> => {
    const { Success, Failed } = StatusCode;

    let config: IConfig;
    switch(args.chain) {
        case 'polkadot':
            config = polkadot
            break;
        case 'statemint':
            config = statemint
            break;
        default:
            config = polkadot;
            break;
    }

    let blockId: string;
    try {
        const res = await request('/blocks/head', HOST, PORT);
        blockId = JSON.parse(res.data).number as string;
    } catch (err) {
        throw (`Error fetching the latest block: ${err}`);
    }

    /**
     * Urls will contains all the urls including the base path of an endpoint,
     * and seperate urls with the query params added. Anything that contains `{blockId}`
     * will be replaced by the current blockId we are testing
     */
    const urls: string[] = [];
    for (const endpoint in config) {
        const { path, queryParams } = config[endpoint];
        const formattedPath = path.replace('{blockId}', blockId)
        // Base endpoint with no query params attached
        urls.push(formattedPath);
        // Attach each of the query params to their own base path
        if (queryParams.length) {
            const tempPath = formattedPath.concat('?')
            const urlsWithParams = queryParams.map((param) => {
                return tempPath.concat(param).replace('{blockId}', blockId);

            });
            urls.push(...urlsWithParams);
        }
    }

    const responses = await Promise.all(urls.map((u) => request(u, HOST, PORT)));
    const errors: IRequest[] = [];
    responses.forEach((res) => {
        if (res.statusCode && res.statusCode >= 400) {
            errors.push(res)
        }
    })
    logErrors(errors);

    if (errors.length > 0) {
        console.log(`Finished with a status code of ${Failed}`)
        return Failed
    } else {
        console.log(`Finished with a status code of ${Failed}`)
        return Success
    }
}

const logErrors = (errors: IRequest[]) => {
    console.log('Received the following errors:');
    errors.forEach((err) => {
        console.log('----------------------------------------------');
        console.log(`Queried Endpoint: ${err.path}`);
        console.log(`Status Code: ${err.statusCode}`);
        console.log(`Received logging: ${err.data}`);
    });
}

const parser = new ArgumentParser();

parser.add_argument('--chain', {
    choices: ['polkadot', 'statemint'],
    default: 'polkadot'
});

const args = parser.parse_args() as ILatestE2eParser;

main(args).finally(() => process.exit());
