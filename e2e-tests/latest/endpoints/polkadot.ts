export const polkadot = {
    accounts: {
        '/{accountId}/balance-info': {
            path: '/accounts/12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW/balance-info',
            queryParams: [
                'denominated=true',
                'at={blockId}'
            ],
        },
        '/{accountId}/convert': {
            path: '/accounts/DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc/convert',
        },
        '/{accountId}/vesting-info': {
            path: '/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/vesting-info',
            queryParams: [
                'at={blockId}',
            ],
        },
        '/{accountId}/staking-info': {
            path: '/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/staking-info',
            queryParams: [
                'at={blockId}'
            ]
        },
        '/{accountId}/staking-payouts': {
            path: '/accounts/15aKvwRqGVAwuBMaogtQXhuz9EQqUWsZJSAzomyb5xYwgBXA/staking-info',
            queryParams: [
                'at={blockId}',
                'unclaimedOnly=false',
            ],
        },
        '/{accountId}/validate': {
            path: '/accounts/DXgXPAT5zWtPHo6FhVvrDdiaDPgCNGxhJAeVBYLtiwW9hAc/validate',
        }
    },
    blocks: {
        '/': {
            path: '/blocks?range=0-199',
            queryParams: [
                'eventDocs=true',
                'extrinsicDocs= true',
            ],
        },
        '/{blockId}': { 
            path: '/blocks/{blockId}',
            queryParams: [
                'eventDocs=true',
                'extrinsicDocs= true',
            ],
        },
        '/{blockId}/header': {
            path: '/blocks/{blockId}/header',
        },
        '/blocks/{blockId}/extrinsics/{extrinsicIndex}': {
            path: `/blocks/{blockId}/extrinsics/0`,
            queryParams: [
                'eventDocs=true',
                'extrinsicDocs=true',
            ],
        },
        '/head': {
            path: `/blocks/head`,
            queryParams: [
                'eventDocs=true',
                'extrinsicDocs=true',
            ],
        },
        '/head/header': {
            path: '/blocks/head',
        }
    },
    node: {
        '/network': {
            path: '/node/network',
        },
        '/node/transaction-pool': {
            path: '/node/transaction-pool',
            queryParams: [
                'includeFee=true',
            ],
        },
        '/node/version': {
            path: '/node/version',
        },
    },
    pallets: {
        '/staking/progress': {
            path: '/pallets/staking/progress',
            queryParams: [
                'at={blockId}',
            ],
        },
        '/{palletId}/storage': {
            path: '/pallet/System/storage',
            queryParams: [
                'onlyIds=true',
                'at={blockId}',
            ],
        },
        '/{palletId}/storage/{storageItemId}': {
            path: '/pallet/System/storage/BlockWeight',
            queryParams: [
                'metadata=true',
                'at={blockId}',
            ],
        }
    },
    runtime: {
        '/metadata': {
            path: '/runtime/metadata',
            queryParams: [
                'at={blockId}',
            ],
        },
        '/code': {
            path: '/runtime/code',
            queryParams: [
                'at={blockId}',
            ],
        },
        '/spec': {
            path: '/runtime/spec',
            queryParams: [
                'at={blockId}',
            ],
        }
    },
    transaction: {
        '/material': {
            path: '/transaction/material',
            queryParams: [
                'noMeta=true',
            ],
        },
    },
    paras: {
        '/': {
            path: '/paras',
            queryParams: [
                'at={blockId}',
            ],
        },
        '/leases/current': {
            path: '/paras/leases/current',
            queryParams: [
                'at=true',
                'currentLeaseHolders=false'
            ],
        },
        '/auctions/current': {
            path: '/paras/auctions/current',
            queryParams: [
                'at=true',
            ],
        },
        '/crowdloans': {
            path: '/paras/crowdloans',
            queryParams: [
                'at=true',
            ],
        },
        '/{paraId}/crowdloan-info': {
            path: '/paras/2021/crowdloan-info',
            queryParams: [
                'at=true',
            ],
        },
        '/{paraId}/lease-info': {
            path: '/paras/2021/lease-info',
            queryParams: [
                'at=true',
            ],
        }
    },
}
