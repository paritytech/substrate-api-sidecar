import express from 'express';
import { Application, Request, Response } from 'express';
import client from 'prom-client';

import { Log } from '../logging/Log';
import { parseArgs } from '../parseArgs';

// TODO: cleanup code regarding route specific metrics (possibly implement a more generic solution)

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
		name: 'request_errors',
		help: 'Number of HTTP Errors',
		type: MetricType.Counter,
	},
	{
		name: 'request_success',
		help: 'Number of HTTP Success',
		type: MetricType.Counter,
	},
	{
		name: 'total_requests',
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
		name: 'response_size_bytes',
		help: 'Size of HTTP responses in bytes',
		labels: ['method', 'route', 'status_code'],
		buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000],
		type: MetricType.Histogram,
	},
	{
		name: 'response_size_latency_ratio',
		help: 'Ratio of response size to latency',
		labels: ['method', 'route', 'status_code'],
		buckets: [64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144],
		type: MetricType.Histogram,
	},
	{
		name: 'extrinsics_in_request',
		help: 'Number of extrinsics in a request',
		type: MetricType.Histogram,
		buckets: [5, 10, 20, 40, 80, 160, 320, 640, 1280, 2560, 5120, 10240, 20480],
		labels: ['method', 'route', 'status_code'],
	},
	{
		name: 'extrinsics_per_second',
		help: 'Number of extrinsics per second',
		type: MetricType.Histogram,
		labels: ['method', 'route', 'status_code'],
		buckets: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
	},
	{
		name: 'extrinsics_per_block',
		help: 'Average number of extrinsics per block',
		type: MetricType.Histogram,
		labels: ['method', 'route', 'status_code'],
		buckets: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
	},
	{
		name: 'seconds_per_block',
		help: 'Average seconds per block',
		type: MetricType.Histogram,
		labels: ['method', 'route', 'status_code'],
		buckets: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024],
	},
];

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

	private getRoute(req: Request) {
		let route = req.baseUrl;
		if (req.route) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			if (req.route?.path !== '/') {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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

	preMiddleware() {
		return (req: Request, res: Response, next: () => void) => {
			const tot_requests = this.metrics['sas_total_requests'] as client.Counter;

			// request count metrics
			tot_requests.inc();
			const request_duration_seconds = this.metrics['sas_request_duration_seconds'] as client.Histogram;
			const end = request_duration_seconds.startTimer();

			const oldJson = res.json;
			res.json = (body) => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				res.locals.body = body;
				return oldJson.call(res, body);
			};

			res.once('finish', () => {
				if (res.statusCode >= 400) {
					const request_errors = this.metrics['sas_request_errors'] as client.Counter;
					request_errors.inc();
				} else {
					const request_success = this.metrics['sas_request_success'] as client.Counter;
					request_success.inc();
				}

				let resContentLength = '0';
				if ('_contentLength' in res && res['_contentLength'] != null) {
					resContentLength = res['_contentLength'] as string;
				} else {
					if (res.hasHeader('Content-Length')) {
						resContentLength = res.getHeader('Content-Length') as string;
					}
				}
				// route specific metrics
				// ------ blocks -------

				// blocks/:id
				if (this.getRoute(req).includes('blocks') && req.params?.number) {
					const response_size_bytes = this.metrics['sas_extrinsics_per_request'] as client.Histogram;
					response_size_bytes
						.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
						// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
						.observe(res.locals.body['extrinsics'] ? res.locals.body['extrinsics'].length || 0 : 0);

					const extrinsics_per_second = this.metrics['sas_extrinsics_per_second'] as client.Histogram;
					const seconds = end();
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
					const extrinscs = res.locals.body['extrinsics'] ? res.locals.body['extrinsics'].length || 0 : 0;
					extrinsics_per_second
						.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
						.observe(extrinscs / seconds);

					const extrinsics_per_block = this.metrics['sas_extrinsics_per_block'] as client.Histogram;
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const blocks = 1;
					extrinsics_per_block
						.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
						.observe(extrinscs / blocks);

					const seconds_per_block = this.metrics['sas_seconds_per_block'] as client.Histogram;
					seconds_per_block
						.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
						.observe(seconds / blocks);
				}

				// blocks?range
				if (this.getRoute(req).includes('blocks') && req.query?.range) {
					let totExtrinsics = 0;
					if (Array.isArray(res.locals.body)) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
						totExtrinsics = res.locals.body.reduce((current: number, block: { [x: string]: unknown }) => {
							const extrinsics = block['extrinsics'];

							if (Array.isArray(extrinsics)) {
								return current + extrinsics.length;
							}

							return current;
						}, 0);
					} else {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
						const extrinsics = res.locals.body['extrinsics'];
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
					// // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					// console.log({ totExtrinsics });
					extrinsics_per_second
						.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
						.observe(totExtrinsics / seconds);

					const extrinsics_per_block = this.metrics['sas_extrinsics_per_block'] as client.Histogram;
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const blocks = Array.isArray(res.locals.body) ? res.locals.body.length : 1;
					extrinsics_per_block
						.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
						.observe(totExtrinsics / blocks);

					const seconds_per_block = this.metrics['sas_seconds_per_block'] as client.Histogram;
					seconds_per_block
						.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
						.observe(seconds / blocks);
				}

				// response size metrics
				const response_size_bytes = this.metrics['sas_response_size_bytes'] as client.Histogram;
				response_size_bytes
					.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
					.observe(parseFloat(resContentLength));
				// latency metrics
				end({ method: req.method, route: this.getRoute(req), status_code: res.statusCode });

				// response size to latency ratio
				const response_size_latency_ratio = this.metrics['sas_response_size_latency_ratio'] as client.Histogram;
				response_size_latency_ratio
					.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
					.observe(parseFloat(resContentLength) / end());
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
