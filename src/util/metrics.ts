import express from 'express';
import { Application, Request, Response } from 'express';
import client from 'prom-client';

import { Log } from '../logging/Log';
import { parseArgs } from '../parseArgs';

interface IAppConfiguration {
	port: number;
	host: string;
}

interface IMetric {
	name: string;
	help: string;
	type: MetricType;
	buckets?: number[];
	labels?: string[];
}

export const enum MetricType {
	Counter = 'counter',
	Gauge = 'gauge',
	Histogram = 'histogram',
	Summary = 'summary',
}

const metrics: IMetric[] = [
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

type Body = {
	extrinsics?: Record<string, unknown>[];
	[key: string]: unknown;
};

interface Query extends Request {
	route: {
		path: string;
		[key: string]: unknown;
	};
}

export default class Metrics_App {
	private app: Application;
	private registry: client.Registry;
	private metrics: Record<string, client.Metric>;
	private includeQueryParams: boolean;
	private readonly port: number;
	private readonly host: string;

	/**
	 * @param appConfig configuration for app.
	 */
	constructor({ host }: IAppConfiguration) {
		const args = parseArgs();

		this.includeQueryParams = !!args.prometheus_queryparams;
		this.port = Number(args.prometheus_port);
		this.app = express();
		this.host = host;
		this.registry = new client.Registry();
		this.metrics = {};
		this.init();
	}

	listen(): void {
		const { logger } = Log;
		this.app.listen(this.port, this.host, () => {
			logger.info(`Metrics Server started at http://${this.host}:${this.port}/metrics`);
		});
	}

	private createMetricByType(prefix = 'sas', metric: IMetric) {
		const prefixedName = prefix + '_' + metric.name;
		if (prefixedName in this.metrics) {
			return this.metrics[prefixedName];
		}

		switch (metric.type) {
			case MetricType.Counter: {
				const counter = new client.Counter({
					name: prefixedName,
					help: metric.help,
					labelNames: metric.labels || [],
					registers: [this.registry],
				});

				this.registry.registerMetric(counter);
				this.metrics[prefixedName] = counter;
				return counter;
			}
			case MetricType.Histogram: {
				const histogram = new client.Histogram({
					name: prefixedName,
					help: metric.help,
					labelNames: metric.labels || [],
					registers: [this.registry],
					buckets: metric.buckets || [0.1, 0.5, 1, 1.5, 2, 3, 4, 5],
				});

				this.metrics[prefixedName] = histogram;
				return histogram;
			}
			case MetricType.Gauge:
				throw new Error('Gauge not implemented');
			case MetricType.Summary:
				throw new Error('Summary not implemented');
			default:
				throw new Error('Unknown metric type');
		}
	}

	private getRoute(req: Query) {
		let route = req.baseUrl;
		if (req.route) {
			if (req.route.path !== '/') {
				route = route ? route + req.route?.path : req.route?.path;
			}

			if (!route || route === '' || typeof route !== 'string') {
				route = req.originalUrl.split('?')[0];
			} else {
				const splittedRoute = route.split('/');
				const splittedUrl = req.originalUrl.split('?')[0].split('/');
				const routeIndex = splittedUrl.length - splittedRoute.length + 1;

				const baseUrl = splittedUrl.slice(0, routeIndex).join('/');
				route = baseUrl + route;
			}

			if (this.includeQueryParams === true && Object.keys(req.query).length > 0) {
				route = `${route}?${Object.keys(req.query)
					.sort()
					.map((queryParam) => `${queryParam}=<?>`)
					.join('&')}`;
			}
		}

		if (typeof req.params === 'object') {
			Object.keys(req.params).forEach((paramName) => {
				route = route.replace(req.params[paramName], ':' + paramName);
			});
		}

		if (!route || route === '') {
			// if (!req.route && res && res.statusCode === 404) {
			route = 'N/A';
		}

		return route;
	}

	private blocksControllerMetrics(req: Query, res: Response, end: () => number) {
		const body = res.locals.body as Body | Body[];

		if (req.params?.number && !Array.isArray(body)) {
			const extrinscs = body.extrinsics ? body.extrinsics.length : 0;

			const extrinsics_per_second = this.metrics['sas_extrinsics_per_second'] as client.Histogram;
			const seconds = end();

			extrinsics_per_second
				.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
				.observe(extrinscs / seconds);

			const extrinsics_per_block = this.metrics['sas_extrinsics_per_block'] as client.Histogram;

			const blocks = 1;
			extrinsics_per_block
				.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
				.observe(extrinscs / blocks);

			const seconds_per_block = this.metrics['sas_seconds_per_block'] as client.Histogram;
			seconds_per_block
				.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
				.observe(seconds / blocks);
		}

		if (req.query?.range) {
			let totExtrinsics = 0;
			if (Array.isArray(body)) {
				totExtrinsics = body.reduce((current: number, block: { [x: string]: unknown }) => {
					const extrinsics = block['extrinsics'];

					if (Array.isArray(extrinsics)) {
						return current + extrinsics.length;
					}

					return current;
				}, 0);
			} else {
				const extrinsics = body['extrinsics'];
				if (Array.isArray(extrinsics)) {
					totExtrinsics = extrinsics.length;
				}
			}

			const extrinsics_in_request = this.metrics['sas_extrinsics_in_request'] as client.Histogram;
			extrinsics_in_request
				.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
				.observe(totExtrinsics);

			const extrinsics_per_second = this.metrics['sas_extrinsics_per_second'] as client.Histogram;
			const seconds = end();
			extrinsics_per_second
				.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
				.observe(totExtrinsics / seconds);

			const extrinsics_per_block = this.metrics['sas_extrinsics_per_block'] as client.Histogram;
			const blocks = Array.isArray(body) ? body.length : 1;
			extrinsics_per_block
				.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
				.observe(totExtrinsics / blocks);

			const seconds_per_block = this.metrics['sas_seconds_per_block'] as client.Histogram;
			seconds_per_block
				.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
				.observe(seconds / blocks);
		}
	}

	preMiddleware() {
		return (req: Query, res: Response, next: () => void) => {
			const tot_requests = this.metrics['sas_total_requests'] as client.Counter;

			// request count metrics
			if (req.originalUrl != '/favicon.ico') {
				tot_requests.inc();
			}
			const request_duration_seconds = this.metrics['sas_request_duration_seconds'] as client.Histogram;
			const end = request_duration_seconds.startTimer();

			const oldJson = res.json;
			res.json = (body: Body) => {
				res.locals.body = body;
				return oldJson.call(res, body);
			};

			res.once('finish', () => {
				if (res.statusCode >= 400 && req.originalUrl != '/favicon.ico') {
					const request_errors = this.metrics['sas_request_errors'] as client.Counter;
					request_errors.inc();
				} else if (res.statusCode < 400) {
					const request_success = this.metrics['sas_request_success'] as client.Counter;
					request_success.inc();
				}

				let resContentLength = '0';
				if ('_contentLength' in res && res['_contentLength'] != null) {
					resContentLength = res['_contentLength'] as string;
				} else if (res.hasHeader('Content-Length')) {
					resContentLength = res.getHeader('Content-Length') as string;
				}

				// route specific metrics
				if (this.getRoute(req).includes('blocks')) {
					this.blocksControllerMetrics(req, res, end);
				}

				// response size metrics
				const response_size_bytes = this.metrics['sas_response_size_bytes'] as client.Histogram;
				response_size_bytes
					.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
					.observe(parseFloat(resContentLength));
				// latency metrics
				const latency = end({ method: req.method, route: this.getRoute(req), status_code: res.statusCode });

				// response size to latency ratio
				const response_size_latency_ratio = this.metrics['sas_response_size_latency_ratio'] as client.Histogram;
				response_size_latency_ratio
					.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
					.observe(parseFloat(resContentLength) / latency);
			});
			next();
		};
	}

	private init() {
		// Set up
		metrics.forEach((metric) => this.createMetricByType('sas', metric));

		client.collectDefaultMetrics({ register: this.registry, prefix: 'sas_' });

		// Set up the metrics endpoint
		this.app.get('/metrics', (_req: Request, res: Response) => {
			void (async () => {
				res.set('Content-Type', this.registry.contentType);
				res.send(await this.registry.metrics());
			})();
		});
		this.app.get('/metrics.json', (_req: Request, res: Response) => {
			void (async () => {
				res.set('Content-Type', this.registry.contentType);
				res.send(await this.registry.getMetricsAsJSON());
			})();
		});
	}
}
