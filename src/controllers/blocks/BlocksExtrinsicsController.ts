import { ApiPromise } from '@polkadot/api';
import { RequestHandler } from 'express';
import { BadRequest } from 'http-errors';

import { BlocksService } from '../../services';
import { INumberParam } from '../../types/requests';
import AbstractController from '../AbstractController';

export default class BlocksExtrinsicsController extends AbstractController<BlocksService> {
    constructor(api: ApiPromise) {
        super(
            api, 
            '/blocks/:blockId/extrinsics', 
            new BlocksService(api)
        );
        this.initRoutes();
    }

    protected initRoutes(): void {
        this.safeMountAsyncGetHandlers([
            ['/:extrinsicsIndex', this.getExtrinsicsByExtrsinsicIndex]
        ])
    }

    /**
     * 
     * @param _req Express Request
     * @param res Express Response
     */
    private getExtrinsicsByExtrsinsicIndex: RequestHandler<INumberParam> = async (
        { params: { blockId, extrinsicsIndex }, query: { eventDocs, extrinsicDocs } },
        res
    ): Promise<void> => {
        const hash = await this.getHashForBlock(blockId);

        const eventDocsArg = eventDocs === 'true';
        const extrinsinsicDocsArg = extrinsicDocs === 'true';

        let block = await this.service.fetchBlock(
            hash,
            eventDocsArg,
            extrinsinsicDocsArg
        );

        this.parseNumberOrThrow(
            extrinsicsIndex, 
            'ExstrinsicIndex is not a number'
        );

        if (parseInt(extrinsicsIndex, 10) > block.extrinsics.length - 1) {
            throw new BadRequest(
                'Requested ExtrinsicIndex does not exist'
            )
        }

        BlocksExtrinsicsController.sanitizedSend(
            res,
            block.extrinsics[parseInt(extrinsicsIndex, 10)],
        )
    }
}
