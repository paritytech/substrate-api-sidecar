<div style="text-align: center">WinnersData</div>

### Summary:

This is a guide to leverage substrate-api-sidecar's endpoints in order to extract the necessary data to know the winner's of an auction based on its `auctionIndex`.

### Indexing

One important note to finding the winner of each auction is making sure to index the block at which an auction ends. Since Sidecar is a stateless API, and due to the storage architecture for auctions in Substrate, you must index and keep track of certain fields during an ongoing auction so that the data collected can be used to find out which paraId's have won certain lease periods. 

 This can be done by leveraging the `/experimental/paras/auctions current` endpoint. 

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

With the information you are now tracking there are two main relationships to note. 

1. `auctionIndex` => `leasePeriods`

2. `paraId` => `leasePeriods` (it has won).

EX: `/experimental/paras/leases/current`.
