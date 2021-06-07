<h1 style="text-align: center">WinnersData</h1>

## Summary:

This is a guide to leverage substrate-api-sidecar's endpoints in order to extract the necessary data to know the winner's of an auction based on its `auctionIndex`.


## Indexing

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


## Relationships
TODO: (Breakdown of what the relationships should look like for example what they are mapping)

With the information you are now tracking there are two main relationships to note. 

1. `auctionIndex` => `leasePeriods`

2. `paraId` => `leasePeriods` (it has won).

EX: `/experimental/paras/leases/current`.


## Walkthrough

### Relay-chain Dev Setup for auctions !(Skip if you already have a development setup)
-------------

The begining of this guide will start by briefly introducing setting up a simple parachain enviornment if you dont already know how or dont have one set for local developement. 

Start by cloning [polkadot](https://github.com/paritytech/polkadot) and checking out the `rococo-v1` branch. NOTE: Before compiling make sure to adjust the [EndingPeriod]() to `100`, and [LeasePeriod](https://github.com/paritytech/polkadot/blob/rococo-v1/runtime/rococo/src/lib.rs#L761) to `100` so the auction time is fit for local development. You can then follow this [gist](https://gist.github.com/emostov/a58f887fce6af8a9b4aa2421114836c5) to get your alice and bob dev validator nodes up. Then you can call those extrinsic calls with the polkadot-js UI. 

### Using Sidecar to find the auction winners

`/experimental/paras/auctions/current` phase: starting
```JSON
{"at":{"hash":"0x9434da4a4a128737bc8abce8f97769289d410d684d46593905669944f764e310","height":"114"},"beginEnd":"294","finishEnd":"394","phase":"starting","auctionIndex":"1","leasePeriods":["1","2","3","4","5","6","7","8"],"winning":[{"bid":{"accountId":"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY","paraId":"1000","amount":"1000000000000000"},"leaseSet":["1"]},{"bid":null,"leaseSet":["1","2"]},{"bid":null,"leaseSet":["1","2","3"]},{"bid":null,"leaseSet":["1","2","3","4"]},{"bid":null,"leaseSet":["1","2","3","4","5"]},{"bid":null,"leaseSet":["1","2","3","4","5","6"]},{"bid":null,"leaseSet":["1","2","3","4","5","6","7"]},{"bid":null,"leaseSet":["1","2","3","4","5","6","7","8"]},{"bid":null,"leaseSet":["2"]},{"bid":null,"leaseSet":["2","3"]},{"bid":null,"leaseSet":["2","3","4"]},{"bid":null,"leaseSet":["2","3","4","5"]},{"bid":null,"leaseSet":["2","3","4","5","6"]},{"bid":null,"leaseSet":["2","3","4","5","6","7"]},{"bid":null,"leaseSet":["2","3","4","5","6","7","8"]},{"bid":null,"leaseSet":["3"]},{"bid":null,"leaseSet":["3","4"]},{"bid":null,"leaseSet":["3","4","5"]},{"bid":null,"leaseSet":["3","4","5","6"]},{"bid":null,"leaseSet":["3","4","5","6","7"]},{"bid":null,"leaseSet":["3","4","5","6","7","8"]},{"bid":null,"leaseSet":["4"]},{"bid":null,"leaseSet":["4","5"]},{"bid":null,"leaseSet":["4","5","6"]},{"bid":null,"leaseSet":["4","5","6","7"]},{"bid":null,"leaseSet":["4","5","6","7","8"]},{"bid":null,"leaseSet":["5"]},{"bid":null,"leaseSet":["5","6"]},{"bid":null,"leaseSet":["5","6","7"]},{"bid":null,"leaseSet":["5","6","7","8"]},{"bid":null,"leaseSet":["6"]},{"bid":null,"leaseSet":["6","7"]},{"bid":null,"leaseSet":["6","7","8"]},{"bid":null,"leaseSet":["7"]},{"bid":null,"leaseSet":["7","8"]},{"bid":null,"leaseSet":["8"]}]}
```
```JSON
{"at":{"hash":"0x2f88e5536af614b9de9d302b19756eff6cdbb5e10c2b45a8712aa6678471fc1d","height":"1145"},"beginEnd":"1159","finishEnd":"1259","phase":"starting","auctionIndex":"2","leasePeriods":["10","11","12","13","14","15","16","17"],"winning":[{"bid":null,"leaseSet":["10"]},{"bid":null,"leaseSet":["10","11"]},{"bid":null,"leaseSet":["10","11","12"]},{"bid":null,"leaseSet":["10","11","12","13"]},{"bid":null,"leaseSet":["10","11","12","13","14"]},{"bid":null,"leaseSet":["10","11","12","13","14","15"]},{"bid":{"accountId":"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY","paraId":"1000","amount":"100000000000000"},"leaseSet":["10","11","12","13","14","15","16"]},{"bid":null,"leaseSet":["10","11","12","13","14","15","16","17"]},{"bid":null,"leaseSet":["11"]},{"bid":null,"leaseSet":["11","12"]},{"bid":null,"leaseSet":["11","12","13"]},{"bid":null,"leaseSet":["11","12","13","14"]},{"bid":null,"leaseSet":["11","12","13","14","15"]},{"bid":null,"leaseSet":["11","12","13","14","15","16"]},{"bid":null,"leaseSet":["11","12","13","14","15","16","17"]},{"bid":null,"leaseSet":["12"]},{"bid":null,"leaseSet":["12","13"]},{"bid":null,"leaseSet":["12","13","14"]},{"bid":null,"leaseSet":["12","13","14","15"]},{"bid":null,"leaseSet":["12","13","14","15","16"]},{"bid":null,"leaseSet":["12","13","14","15","16","17"]},{"bid":null,"leaseSet":["13"]},{"bid":null,"leaseSet":["13","14"]},{"bid":null,"leaseSet":["13","14","15"]},{"bid":null,"leaseSet":["13","14","15","16"]},{"bid":null,"leaseSet":["13","14","15","16","17"]},{"bid":null,"leaseSet":["14"]},{"bid":null,"leaseSet":["14","15"]},{"bid":null,"leaseSet":["14","15","16"]},{"bid":null,"leaseSet":["14","15","16","17"]},{"bid":null,"leaseSet":["15"]},{"bid":null,"leaseSet":["15","16"]},{"bid":null,"leaseSet":["15","16","17"]},{"bid":null,"leaseSet":["16"]},{"bid":null,"leaseSet":["16","17"]},{"bid":null,"leaseSet":["17"]}]}```

`/experimental/paras/auctions/current` phase: ending

```JSON
{"at":{"hash":"0x191d5f28465f4c36f527da1490937868ea1baf023b4ae3150593591d15664a95","height":"327"},"beginEnd":"294","finishEnd":"394","phase":"ending","auctionIndex":"1","leasePeriods":["1","2","3","4","5","6","7","8"],"winning":[{"bid":{"accountId":"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY","paraId":"1000","amount":"1000000000000000"},"leaseSet":["1"]},{"bid":null,"leaseSet":["1","2"]},{"bid":null,"leaseSet":["1","2","3"]},{"bid":null,"leaseSet":["1","2","3","4"]},{"bid":null,"leaseSet":["1","2","3","4","5"]},{"bid":null,"leaseSet":["1","2","3","4","5","6"]},{"bid":null,"leaseSet":["1","2","3","4","5","6","7"]},{"bid":null,"leaseSet":["1","2","3","4","5","6","7","8"]},{"bid":null,"leaseSet":["2"]},{"bid":null,"leaseSet":["2","3"]},{"bid":null,"leaseSet":["2","3","4"]},{"bid":null,"leaseSet":["2","3","4","5"]},{"bid":null,"leaseSet":["2","3","4","5","6"]},{"bid":null,"leaseSet":["2","3","4","5","6","7"]},{"bid":null,"leaseSet":["2","3","4","5","6","7","8"]},{"bid":null,"leaseSet":["3"]},{"bid":null,"leaseSet":["3","4"]},{"bid":null,"leaseSet":["3","4","5"]},{"bid":null,"leaseSet":["3","4","5","6"]},{"bid":null,"leaseSet":["3","4","5","6","7"]},{"bid":null,"leaseSet":["3","4","5","6","7","8"]},{"bid":null,"leaseSet":["4"]},{"bid":null,"leaseSet":["4","5"]},{"bid":null,"leaseSet":["4","5","6"]},{"bid":null,"leaseSet":["4","5","6","7"]},{"bid":null,"leaseSet":["4","5","6","7","8"]},{"bid":null,"leaseSet":["5"]},{"bid":null,"leaseSet":["5","6"]},{"bid":null,"leaseSet":["5","6","7"]},{"bid":null,"leaseSet":["5","6","7","8"]},{"bid":null,"leaseSet":["6"]},{"bid":null,"leaseSet":["6","7"]},{"bid":null,"leaseSet":["6","7","8"]},{"bid":null,"leaseSet":["7"]},{"bid":null,"leaseSet":["7","8"]},{"bid":null,"leaseSet":["8"]}]}
```
```JSON
{"at":{"hash":"0xb6f3153cb4cdd8a4b2757fa7a160fdf39e3cf56de04a1071f528dcf1a2c08e63","height":"384"},"beginEnd":"332","finishEnd":"432","phase":"ending","auctionIndex":"1","leasePeriods":["1","2","3","4","5","6","7","8"],"winning":[{"bid":{"accountId":"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY","paraId":"1000","amount":"1000000000000000"},"leaseSet":["1"]},{"bid":null,"leaseSet":["1","2"]},{"bid":null,"leaseSet":["1","2","3"]},{"bid":{"accountId":"5EYCAe5ijiYdg22N9DbTDPULQjMsMukA5jMsR83XarnmGAL9","paraId":"1000","amount":"5000000000000000"},"leaseSet":["1","2","3","4"]},{"bid":null,"leaseSet":["1","2","3","4","5"]},{"bid":null,"leaseSet":["1","2","3","4","5","6"]},{"bid":null,"leaseSet":["1","2","3","4","5","6","7"]},{"bid":null,"leaseSet":["1","2","3","4","5","6","7","8"]},{"bid":null,"leaseSet":["2"]},{"bid":null,"leaseSet":["2","3"]},{"bid":null,"leaseSet":["2","3","4"]},{"bid":null,"leaseSet":["2","3","4","5"]},{"bid":null,"leaseSet":["2","3","4","5","6"]},{"bid":null,"leaseSet":["2","3","4","5","6","7"]},{"bid":null,"leaseSet":["2","3","4","5","6","7","8"]},{"bid":null,"leaseSet":["3"]},{"bid":null,"leaseSet":["3","4"]},{"bid":null,"leaseSet":["3","4","5"]},{"bid":null,"leaseSet":["3","4","5","6"]},{"bid":null,"leaseSet":["3","4","5","6","7"]},{"bid":null,"leaseSet":["3","4","5","6","7","8"]},{"bid":null,"leaseSet":["4"]},{"bid":null,"leaseSet":["4","5"]},{"bid":null,"leaseSet":["4","5","6"]},{"bid":null,"leaseSet":["4","5","6","7"]},{"bid":null,"leaseSet":["4","5","6","7","8"]},{"bid":null,"leaseSet":["5"]},{"bid":null,"leaseSet":["5","6"]},{"bid":null,"leaseSet":["5","6","7"]},{"bid":null,"leaseSet":["5","6","7","8"]},{"bid":null,"leaseSet":["6"]},{"bid":null,"leaseSet":["6","7"]},{"bid":null,"leaseSet":["6","7","8"]},{"bid":null,"leaseSet":["7"]},{"bid":null,"leaseSet":["7","8"]},{"bid":null,"leaseSet":["8"]}]}
```


`/blocks/394`

```JSON
{"number":"394","hash":"0xc3bb4f152bcb142d5f18b438008713426b3c213d80c4a9791551c8f09aa3f48d","parentHash":"0xca394ad837929561b755ed3eb621af9cdcee916efd24e74b4d8117090b2ab049","stateRoot":"0xbf68d23cdb4a8291f6eb86252963cda8881baa1c9dacc312688f17c0545d373f","extrinsicsRoot":"0xc355b2d462141e1153b285b4e3b87d19f35f0d9ee5a5d43001277fdf969cc1b3","authorId":"5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc","logs":[{"type":"PreRuntime","index":"6","value":["0x42414245","0x0301000000850f1f1000000000d6f159bed6add826b925405ad0c3af5e4077f6157007c06d8c2f827ab19c5c3c2ba4acdef0a7879ce09c242eeea99cf7f57c2b769d16895997303eb74d52240b0ae20a97f25a1f2c256df4a3cafbdab9cbf1c65155425f64367e1b1c9a4d6004"]},{"type":"Consensus","index":"4","value":["0x42454546","0x03c27d01d87b2d8a3521d48f7339af236c1ad6f3baf95ab360d4b9640a03095d3e"]},{"type":"Seal","index":"5","value":["0x42414245","0xdc12632bc989b8a4e11bb45eb5e479524fd48defe12ba040bfd95cbe5d410a2aa2c5c599e779ac6d80dd9a1232ad06775cd52efd75a4050613d759e97a39f08e"]}],"onInitialize":{"events":[{"method":{"pallet":"auctions","method":"WinningOffset"},"data":["1","88"]},{"method":{"pallet":"balances","method":"Unreserved"},"data":["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY","1000000000000000"]},{"method":{"pallet":"auctions","method":"AuctionClosed"},"data":["1"]}]},"extrinsics":[{"method":{"pallet":"timestamp","method":"set"},"signature":null,"nonce":null,"args":{"now":"1622826270005"},"tip":null,"hash":"0xd3a475a000e120862dfa856f2f848c526ca349437842eed0e6b6dc4cf77942d8","info":{},"events":[{"method":{"pallet":"system","method":"ExtrinsicSuccess"},"data":[{"weight":"161650000","class":"Mandatory","paysFee":"Yes"}]}],"success":true,"paysFee":false},{"method":{"pallet":"parasInherent","method":"enter"},"signature":null,"nonce":null,"args":{"data":{"bitfields":[{"payload":"0x","validatorIndex":"0","signature":"0x6e4f46a50edf3527980cb0f37eaaa0e293784fcdb71d6ad89efbafa14c1851186fad5babb7cbdbc80ff91d7124aff5a988f27a2765f3248292e2577ef1807b81"}],"backedCandidates":[],"disputes":[],"parentHeader":{"parentHash":"0x40396201912ffc422caac1cf917fd3b6bdac7cba2b913bf54dea49a2e7c06514","number":"393","stateRoot":"0x31bc8007eafd14c3d2b304436de2a8aa66b0b80b475f52fdb8cdb66dbee7d772","extrinsicsRoot":"0x136938b2e068b4a3eb42730468f9d963ca273ff5bfc78ae4bf197dd204a817e4","digest":{"logs":[{"preRuntime":["0x42414245","0x0300000000840f1f10000000005a3ac15878501a0f93b0de1a68f73f7fa56695ca71336b31ac0c697ce8994263bb50a1e52d9e907c81c9b0f18c3b749aec745c2ef3dc042774b441cc47a74d068965bc9a767bfdf8e4a673d448c15cf12e87519d24fb08bf1c5b7be1d26c0a0f"]},{"consensus":["0x42454546","0x03ee174b0d1ed9c1183641deb2d4aef9b48f485ffe99b3565aa0bbb2771d3e2b85"]},{"seal":["0x42414245","0xa876710a206a9095f8ea4dfa69a081ce9190b5dac857ef056ac4ff41fd05c4091ef5a28c88e965ff7ab552ba0b9d51fcd2bac138d20d72b2e6117cc5e6689a82"]}]}}}},"tip":null,"hash":"0x40aa009d3c8d3a97d97d9844a8eb84c5fd232606b29d67c87f2966153e6e848c","info":{},"events":[{"method":{"pallet":"system","method":"ExtrinsicSuccess"},"data":[{"weight":"250000000","class":"Mandatory","paysFee":"Yes"}]}],"success":true,"paysFee":false}],"onFinalize":{"events":[]},"finalized":true}
```

In this case you would index `finishEnd: "394"` as your ending block to query to retrieve the event. 


