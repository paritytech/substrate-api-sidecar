# Asset Hub Migration & Elastic Scaling Guide

This comprehensive guide explains how to configure Asset Hub migration in Substrate API Sidecar and understand the related elastic scaling changes that prepare the API for future multi-block scenarios.

## ⚠️ Important: Niche Feature Notice

**The `useRcBlock` parameter and elastic scaling functionality is a specialized feature designed for stakeholders who specifically need to track Asset Hub blocks using relay chain block references.** 

**If you are not planning to use the relay chain as a way to track Asset Hub state, you can safely ignore everything related to `useRcBlock` and elastic scaling in this guide.** Standard Asset Hub queries will continue to work exactly as before without any configuration changes.

## Environment Variables

### Required Configuration

To properly handle Asset Hub migration, you need to configure two environment variables:

1. `SAS_SUBSTRATE_URL`: The primary WebSocket URL for your Asset Hub node
2. `SAS_SUBSTRATE_MULTI_CHAIN_URL`: A JSON array containing additional chain configurations

### Important Note on Node Requirements

If you need to use any of the endpoints that require multi-chain configuration (like `/pallets/staking/progress`), you will need to run two separate nodes:
- One node for the Asset Hub chain
- One node for the relay chain

Both nodes must be running and accessible for these endpoints to function properly.

### Multi-Chain Configuration

The `SAS_SUBSTRATE_MULTI_CHAIN_URL` environment variable accepts a JSON array of chain configurations. Each configuration object should contain:

- `url`: The WebSocket URL for the additional node
- `type`: The type of chain (can be 'relay', 'assethub', 'parachain', or undefined)

Currently, this configuration is primarily used for:
- Querying staking information
- Retrieving additional session/babe information from the relay chain

In future releases, this configuration will also be used to improve performance by allowing Sidecar to retrieve information from multiple nodes.

## Example Configuration

Here's an example configuration for Westend network:

```bash
# Primary Asset Hub node
SAS_SUBSTRATE_URL=wss://westend-asset-hub-rpc.polkadot.io

# Additional chain configuration (relay chain in this case)
SAS_SUBSTRATE_MULTI_CHAIN_URL='[{"url":"wss://westend-rpc.polkadot.io","type":"relay"}]'
```

## Affected Endpoints

Currently, only the following endpoint requires the multi-chain configuration:
- `/pallets/staking/progress`

The `/pallets/staking/progress` endpoint requires two chains because it needs to combine information from both chains:
- The Asset Hub chain provides era information from the staking pallet
- The relay chain provides additional storage information from the babe pallet

This dual-chain requirement is specific to this endpoint, as it needs to gather information from both sources to provide complete staking progress data.

## Elastic Scaling & Response Structure Changes

> **Note**: This section only applies if you are using the `useRcBlock` parameter. If you're not using relay chain block tracking, you can skip this entire section.

**Important**: All endpoints that support the `useRcBlock` parameter return array responses instead of single enhanced objects (when used). This prepares the API for Polkadot/Kusama elastic scaling where multiple Asset Hub blocks could exist per relay chain block.

### What Changed

#### New Array Response Behavior

When using `useRcBlock` parameter, endpoints now return an array of response objects:

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

#### Affected Parameters

- **`useRcBlock`**: When set to 'true', uses the relay chain block specified in the 'at' parameter to determine corresponding Asset Hub block(s)

#### Response Format Summary

- **With `useRcBlock=true`**: Returns `[{...result, rcBlockNumber, ahTimestamp}]` or `[]`
- **Without `useRcBlock`**: Returns single response object (unchanged)

### Affected Endpoints

> **Note**: These endpoints only change behavior when using `useRcBlock=true`. Without this parameter, they work exactly as before.

All the following endpoints support the `useRcBlock` parameter and return array responses when it's used:

#### Account Endpoints
- `/accounts/{accountId}/asset-balances`
- `/accounts/{accountId}/asset-approvals`
- `/accounts/{accountId}/pool-asset-balances`
- `/accounts/{accountId}/pool-asset-approvals`
- `/accounts/{accountId}/balance-info`
- `/accounts/{accountId}/staking-info`
- `/accounts/{accountId}/staking-payouts`
- `/accounts/{accountId}/vesting-info`
- `/accounts/{accountId}/proxy-info`

