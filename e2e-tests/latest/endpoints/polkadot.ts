import { IConfig } from '../types/endpoints';

export const polkadot: IConfig = {
    '/accounts/{accountId}/balance-info': {
        path: '/accounts/12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW/balance-info',
        queryParams: [
            'denominated=true',
            'at={blockId}'
        ],
    },
    '/accounts/{accountId}/convert': {
        path: '/accounts/0xde1894014026720b9918b1b21b488af8a0d4f15953621233830946ec0b4d7b75/convert',
        queryParams: [],
    },
    '/accounts/{accountId}/vesting-info': {
        path: '/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info',
        queryParams: [
            'at={blockId}',
        ],
    },
    '/accounts/{accountId}/staking-info': {
        path: '/accounts/12BnVhXxGBZXoq9QAkSv9UtVcdBs1k38yNx6sHUJWasTgYrm/staking-info',
        queryParams: [
            'at={blockId}'
        ]
    },
    '/accounts/{accountId}/staking-payouts': {
        path: '/accounts/12BnVhXxGBZXoq9QAkSv9UtVcdBs1k38yNx6sHUJWasTgYrm/staking-payouts',
        queryParams: [
            'at={blockId}',
            'unclaimedOnly=false',
        ],
    },
    '/accounts/{accountId}/validate': {
        path: '/accounts/DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc/validate',
        queryParams: [],
    },
    '/blocks': {
        path: '/blocks?range=1-5',
        queryParams: [],
    },
    '/blocks/{blockId}': { 
        path: '/blocks/{blockId}',
        queryParams: [
            'eventDocs=true',
            'extrinsicDocs=true',
        ],
    },
    '/blocks/{blockId}/header': {
        path: '/blocks/{blockId}/header',
        queryParams: [],
    },
    '/blocks/{blockId}/extrinsics/{extrinsicIndex}': {
        path: `/blocks/{blockId}/extrinsics/0`,
        queryParams: [
            'eventDocs=true',
            'extrinsicDocs=true',
        ],
    },
    '/blocks/head': {
        path: `/blocks/head`,
        queryParams: [
            'eventDocs=true',
            'extrinsicDocs=true',
        ],
    },
    '/blocks/head/header': {
        path: '/blocks/head',
        queryParams: [],
    },
    '/node/network': {
        path: '/node/network',
        queryParams: [],
    },
    '/node/transaction-pool': {
        path: '/node/transaction-pool',
        queryParams: [
            'includeFee=true',
        ],
    },
    '/node/version': {
        path: '/node/version',
        queryParams: [],
    },
    '/pallets/staking/progress': {
        path: '/pallets/staking/progress',
        queryParams: [
            'at={blockId}',
        ],
    },
    '/pallets/{palletId}/storage': {
        path: '/pallets/System/storage',
        queryParams: [
            'onlyIds=true',
            'at={blockId}',
        ],
    },
    '/pallets/{palletId}/storage/{storageItemId}': {
        path: '/pallets/System/storage/BlockWeight',
        queryParams: [
            'metadata=true',
            'at={blockId}',
        ],
    },
    '/runtime/metadata': {
        path: '/runtime/metadata',
        queryParams: [
            'at={blockId}',
        ],
    },
    '/runtime/code': {
        path: '/runtime/code',
        queryParams: [
            'at={blockId}',
        ],
    },
    '/runtime/spec': {
        path: '/runtime/spec',
        queryParams: [
            'at={blockId}',
        ],
    },
    '/transaction/material': {
        path: '/transaction/material',
        queryParams: [
            'noMeta=true',
        ],
    },
    '/paras': {
        path: '/paras',
        queryParams: [
            'at={blockId}',
        ],
    },
    '/paras/leases/current': {
        path: '/paras/leases/current',
        queryParams: [
            'at={blockId}',
            'currentLeaseHolders=false'
        ],
    },
    '/paras/auctions/current': {
        path: '/paras/auctions/current',
        queryParams: [
            'at={blockId}',
        ],
    },
    '/paras/crowdloans': {
        path: '/paras/crowdloans',
        queryParams: [
            'at={blockId}',
        ],
    },
    '/paras/{paraId}/crowdloan-info': {
        path: '/paras/2021/crowdloan-info',
        queryParams: [
            'at={blockId}',
        ],
    },
    '/paras/{paraId}/lease-info': {
        path: '/paras/2021/lease-info',
        queryParams: [
            'at={blockId}',
        ],
    }
}
