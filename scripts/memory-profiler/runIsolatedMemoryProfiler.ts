// Copyright 2017-2025 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { IsolatedMemoryProfiler } from './IsolatedMemoryProfiler';

// CLI interface
async function main() {
	const args = process.argv.slice(2);
	const baseUrl = args[0] || 'http://localhost:8080';

	// Parse optional config arguments
	const coolOffPeriod = args.includes('--fast') ? 1000 : args.includes('--slow') ? 10000 : 5000;
	const iterationCoolOff = args.includes('--fast') ? 100 : args.includes('--slow') ? 500 : 300;
	const variationCoolOff = args.includes('--fast') ? 500 : args.includes('--slow') ? 3000 : 1500;

	console.log(`🔬 Isolated Memory Profiler`);
	console.log(`Target: ${baseUrl}`);
	console.log(`GC Available: ${!!global.gc ? 'Yes ✅' : 'No (run with --expose-gc for better results)'}`);
	console.log(`Cool-off Configuration: ${args.includes('--fast') ? 'Fast' : args.includes('--slow') ? 'Slow' : 'Default'}`);
	console.log(`  - Endpoint cool-off: ${coolOffPeriod}ms`);
	console.log(`  - Variation cool-off: ${variationCoolOff}ms`);
	console.log(`  - Iteration cool-off: ${iterationCoolOff}ms`);

	if (!global.gc) {
		console.log('⚠️  For more accurate results, run with: --expose-gc flag');
		console.log('   Example: node --expose-gc scripts/build/memory-profiler/runIsolatedMemoryProfiler.js');
	}

	console.log('\n📝 Usage: yarn memory-profile [url] [--fast|--slow]');
	console.log('  --fast: Reduced cool-off periods for quicker testing');
	console.log('  --slow: Extended cool-off periods for more thorough GC analysis');

	const profiler = new IsolatedMemoryProfiler({
		baseUrl,
		coolOffPeriod,
		iterationCoolOff,
		variationCoolOff,
		enableGCAnalysis: !!global.gc
	});

	await profiler.runIsolatedSuite();
}

if (require.main === module) {
	main().catch(console.error);
}