#### Block Endpoints (useRcBlock)
- `/blocks/head`
- `/blocks/{blockId}`
- `/blocks/{blockId}/header`
- `/blocks/head/header`
- `/blocks/{blockId}/extrinsics/{extrinsicIndex}`
- `/blocks/{blockId}/extrinsics-raw`
- `/blocks`

#### Pallets Endpoints
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

> **Important Reminder**: These migration steps are only necessary if you plan to use the `useRcBlock` parameter for relay chain block tracking. Standard Asset Hub functionality requires no migration.

### 1. Complete Environment Setup

Ensure your Substrate API Sidecar instance is configured with both Asset Hub and relay chain nodes:

```bash
# Asset Hub node (primary)
SAS_SUBSTRATE_URL=wss://westend-asset-hub-rpc.polkadot.io

# Relay chain node (secondary, required for useRcBlock functionality)
SAS_SUBSTRATE_MULTI_CHAIN_URL='[{"url":"wss://westend-rpc.polkadot.io","type":"relay"}]'
```

### 2. Update Response Handling

If you're using `useRcBlock` parameter, update your code to handle array responses:

```javascript
const response = await fetch('/accounts/123/balance-info?at=5000000&useRcBlock=true');
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

### 3. Check for Empty Results

The new behavior returns empty arrays when no Asset Hub blocks are found:

```javascript
const response = await fetch('/accounts/123/balance-info?at=5000000&useRcBlock=true');
const data = await response.json();

if (data.length === 0) {
  // No Asset Hub blocks found for this relay chain block
  console.log('No data available for this relay chain block');
  return;
}

// Process results
const result = data[0]; // Get first (and currently only) result
```

### 4. Prepare for Future Elastic Scaling

While current implementation returns 0 or 1 results, elastic scaling will enable multiple Asset Hub blocks per relay chain block:

```javascript
const response = await fetch('/accounts/123/balance-info?at=5000000&useRcBlock=true');
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

- **Regular queries** (without `useRcBlock`) continue to return single objects unchanged
- **All existing functionality** remains the same for standard queries
- **Only array structure** changes affect `useRcBlock` queries

## Benefits

1. **Asset Hub Migration Support**: Enables querying Asset Hub data using relay chain block references
2. **Elastic Scaling Ready**: Prepared for multiple Asset Hub blocks per relay chain block
3. **Consistent API**: All endpoints follow the same array response pattern
4. **Predictable**: Empty arrays instead of errors when no blocks found

## Examples

### Single Result (Current Behavior)
```bash
curl "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/123/balance-info?at=20000000&useRcBlock=true"
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
curl "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/123/balance-info?at=999999999&useRcBlock=true"
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

## Historic Data Limitations

The `/pallets/staking/progress` endpoint currently does not support historic queries. This means you can only query the current staking progress state, and cannot retrieve historical staking progress data from past blocks.

All other endpoints will continue to work with just the primary node configuration (`SAS_SUBSTRATE_URL`).

## Need Help?

If you encounter issues during migration, please:

1. **First, verify multi-chain setup**: Ensure both Asset Hub and relay chain nodes are running and accessible
2. **Check environment variables**: Verify `SAS_SUBSTRATE_URL` and `SAS_SUBSTRATE_MULTI_CHAIN_URL` are correctly configured
3. **Test connectivity**: Ensure both WebSocket URLs are reachable from your Sidecar instance
4. **Review array handling**: Update your client code to handle array responses when using `useRcBlock`
5. **Check this guide**: Review the migration steps and examples above
6. **Open an issue**: For persistent issues, create an issue on [GitHub](https://github.com/paritytech/substrate-api-sidecar/issues)

**Remember**: The `useRcBlock` parameter requires both Asset Hub and relay chain APIs to be available and properly configured. Without proper multi-chain setup, these features will not work.

The changes enable Asset Hub migration support while preparing the API for future elastic scaling scenarios where multiple Asset Hub blocks could exist per relay chain block.
