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
        // Attacheach of the query params to their own base path
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

    if (errors.length > 0) {
        return StatusCode.Failed
    } else {
        return StatusCode.Success
    }
}

const parser = new ArgumentParser();

parser.add_argument('--chain', {
    choices: ['polkadot', 'statemint'],
    default: 'polkadot'
});

const args = parser.parse_args() as ILatestE2eParser;

main(args).finally(() => process.exit());
