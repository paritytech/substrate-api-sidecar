# Memory Profiler

A comprehensive memory profiling tool for Substrate API Sidecar that helps identify memory usage patterns, potential memory leaks, and performance characteristics across different API endpoints.

## Overview

The memory profiler consists of two main components:

1. **IsolatedMemoryProfiler** - Tests each endpoint in isolation with system recovery between tests
2. **CustomEndpointProfiler** - Specialized tests for deep diving into specific endpoint categories

## Features

- **Endpoint Isolation**: Each endpoint is tested separately to avoid interference
- **Memory Leak Detection**: Sophisticated algorithms to identify potential memory leaks
- **Query Parameter Testing**: Tests different `at` block heights and `range` parameters
- **Garbage Collection Integration**: Uses Node.js GC for more accurate measurements
- **Comprehensive Reporting**: JSON and CSV outputs for detailed analysis
- **Performance Correlation**: Links memory usage to response times and sizes

## Quick Start

### Full Isolated Suite
```bash
# Run comprehensive memory profiling across all major endpoints
yarn memory-profile

# Profile against a different Sidecar instance
yarn memory-profile http://localhost:8081
```

### Custom Endpoint Testing
```bash
# Test all custom endpoint categories
yarn memory-profile:custom

# Test specific endpoint categories
yarn memory-profile:blocks
yarn memory-profile:accounts
yarn memory-profile:pallets
yarn memory-profile:runtime

# Stress test a specific endpoint
yarn memory-profile:stress /blocks/head "?range=10" 50
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn memory-profile` | Run full isolated memory profiling suite |
| `yarn memory-profile:custom` | Run all custom endpoint tests |
| `yarn memory-profile:blocks` | Deep dive into block-related endpoints |
| `yarn memory-profile:accounts` | Test account endpoints with different addresses |
| `yarn memory-profile:pallets` | Test pallet storage endpoints |
| `yarn memory-profile:runtime` | Test runtime endpoints across versions |
| `yarn memory-profile:stress` | Stress test specific endpoints |

## Output Files

All profiling results are saved to the `./memory-profiles/` directory:

- **`isolated-memory-report-{timestamp}.json`** - Comprehensive report with all analyses
- **`{endpoint}-{timestamp}.csv`** - Individual CSV files for each endpoint tested
- Raw data for further analysis and visualization

## Understanding Results

### Memory Analysis
- **Average Delta**: Mean memory increase per request
- **Max Delta**: Largest memory spike observed
- **Total Growth**: Cumulative memory growth across all tests
- **Leak Suspicion**: Percentage indicating potential memory leak (0-100%)

### Leak Suspicion Indicators
- ✅ **0-40%**: Normal memory usage
- ⚠️ **40-60%**: Watch for patterns
- ⚠️ **60-80%**: Potential concern
- 🚨 **80-100%**: High leak suspicion

### Performance Metrics
- **Response Time**: API response latency
- **Response Size**: Data payload size
- **Memory Efficiency**: Memory usage relative to response size

## Test Categories

### Isolated Suite Tests
1. **Head Block Ranges** - Tests `/blocks/head` with different `range` parameters
2. **Historical Blocks** - Tests specific block numbers across blockchain history
3. **Block Ranges** - Tests block ranges starting from different points
4. **Extrinsics** - Tests block extrinsics with various ranges
5. **Runtime Metadata** - Tests metadata at different block heights
6. **Account Balance** - Tests account balance across different heights
7. **Account Staking** - Tests staking info at various points
8. **Pallet Storage** - Tests system and staking storage
9. **Runtime Spec** - Tests runtime specifications across versions

### Custom Tests
1. **Block Range Scaling** - How memory scales with range size
2. **Historical Block Analysis** - Memory patterns across blockchain history
3. **Account Variations** - Different account types and addresses
4. **Pallet Storage Deep Dive** - All major pallet storage endpoints
5. **Runtime Version Testing** - Metadata and specs across runtime upgrades

## Usage Examples

### Basic Profiling
```bash
# Profile local development server
yarn memory-profile

# Profile production server
yarn memory-profile https://polkadot-sidecar.example.com
```

### Targeted Testing
```bash
# Focus on block-related memory usage
yarn memory-profile:blocks

# Test account endpoints with different parameters
yarn memory-profile:accounts

# Stress test the heaviest endpoint
yarn memory-profile:stress /pallets/staking/storage "" 100
```

### Custom Analysis
```bash
# Build and run custom profiler directly
yarn build:scripts
node --expose-gc scripts/build/memory-profiler/customEndpointProfiler.js stress /blocks/head "?range=50" 25
```

## Configuration

### Environment Variables
The profiler respects the same environment variables as Sidecar itself when testing against local instances.

### Customizing Tests
Modify the test configurations in:
- `IsolatedMemoryProfiler.ts` - Main test suite
- `customEndpointProfiler.ts` - Specialized tests

### Adding New Test Categories
```typescript
// Example: Add new test category
async testNewEndpoints() {
    await this.profiler.testIsolatedEndpoint({
        endpoint: '/new/endpoint',
        variations: ['', '?param=value'],
        iterations: 5,
        description: 'Description of what this tests'
    });
}
```

## Advanced Usage

### Heap Snapshots
For even deeper analysis, the profiler can be extended to take V8 heap snapshots:

```bash
# Enable heap snapshot collection (requires modification)
node --expose-gc --inspect scripts/build/memory-profiler/runIsolatedMemoryProfiler.js
```

### Integration with Monitoring
The profiler output can be integrated with monitoring systems:

```bash
# Example: Send results to monitoring endpoint
yarn memory-profile | jq '.summary' | curl -X POST -d @- https://monitoring.example.com/api/metrics
```

## Troubleshooting

### Common Issues

**GC Not Available**
```
Warning: GC Available: No (run with --expose-gc for better results)
```
Solution: The scripts automatically include `--expose-gc` flag

**Connection Refused**
```
Error: fetch failed - connection refused
```
Solution: Ensure Sidecar is running on the specified URL

**Memory Profiling Too Slow**
Solution: Reduce iterations or test fewer variations in the configuration

### Performance Tips

1. **Run with GC**: Always use `--expose-gc` for accurate results
2. **Isolated Environment**: Run on a dedicated machine when possible
3. **Baseline Testing**: Establish baseline performance before changes
4. **Regular Monitoring**: Include memory profiling in CI/CD pipelines

## Contributing

When adding new endpoints or modifying existing ones:

1. Add relevant test cases to the profiler
2. Run memory profiling before and after changes
3. Document any significant memory usage patterns
4. Include profiling results in PR descriptions for major changes

## Files

- `IsolatedMemoryProfiler.ts` - Core profiler class
- `runIsolatedMemoryProfiler.ts` - CLI for full suite
- `customEndpointProfiler.ts` - Specialized testing scenarios
- `README.md` - This documentation