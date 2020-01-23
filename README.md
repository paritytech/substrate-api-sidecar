# Substrate RPC Proxy

### Installation

```
yarn
```

### Running

```
yarn start
```

### Available paths

+ `/block` fetch latest finalized block details.
+ `/block/NUMBER` fetch block details at block height `NUMBER`.
+ `/balance/ADDRESS` fetch balances for `ADDRESS` at latest finalized block.
+ `/balance/ADDRESS/NUMBER` fetch balances for `ADDRESS` at block height `NUMBER`.

### Configuration

Following ENV variables can be set:

+ `BIND_HOST`: address on which the server will be listening, defaults to `127.0.0.1`.
+ `BIND_PORT`: port on which the server will be listening, defaults to `8080`.
+ `NODE_WS_URL`: WebSocket URL to which the RPC proxy will attempt to connect to, defaults to `ws://127.0.0.1:9944`.