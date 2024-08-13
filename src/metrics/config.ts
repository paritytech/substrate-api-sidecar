// as new metrics are added in routes they need to be registered here to make them available across the apps

import { IMetric, MetricType } from '../types/metrics';

export const metric_list: IMetric[] = [
	{
		name: 'request_errors_total',
		help: 'Number of HTTP Errors',
		type: MetricType.Counter,
	},
	{
		name: 'request_success_total',
		help: 'Number of HTTP Success',
		type: MetricType.Counter,
	},
	{
		name: 'requests_total',
		help: 'Total number of HTTP Requests',
		type: MetricType.Counter,
	},
	{
		name: 'request_duration_seconds',
		help: 'Duration of HTTP requests in seconds',
		labels: ['method', 'route', 'status_code'],
		buckets: [0.1, 0.5, 1, 1.5, 2, 3, 4, 5],
		type: MetricType.Histogram,
	},
	{
		name: 'response_size_bytes_seconds',
		help: 'Size of HTTP responses in bytes',
		labels: ['method', 'route', 'status_code'],
		buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000],
		type: MetricType.Histogram,
	},
	{
		name: 'response_size_latency_ratio_seconds',
		help: 'Ratio of response size to latency',
		labels: ['method', 'route', 'status_code'],
		buckets: [64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144],
		type: MetricType.Histogram,
	},
	{
		name: 'extrinsics_in_request_count',
		help: 'Number of extrinsics in a request',
		type: MetricType.Histogram,
		buckets: [5, 10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240, 20480],
		labels: ['method', 'route', 'status_code'],
	},
	{
		name: 'extrinsics_per_second_count',
		help: 'Number of extrinsics per second',
		type: MetricType.Histogram,
		labels: ['method', 'route', 'status_code'],
		buckets: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
	},
	{
		name: 'extrinsics_per_block_count',
		help: 'Average number of extrinsics per block',
		type: MetricType.Histogram,
		labels: ['method', 'route', 'status_code'],
		buckets: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
	},
	{
		name: 'seconds_per_block_count',
		help: 'Average seconds per block',
		type: MetricType.Histogram,
		labels: ['method', 'route', 'status_code'],
		buckets: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
	},
];
