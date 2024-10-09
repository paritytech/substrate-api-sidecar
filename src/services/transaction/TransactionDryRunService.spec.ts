import { SubmittableExtrinsic } from '@polkadot/api/types';
import { GenericExtrinsicPayload } from '@polkadot/types/extrinsic';
import type { ISubmittableResult } from '@polkadot/types/types';

import { mockAssetHubWestendApi } from '../test-helpers/mock';
import { TransactionDryRunService } from './TransactionDryRunService';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockSubmittableExt = mockAssetHubWestendApi.registry.createType(
	'Extrinsic',
	'0xfc041f0801010100411f0100010100c224aad9c6f3bbd784120e9fceee5bfd22a62c69144ee673f76d6a34d280de160104000002043205040091010000000000',
) as SubmittableExtrinsic<'promise', ISubmittableResult>;

describe("TransactionDryRunService", () => {
    it("Should correctly execute a dry run for a submittable executable", async () => {
        const executionResult = await new TransactionDryRunService().dryRuntExtrinsic(

        )
    });

    it("should correctly execute a dry run for a payload extrinsic", async () => {});

    it("should correctly execute a dry run for a call", async () => {});
});