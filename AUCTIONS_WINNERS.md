<h1 style="text-align: center">WinnersData</h1>

## Summary

This is a guide to leverage substrate-api-sidecar's endpoints in order to extract the necessary data to know the winner's of an auction based on its `auctionIndex`.


## Indexing

To find the winner of a completed auction we will need to know the block number the auction ended at. Since Sidecar is a stateless API and auction info is wiped once it is over we need the block number to make historic queries to a state when the relevant data was stored (keep reading for details).

This can be done by leveraging the `/experimental/paras/auctions/current` endpoint. 

When there is an ongoing auction the return object will look like following below:

```
{
  "at": {
    "hash": "string",
    "height": "string"
  },
  "beginEnd": "string",
  "finishEnd": "string",
  "phase": "opening",
  "auctionIndex": "string",
  "leasePeriods": [
    "string"
  ],
  "winning": [
    {
      "bid": {
        "accountId": "string",
        "paraId": "string",
        "amount": "string"
      },
      "leaseSet": [
        "string"
      ]
    }
  ]
}
```

Important keys here are `finishEnd` which is the last block at which the auction will take place, `auctionIndex` which will act as your point of reference for that specific auction, and `leasePeriods` which are the available lease period indexes that may be bid on for the specific `auctionIndex`. 

** Details of each key **

`finishEnd`: This is the last block at which the auction will take place, and also the most important piece of data needed. This will allow you to query the block at which the auction has ended and will give you all the events that have taken place during that block. 

`auctionIndex`: Also known as the `AuctionCounter`, the index will be a pointer or ID to a specific auction. 

`leasePeriods`: These are the available lease period indexes that may be bid on for the specific `auctionIndex`. You can use this to create two seperate relationships explained below. 


## Relationships

With the information you are now tracking there are two main relationships to note. 

1. `auctionIndex` => `leasePeriods` (Lease Periods that are actively being auctioned off)

2. `paraId` => `leasePeriods` (Lease Periods that have been won).


## Walkthrough

### Relay-chain Dev Setup for auctions (SKIP if you already have a development setup)!
-------------

The begining of this guide will start by briefly introducing setting up a simple parachain enviornment if you dont already know how or dont have one set for local developement. 

Start by cloning [polkadot](https://github.com/paritytech/polkadot) and checking out the `rococo-v1` branch. NOTE: Before compiling make sure to adjust the [EndingPeriod](https://github.com/paritytech/polkadot/blob/rococo-v1/runtime/rococo/src/lib.rs#L745) to `100`, and [LeasePeriod](https://github.com/paritytech/polkadot/blob/rococo-v1/runtime/rococo/src/lib.rs#L761) to `100` so the auction time is fit for local development. You can then follow this [gist](https://gist.github.com/emostov/a58f887fce6af8a9b4aa2421114836c5) to get your alice and bob dev validator nodes up. Then you can call those extrinsic calls with the polkadot-js UI. 

### Using Sidecar to find the auction winners

`/experimental/paras/auctions/current` ENDPOINT

An auction will either be in two phases `starting` or `ending`. During this period when querying the endpoint you will receive a `finishEnd` which will denote the last block where the `AuctionClosed` event will take place as well as the `Leased` event. These events will be under the `on_initialize` key. 

It is important to index this block for the current `auctionIndex` because this will be your source of truth of where the winners of the auction are stored. 

The next important key is the `leasePeriods` that corresponds to the current `auctionIndex`. We will use these available `leasePeriods` to compare the winning results and see which `paraId`'s took which slots. 

By this point we have the below relationship. 

EX: (This is just an example, format the data from the endpoint however is necessary)
```javascript
auctionIndex: {
    leasePeriods: [
        "String"
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

Now that you have all the paraId's that won slots for that auction, you can compare it with the data relavant to the `auctionIndex`. Comparing the `leasePeriod`'s that are available during the active auction, to the `leasePeriod`'s that have been won and denoted in the `Leased` events (there may be multiple if there are multiple winners) will give you all the winners for that auction. 
