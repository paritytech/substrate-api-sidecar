import { Console } from 'console';
import * as fs from 'fs';

export function fileLog(filePath: string): (...data: unknown[]) => void {
	const output = fs.createWriteStream(filePath, { flags: 'a' });

	const consoleFile = new Console({ stdout: output, stderr: output });
	const consoleDev = new Console({
		stdout: process.stdout,
		stderr: process.stderr,
	});

	return function consoleCombine(...data: unknown[]): void {
		consoleFile.log(...data);

		if (
			data.every(
				(d) => !(typeof d === 'string') || !d.includes('API-WS:')
			)
		) {
			// Only log to console if it is not RPC info
			consoleDev.log(...data);
		}
	};
}
