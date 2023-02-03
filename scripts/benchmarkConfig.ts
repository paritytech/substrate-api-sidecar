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
        path: '/benchmarks/blocks',
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
}
