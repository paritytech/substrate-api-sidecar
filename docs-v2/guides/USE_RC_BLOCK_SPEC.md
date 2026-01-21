# Substrate API Sidecar: useRcBlock Query Parameters Specification

## Prerequisites
The `useRcBlock` functionality requires two connection configurations:

**Primary Connection (Asset Hub):**
- `SAS_SUBSTRATE_URL`: Connection to Asset Hub node

**Multi-Chain Connection (Relay Chain):**
- `SAS_SUBSTRATE_MULTI_CHAIN_URL`: JSON array of chain configurations, each containing a `url` and `type` property. The `type` can be 'relay', 'assethub', 'parachain', or undefined. Currently used for Asset Hub migration to query staking information and additional session/babe information from the relay chain. In future releases, this will also be used to improve performance by allowing Sidecar to retrieve information from multiple nodes. This environment variable should be used in combination with the `SAS_SUBSTRATE_URL` variable.

**Example Configuration:**
```
SAS_SUBSTRATE_URL=wss://westend-asset-hub-rpc.polkadot.io
SAS_SUBSTRATE_MULTI_CHAIN_URL='[{"url":"wss://westend-rpc.polkadot.io","type":"relay"}]'
```

## Query Parameters Overview

### useRcBlock Parameter
The `useRcBlock` parameter is a boolean parameter that works in conjunction with the existing `at` parameter. When `useRcBlock=true`, the API queries relay chain data at the block specified by the `at` parameter, treating the `at` value as a relay chain block identifier instead of an Asset Hub block identifier.

**Special Behavior**: When `useRcBlock=true` is used without an `at` parameter, the API will use the finalizedHead of the relay chain to get the associated Asset Hub block.

**Block Finalization Note**: The `useRcBlock` parameter does not make any assumptions about whether the block you pass is finalized or a best block. It is recommended to ensure the block you are passing is finalized if block finalization is important for your use case.

### useRcBlockFormat Parameter
The `useRcBlockFormat` parameter controls the response format when using `useRcBlock=true`. This parameter is only valid when `useRcBlock=true` is specified.

**Values:**
- `array` (default): Returns the standard array format with enhanced metadata
- `object`: Wraps the response in an object containing relay chain block info and the parachain data array

**Validation**: Using `useRcBlockFormat` without `useRcBlock=true` will return a `400 Bad Request` error.

## Implementation: useRcBlock Query Parameter

### Core Functionality
The `useRcBlock` parameter can be added to existing sidecar endpoints to query Asset Hub state using relay chain block identifiers.

**Parameter Format:**
```
at=<relay_chain_block_number_or_hash>&useRcBlock=true
```

**Example Usage:**
```
GET /pallets/staking/progress?at=1000000&useRcBlock=true
GET /accounts/{accountId}/balance-info?at=0x123abc&useRcBlock=true
GET /blocks/head?useRcBlock=true
GET /blocks/12345?at=12345&useRcBlock=true

# With useRcBlockFormat=object for wrapped response format
GET /pallets/staking/progress?at=1000000&useRcBlock=true&useRcBlockFormat=object
GET /accounts/{accountId}/balance-info?at=0x123abc&useRcBlock=true&useRcBlockFormat=object
```

### Response Format Changes

**Without useRcBlock (Traditional Behavior):**
Returns single response object (unchanged):
```json
{
 // ... existing endpoint response data
}
```

**With useRcBlock=true (default array format):**
Returns array format with additional metadata:
```json
[{
 // ... existing endpoint response data
 "rcBlockHash": "0x1234567890abcdef...",
 "rcBlockNumber": "1000000",
 "ahTimestamp": "1642694400"
}]
```

Or empty array `[]` if no corresponding Asset Hub block exists.

