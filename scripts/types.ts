import { ChildProcessWithoutNullStreams } from 'child_process';

export type ProcsType = { [key: string]: ChildProcessWithoutNullStreams };

export enum StatusCode {
	Success = '0',
	Failed = '1',
}

export interface IChainConfig {
	wsUrl: string;
	JestProcOpts: IProcOpts;
	SasStartOpts: IProcOpts;
}

// Process options
export interface IProcOpts {
	proc: string;
	resolver: string;
	resolverStartupErr?: string;
	args: string[];
}
