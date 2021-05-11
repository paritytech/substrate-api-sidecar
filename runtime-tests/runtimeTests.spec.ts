import { PORT, URL_PATH } from "./helpers/consts";
import { endpoints } from "./endpoints";
import { request } from "./helpers/request";
import { ChainSpec } from './types';

// @ts-ignore
const config = JSON.parse(process.env.__CONFIGURATION);
const chain = config.chain as ChainSpec;

const polkadotEndpoints: string[][] = endpoints[chain];

describe("Runtime Tests for blocks", () => {
    jest.setTimeout(15000);

    test.each(polkadotEndpoints)(
        "Given path %p, it should return block height %p",
        async (blockPath, blockHeight) => {
            const res = await request(blockPath, URL_PATH, PORT);
            const responseJson = JSON.parse(res);

            expect(responseJson["number"]).toBe(blockHeight);
        }
    );
});
