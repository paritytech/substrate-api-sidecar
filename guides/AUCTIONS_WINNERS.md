<h1 style="text-align: center">WinnersData</h1>

## Summary

In this guide we will learn how to track auction winners using [substrate-api-sidecar](https://github.com/paritytech/substrate-api-sidecar).


## Key values to track and store

To find the winner of a completed auction we will need to know the block number the auction ended at. Since Sidecar is a stateless API and the auction info is stored at the final block of an auction, once the auction is over we need the block number to make historic queries to retrieve the event and data stored in it (keep reading for details).

We will start by leveraging the `/experimental/paras/auctions/current` endpoint. 

When there is an ongoing auction the return object will look like following below:

```
{
  "at": {
    "hash": "0x88c1d8ba6ae0dd8f288a1ff35ff33eec1ad78b569df71dcac0ac1ab611154396",
    "height": "285"
  },
  "beginEnd": "356",
  "finishEnd": "456",
  "phase": "starting",
  "auctionIndex": "1",
  "leasePeriods": [
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10"
  ],
  "winning": [
    {
      "bid": null,
      "leaseSet": [
        "3"
      ]
    },
    {
      "bid": {
        "accountId": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        "paraId": "1000",
        "amount": "500000000000000"
      },
      "leaseSet": [
        "3",
        "4"
      ]
    },
    {
      "bid": null,
      "leaseSet": [
        "3",
        "4",
        "5"
      ]
    }
  ],
  ...
}
```

We will track and store `finishEnd`,`auctionIndex`, and `leasePeriods` in a Database. 

** Details of each key **

`finishEnd`: This is the last block of the auction. Storing it allows you to query the block at which the auction ended. From that block you can extract the lease winning related events. (To query the block: GET `/blocks/{finishEnd}`.)

`auctionIndex`: The unique identifier for the auction. 

`leasePeriods`: The available lease period indexes that may be bid on for the specific `auctionIndex`. 


## Walkthrough

### Relay-chain Dev Setup for auctions (SKIP if you already have a development setup)!
-------------

The begining of this guide will start by briefly introducing setting up a simple parachain enviornment if you dont already know how or dont have one set for local developement. 

Start by cloning [polkadot](https://github.com/paritytech/polkadot) and checking out the 'release-v0.9.5' branch. NOTE: Before compiling make sure to adjust the [EndingPeriod](https://github.com/paritytech/polkadot/blob/master/runtime/kusama/src/lib.rs#L1158) to `100`, and [LeasePeriod](https://github.com/paritytech/polkadot/blob/master/runtime/kusama/src/lib.rs#L1123) to `100` so the auction time is fit for local development. You can then follow this [gist](https://gist.github.com/emostov/a58f887fce6af8a9b4aa2421114836c5) to get your alice and bob dev validator nodes up (make sure to change '--chain' to 'kusama'). Then you can call the extrinsics featured in the aforementioned gist using the [polkadot-js UI](https://polkadot.js.org/apps/#/extrinsics). (Note: The parachain functionality will not be on Polkadot until the relevant runtime upgrade is approved by governance.)

### Using Sidecar to find the auction winners

`/experimental/paras/auctions/current` ENDPOINT

An ongoing auction is either in one of two phases: `starting` or `ending`. During an ongoing auction the endpoint returns a `finishEnd` key which denotes the block where the `AuctionClosed` and `Leased` events are emitted. The aforementioned events are emitted under the `on_initialize` key. 

By storing the `finishEnd` block and looking at the `Leased` events within it, we can see who the auction winners are and what lease periods they were rewarded.

The next important part is the `leasePeriods` that corresponds to the current `auctionIndex`. We use these available `leasePeriods` to compare the winning results and see which `paraId`'s took which slots. (Note that this is a redundant way to find the auction winners when coupled with watching for the `Leased` events)

EX: (The below code snippet is just an example, format the data from the endpoint however is necessary)
```javascript
auctionIndex: {
    leasePeriods: [
        "11", "12", "13", "14"
    ],
    finishEnd: '200'
}
```

`/blocks/:blockId` ENDPOINT

Once the auction is over, its time to query the `blocks` endpoint at the block height given in the `finishEnd` field, and retrieve the events inside of `on_initialize`.

Example Response
```
{
    authorId: ....,
    extrinsics:....
    ...
    on_initialize: {
        events: [
            {
                "method": {
                    "pallet": "slots",
                    "method": "Leased"
                },
                "data": [
                    '1000', // ParaId
                    '5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc', // AccountId
                    '1', // LeasePeriod (begining of the lease period)
                    '4', // LeasePeriod (the count of the lease period)
                    '10000', // Balance (extra balance reserved)
                    '1000000000', // Balance (total balance) 
                ]
            },
            {
                "method": {
                    "pallet": "auctions",
                    "method": "AuctionClosed"
                },
                "data": [
                    ...
                ]
            }
        ]
    }
}
```

Now that you have all the `paraId`s that won slots for that auction, you can compare it with the data relevant to the `auctionIndex`. Comparing the `leasePeriod`s that are available during the active auction to the `leasePeriod`s that have been won and denoted in the `Leased` events (there may be multiple if there are multiple winners) will give you all the winners for that auction. 
