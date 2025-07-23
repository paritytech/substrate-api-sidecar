# Asset Hub Migration Guide

This guide explains how to configure and use the environment variables required for Asset Hub migration in Substrate API Sidecar.

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

### Response Structure Changes

**Important**: All endpoints that support the `rcAt` parameter now return array responses instead of single enhanced objects. This prepares the API for elastic scaling where multiple Asset Hub blocks could exist per relay chain block.

- **With `rcAt`**: Returns `[{...result, rcBlockNumber, ahTimestamp}]` or `[]`
- **Without `rcAt`**: Returns single response object (unchanged)

For migration details, see [ELASTIC_SCALING_MIGRATION.md](ELASTIC_SCALING_MIGRATION.md).

### Historic Data Limitations

The `/pallets/staking/progress` endpoint currently does not support historic queries. This means you can only query the current staking progress state, and cannot retrieve historical staking progress data from past blocks.

All other endpoints will continue to work with just the primary node configuration (`SAS_SUBSTRATE_URL`).
