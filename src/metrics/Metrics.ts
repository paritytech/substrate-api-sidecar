import express from 'express';
import { Application, Request, Response } from 'express';
import client from 'prom-client';

import { Log } from '../logging/Log';
import { SidecarConfig } from '../SidecarConfig';
import { IMetric, MetricType } from '../types/metrics';
import { config } from '.';

interface IAppConfiguration {
	port: number;
	host: string;
}

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
	constructor({ host, port }: IAppConfiguration) {
		this.includeQueryParams = SidecarConfig.config.METRICS.INCLUDE_QUERYPARAMS;
		this.port = port;
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

	getRegisteredMetrics(): Record<string, client.Metric> {
		return this.metrics;
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

	preMiddleware() {
		return (req: Query, res: Response, next: () => void) => {
			const tot_requests = this.metrics['sas_http_requests'] as client.Counter;

			// request count metrics
			if (req.originalUrl != '/favicon.ico') {
				tot_requests.inc();
			}
			const request_duration_seconds = this.metrics['sas_request_duration_seconds'] as client.Histogram;
			const end = request_duration_seconds.startTimer();

			res.locals.metrics = {
				timer: end,
				registry: this.metrics,
			};

			const oldJson = res.json;
			res.json = (body: Body) => {
				res.locals.body = body;
				return oldJson.call(res, body);
			};

			res.once('finish', () => {
				if (res.statusCode >= 400 && req.originalUrl != '/favicon.ico') {
					const request_errors = this.metrics['sas_http_request_error'] as client.Counter;
					request_errors.inc();
				} else if (res.statusCode < 400) {
					const request_success = this.metrics['sas_http_request_success'] as client.Counter;
					request_success.inc();
				}

				let resContentLength = '0';
				if ('_contentLength' in res && res['_contentLength'] != null) {
					resContentLength = res['_contentLength'] as string;
				} else if (res.hasHeader('Content-Length')) {
					resContentLength = res.getHeader('Content-Length') as string;
				}
				// Generic Metrics per route (latency, response size, response size to latency ratio)
				// response size metrics
				const response_size_bytes = this.metrics['sas_response_size_bytes'] as client.Histogram;
				response_size_bytes
					.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
					.observe(parseFloat(resContentLength));

				// latency metrics
				const latency = end({ method: req.method, route: this.getRoute(req), status_code: res.statusCode });

				// response size to latency ratio
				const response_size_latency_ratio = this.metrics['sas_response_size_bytes_seconds'] as client.Histogram;
				response_size_latency_ratio
					.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
					.observe(parseFloat(resContentLength) / latency);
			});

			next();
		};
	}

	private init() {
		// Set up
		config.metric_list.forEach((metric) => this.createMetricByType('sas', metric));

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
