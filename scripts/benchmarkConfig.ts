import { IBenchmarkConfig } from './types';

export const benchmarkConfig: IBenchmarkConfig = {
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
    '/accounts/{accountId}/convert': {
        path: '/benchmarks/accountsConvert',
    },
    '/blocks/{blockId}': {
        path: '/benchmarks/blocksBlockId',
    },
    '/blocks/{blockId}/header': {
        path: '/benchmarks/blocksBlockIdHeader',
    },
    '/blocks/{blockId}/extrinsics/{extrinsicIndex}': {
        path: '/benchmarks/blocksBlockIdExtrinsics',
    },
    '/blocks/head': {
        path: '/benchmarks/blocksHead',
    },
    '/blocks/head/header': {
        path: '/benchmarks/blocksHeadHeader',
    },
    '/pallets/staking/progress': {
        path: '/benchmarks/palletsStakingProgress',
    },
    '/pallets/{palletId}/storage': {
        path: '/benchmarks/palletsPalletIdStorage',
    },
    '/pallets/{palletId}/storage/{storageItemId}': {
        path: '/benchmarks/palletsPalletIdStorageStorageId',
    },
    '/pallets/nomination-pools/info': {
        path: '/benchmarks/palletsNominationPoolsInfo',
    },
    '/pallets/nomination-pools/{poolId}': {
        path: '/benchmarks/palletsNominationPoolsPoolId'
    },
    '/paras': {
        path: '/benchmarks/paras',
    },
    '/paras/leases/current': {
        path: '/benchmarks/parasLeasesCurrent',
    },
    '/paras/auctions/current': {
        path: '/benchmarks/parasAuctionsCurrent',
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
    '/node/network': {
        path: '/benchmarks/nodeNetwork',
    },
    '/node/transaction-pool': {
        path: '/benchmarks/nodeTransactionPool',
    },
    '/node/version': {
        path: '/benchmarks/nodeVersion',
    },
    '/runtime/spec': {
        path: '/benchmarks/runtimeSpec'
    },
}