**With useRcBlock=true&useRcBlockFormat=object:**
Returns object format wrapping the data with relay chain block info:
```json
{
  "rcBlock": {
    "hash": "0x1234567890abcdef...",
    "parentHash": "0xabcdef1234567890...",
    "number": "1000000"
  },
  "parachainDataPerBlock": [
    {
      // ... existing endpoint response data
      "rcBlockHash": "0x1234567890abcdef...",
      "rcBlockNumber": "1000000",
      "ahTimestamp": "1642694400"
    }
  ]
}
```

Or with empty `parachainDataPerBlock` array if no corresponding Asset Hub block exists:
```json
{
  "rcBlock": {
    "hash": "0x1234567890abcdef...",
    "parentHash": "0xabcdef1234567890...",
    "number": "1000000"
  },
  "parachainDataPerBlock": []
}
```

## Supported Endpoints

### Block Endpoints Supporting useRcBlock:

1. **`/blocks/head`** - Get latest block using RC head block
2. **`/blocks/head/header`** - Get latest block header using RC head block
3. **`/blocks/{blockId}`** - Get single block by RC block identifier
4. **`/blocks/{blockId}/header`** - Get block header by RC block identifier
5. **`/blocks`** - Get block range where range represents RC block numbers (skips RC blocks without corresponding AH blocks)
6. **`/blocks/{blockId}/extrinsics-raw`** - Get raw extrinsics by RC block identifier
7. **`/blocks/{blockId}/extrinsics/{extrinsicIndex}`** - Get specific extrinsic by RC block identifier

### Non-Block Endpoints Supporting useRcBlock:
Most existing sidecar endpoints support the `useRcBlock` parameter, including:
- `/pallets/*` endpoints
- `/accounts/*` endpoints
- Other state query endpoints

## Key Features and Behavior

### Enhanced Response Format
When `useRcBlock=true` is used, responses include additional context fields:
- `rcBlockHash`: The relay chain block hash
- `rcBlockNumber`: The relay chain block number
- `ahTimestamp`: The Asset Hub block timestamp
- Array format (default) prepares for future elastic scaling scenarios
- Object format (`useRcBlockFormat=object`) provides relay chain block metadata wrapper with `rcBlock` info (hash, parentHash, number) and `parachainDataPerBlock` array

### Backward Compatibility
- Defaults to `false`, maintaining existing functionality when not specified
- Existing endpoints remain unchanged when `useRcBlock` is not used
- No breaking changes to current API behavior

### Graceful Handling
- Range endpoints skip RC blocks without corresponding AH blocks
- Returns empty array `[]` when no corresponding Asset Hub block exists
- Multi-block scenarios are handled when Asset Hub produces multiple blocks within a single relay chain block period

### Validation Logic
The `validateUseRcBlock` middleware ensures:
1. **Boolean validation**: `useRcBlock` must be "true" or "false" string
2. **Asset Hub requirement**: Only works when connected to Asset Hub
3. **Relay chain availability**: Requires relay chain API configuration via `SAS_SUBSTRATE_MULTI_CHAIN_URL`
4. **useRcBlockFormat dependency**: `useRcBlockFormat` requires `useRcBlock=true` to be specified
5. **useRcBlockFormat values**: Must be either "array" or "object" string

## Multi-Block and Elastic Scaling Scenarios

### Multi-Block Scenarios
When Asset Hub produces multiple blocks within a single relay chain block period (due to faster block times), the array response format accommodates multiple blocks. The array structure prepares the API for future elastic scaling requirements.

### Elastic Scaling Preparation
The array response format is designed to support future elastic scaling scenarios where multiple Asset Hub blocks may be produced for a single relay chain block reference.

---

## Potential Future Enhancements

### `enforceFinalizedBlockOnAt` Parameter (Suggested Safeguard)

An optional safeguard parameter `enforceFinalizedBlockOnAt` could be implemented to enforce that blocks passed via the at parameter are finalized. When `enforceFinalizedBlockOnAt=true`, the endpoint will error if the specified block is not finalized, providing additional safety for applications that require finalized block guarantees.
