# Fix for Sidecar OOM Regression (v19.0.2 → v19.3.1)

## Problem Summary
Between v19.0.2 and v19.3.1, sidecar introduced a memory leak that causes OOM after ~20 hours of operation due to:
1. Controller-level caching without proper cleanup
2. Polkadot.js cache capacity set to 0 (disables LRU eviction)
3. Cache key explosion creating 64x memory usage per block

## Implementation Steps

### Step 1: Immediate Fix (Emergency Patch)
**File**: `src/apiRegistry/index.ts`

```typescript
// CHANGE Lines 51-52:
? new HttpProvider(url, undefined, CACHE_CAPACITY || 0)
: new WsProvider(url, undefined, undefined, undefined, CACHE_CAPACITY || 0),

// TO:
? new HttpProvider(url, undefined, CACHE_CAPACITY || 1000)
: new WsProvider(url, undefined, undefined, undefined, CACHE_CAPACITY || 1000),
```

**Impact**: Restores polkadot.js LRU eviction, should provide immediate relief.

### Step 2: Implement Proper Controller Cache Management

#### A. Create Base Cache Controller
**File**: `src/controllers/CacheBaseController.ts`
- Copy content from `cache-base-controller.ts`
- Provides standardized cache management across all controllers

#### B. Update BlocksController
**File**: `src/controllers/blocks/BlocksController.ts`

Key changes:
1. **Proper LRU Configuration**:
```typescript
private blockStore: LRUCache<string, CacheEntry>;

private initCache(): void {
  this.blockStore = new LRUCache<string, CacheEntry>({
    max: 500,
    ttl: 5 * 60 * 1000, // 5 minutes
    updateAgeOnGet: true,
    dispose: (value, key, reason) => {
      // Cleanup disposed entries
      if (value.block.extrinsics) {
        value.block.extrinsics.length = 0;
      }
    }
  });
}
```

2. **Optimized Cache Keys**:
```typescript
private generateCacheKey(hash: string, options: CacheOptions): string {
  let key = hash;
  if (options.eventDocs) key += 'E';
  if (options.extrinsicDocs) key += 'X';
  if (options.noFees) key += 'F';
  // ... etc
  return key;
}
```

3. **Periodic Maintenance**:
```typescript
private performCacheMaintenance(): void {
  this.requestCount++;
  
  if (this.requestCount % 1000 === 0) {
    this.blockStore.purgeStale();
    
    // Aggressive cleanup when 80% full
    if (this.blockStore.size >= 400) {
      // Remove 20% of oldest entries
    }
  }
}
```

### Step 3: Update Other Controllers

Apply the same pattern to:
- `BlocksExtrinsicsController`
- `BlocksRawExtrinsicsController` 
- Any other controllers using `blockStore`

### Step 4: Add Monitoring

#### A. Cache Metrics
Add to existing Prometheus metrics:
```typescript
// Cache hit ratio
registry.registerMetric(new client.Gauge({
  name: 'sas_blocks_cache_hit_ratio',
  help: 'Cache hit ratio for blocks endpoint'
}));

// Cache size
registry.registerMetric(new client.Gauge({
  name: 'sas_blocks_cache_size', 
  help: 'Current size of blocks cache'
}));
```

#### B. Debug Endpoint
```typescript
// Add to routes:
['/cache/status', this.getCacheStatus]

private getCacheStatus: RequestHandler = async (_req, res) => {
  res.json({
    cacheStats: this.cacheStats,
    memoryUsage: process.memoryUsage()
  });
};
```

### Step 5: Configuration Updates

#### A. Environment Variables
```bash
# Optional: Override default cache capacity
SAS_SUBSTRATE_CACHE_CAPACITY=1000

# Optional: Override controller cache size
SAS_CONTROLLER_CACHE_SIZE=500
```

#### B. Config Schema
Add cache configuration options to `SidecarConfig.ts`:
```typescript
CONTROLLER_CACHE_SIZE: number;
CONTROLLER_CACHE_TTL_MS: number;
```

## Testing Strategy

### 1. Memory Leak Test
```typescript
describe('Memory Stability', () => {
  it('should maintain stable memory over 1000 requests', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    for (let i = 0; i < 1000; i++) {
      await request(app)
        .get(`/blocks/latest?eventDocs=${i % 2}`)
        .expect(200);
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const growth = finalMemory - initialMemory;
    
    expect(growth).toBeLessThan(50 * 1024 * 1024); // < 50MB
  });
});
```

### 2. Cache Performance Test
```typescript
it('should maintain good cache hit ratio', async () => {
  // Make repeated requests to same block
  for (let i = 0; i < 10; i++) {
    await request(app).get('/blocks/latest');
  }
  
  const status = await request(app).get('/blocks/cache/status');
  expect(status.body.hitRatio).toBeGreaterThan(0.8);
});
```

## Deployment Strategy

### Phase 1: Emergency Fix (1-2 hours)
- Apply cache capacity fix
- Deploy to staging
- Verify memory stability over 24h test

### Phase 2: Controller Fix (1-2 days)
- Implement proper controller caching
- Add monitoring
- Deploy with gradual rollout

### Phase 3: Optimization (1 week)
- Fine-tune cache parameters
- Add advanced monitoring
- Performance optimization

## Expected Results

### Before Fix (v19.3.1)
- Memory grows linearly
- OOM after ~20 hours
- Cache hit ratio: Variable

### After Fix
- Stable memory usage
- No OOM after 48+ hours
- Cache hit ratio: >80%
- Memory usage: <2GB steady state

## Rollback Plan

If issues occur:
1. **Emergency**: Revert `CACHE_CAPACITY || 1000` back to `|| 0`
2. **Full rollback**: Revert to v19.0.2 controller architecture
3. **Monitoring**: Use cache status endpoint to identify issues

## Success Metrics

- [ ] No OOM crashes after 48 hours
- [ ] Memory usage remains stable (<10% growth/day)  
- [ ] Cache hit ratio >75%
- [ ] Response times remain consistent
- [ ] No performance regression vs v19.0.2