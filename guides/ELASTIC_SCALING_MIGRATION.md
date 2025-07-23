# Elastic Scaling Migration Guide

This guide explains the changes made to `rcAt` and `useRcBlock` parameter behavior in preparation for Polkadot/Kusama elastic scaling. These changes affect the response structure for all endpoints that support these parameters.

## Background

In preparation for elastic scaling, where multiple Asset Hub blocks could exist per relay chain block, the API responses for `rcAt` and `useRcBlock` parameters return arrays instead of single enhanced objects.

## What Changed

### New Behavior

When using `rcAt` or `useRcBlock` parameters, endpoints now return an array of response objects:

```json
[
  {
    "at": {
      "hash": "0x...",
      "height": "1234567"
    },
    "data": "...",
    "rcBlockNumber": "5678901",
    "ahTimestamp": "1234567890"
  }
]
```

If no Asset Hub blocks are found for the specified relay chain block, an empty array is returned:

```json
[]
```

## Affected Parameters

- **`rcAt`**: Used to query Asset Hub data based on relay chain block numbers
- **`useRcBlock`**: Used to use the latest relay chain block to determine Asset Hub block

## Affected Endpoints

### Account Endpoints
- `/accounts/{accountId}/asset-balances`
- `/accounts/{accountId}/asset-approvals`
- `/accounts/{accountId}/pool-asset-balances`
- `/accounts/{accountId}/pool-asset-approvals`
- `/accounts/{accountId}/balance-info`
- `/accounts/{accountId}/staking-info`
- `/accounts/{accountId}/staking-payouts`
- `/accounts/{accountId}/vesting-info`
- `/accounts/{accountId}/proxy-info`

### Block Endpoints (useRcBlock)
- `/blocks/head`
- `/blocks/{blockId}`
- `/blocks/{blockId}/header`
- `/blocks/head/header`
- `/blocks/{blockId}/extrinsics/{extrinsicIndex}`
- `/blocks/{blockId}/extrinsics-raw`
- `/blocks`

### Pallets Endpoints
- `/pallets/asset-conversion/next-available-id`
- `/pallets/asset-conversion/liquidity-pools`
- `/pallets/assets/{assetId}/asset-info`
- `/pallets/{palletId}/consts`
- `/pallets/{palletId}/consts/{constantItemId}`
- `/pallets/{palletId}/dispatchables`
- `/pallets/{palletId}/dispatchables/{dispatchableItemId}`
- `/pallets/{palletId}/errors`
- `/pallets/{palletId}/errors/{errorItemId}`
- `/pallets/{palletId}/events`
- `/pallets/{palletId}/events/{eventItemId}`
- `/pallets/foreign-assets`
- `/pallets/nomination-pools/info`
- `/pallets/nomination-pools/{poolId}`
- `/pallets/ongoing-referenda`
- `/pallets/pool-assets/{assetId}/asset-info`
- `/pallets/staking/progress`
- `/pallets/staking/validators`
- `/pallets/{palletId}/storage`
- `/pallets/{palletId}/storage/{storageItemId}`

## Migration Steps

### 1. Update Response Handling

If you're using `rcAt` or `useRcBlock` parameters, update your code to handle array responses:

```javascript
const response = await fetch('/accounts/123/balance-info?rcAt=5000000');
const data = await response.json();

// Handle array response
if (data.length === 0) {
  console.log('No Asset Hub blocks found for this relay chain block');
} else {
  // Process each Asset Hub block (currently will be 0 or 1, but prepared for multiple)
  data.forEach(item => {
    console.log(item.free);
    console.log(item.rcBlockNumber);
  });
}
```

### 2. Check for Empty Results

The new behavior returns empty arrays when no Asset Hub blocks are found (instead of recursive searching):

```javascript
const response = await fetch('/accounts/123/balance-info?rcAt=5000000');
const data = await response.json();

if (data.length === 0) {
  // No Asset Hub blocks found for this relay chain block
  console.log('No data available for this relay chain block');
  return;
}

// Process results
const result = data[0]; // Get first (and currently only) result
```

### 3. Prepare for Multiple Results

While current implementation returns 0 or 1 results, elastic scaling will enable multiple Asset Hub blocks per relay chain block:

```javascript
const response = await fetch('/accounts/123/balance-info?rcAt=5000000');
const data = await response.json();

// Handle multiple Asset Hub blocks (future-ready)
data.forEach((block, index) => {
  console.log(`Asset Hub block ${index + 1}:`);
  console.log(`Block number: ${block.at.height}`);
  console.log(`RC block: ${block.rcBlockNumber}`);
  console.log(`Timestamp: ${block.ahTimestamp}`);
});
```

## Backward Compatibility

- **Regular queries** (without `rcAt` or `useRcBlock`) continue to return single objects unchanged
- **All existing functionality** remains the same for standard queries
- **Only array structure** changes affect `rcAt` and `useRcBlock` queries

## Benefits

1. **Elastic Scaling Ready**: Prepared for multiple Asset Hub blocks per relay chain block
2. **Consistent API**: All endpoints follow the same array response pattern
3. **Predictable**: Empty arrays instead of errors when no blocks found

## Examples

### Single Result (Current Behavior)
```bash
curl "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/123/balance-info?rcAt=20000000"
```

Response:
```json
[
  {
    "at": {
      "hash": "0x...",
      "height": "1234567"
    },
    "free": "1000000000000",
    "reserved": "0",
    "miscFrozen": "0",
    "feeFrozen": "0",
    "rcBlockNumber": "20000000",
    "ahTimestamp": "1705123456789"
  }
]
```

### Empty Result (No Asset Hub Block Found)
```bash
curl "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/123/balance-info?rcAt=999999999"
```

Response:
```json
[]
```

### Regular Query (Unchanged)
```bash
curl "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/123/balance-info"
```

Response (unchanged):
```json
{
  "at": {
    "hash": "0x...",
    "height": "1234567"
  },
  "free": "1000000000000",
  "reserved": "0",
  "miscFrozen": "0",
  "feeFrozen": "0"
}
```

## Need Help?

If you encounter issues during migration, please:

1. Check this guide for common patterns
2. Review the specific endpoint documentation
3. Open an issue on [GitHub](https://github.com/paritytech/substrate-api-sidecar/issues)

The changes prepare the API for future elastic scaling while maintaining all existing functionality for regular queries.