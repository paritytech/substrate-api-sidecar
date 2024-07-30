import express from 'express';
import { Application, Request, Response } from 'express';
import client from 'prom-client';

import { Log } from '../logging/Log';
import { parseArgs } from '../parseArgs';

export const httpErrorCounter = new client.Counter({
	name: 'sas_http_errors',
	help: 'Number of HTTP Errors',
});

export const httpRouteHistogram = new client.Histogram({
	name: 'sas_https_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [0.1, 0.5, 1, 1.5, 2, 3, 4, 5],
});

export const httpResponseSizeHistogram = new client.Histogram({
	name: 'sas_http_response_size_bytes',
	help: 'Size of HTTP responses in bytes',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000],
});

export const httpResponseSizeLatencyRatio = new client.Histogram({
	name: 'sas_http_response_size_latency_ratio',
	help: 'Ratio of response size to latency',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144],
});

interface IAppConfiguration {
	port: number;
	host: string;
}

export default class Metrics_App {
	private app: Application;
	private registry: client.Registry;
	private includeQueryParams: boolean;
	private readonly port: number;
	private readonly host: string;

	/**
	 * @param appConfig configuration for app.
	 */
	constructor({ host }: IAppConfiguration) {
		const args = parseArgs();

		this.includeQueryParams = Boolean(args.prometheus_queryparams);
		this.port = Number(args.prometheus_port);
		this.app = express();
		this.host = host;
		this.registry = new client.Registry();

		this.metricsEndpoint();
	}

	listen(): void {
		const { logger } = Log;
		this.app.listen(this.port, this.host, () => {
			logger.info(`Metrics Server started at http://${this.host}:${this.port}/metrics`);
		});
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

	middleware() {
		return (req: Request, res: Response, next: () => void) => {
			const responseTimer = httpRouteHistogram.startTimer();
			res.once('finish', () => {
				let resContentLength = '0';
				if ('_contentLength' in res && res['_contentLength'] != null) {
					resContentLength = res['_contentLength'] as string;
				} else {
					// Try header
					if (res.hasHeader('Content-Length')) {
						resContentLength = res.getHeader('Content-Length') as string;
					}
				}

				// measures the response size
				httpResponseSizeHistogram
					.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
					.observe(parseFloat(resContentLength));

				// measures the response time
				responseTimer({ method: req.method, route: this.getRoute(req), status_code: res.statusCode });

				// measures the ratio of response size to latency
				httpResponseSizeLatencyRatio
					.labels({ method: req.method, route: this.getRoute(req), status_code: res.statusCode })
					.observe(parseFloat(resContentLength) / responseTimer());
			});
			next();
		};
	}

	private metricsEndpoint() {
		this.registry.registerMetric(httpErrorCounter);
		this.registry.registerMetric(httpRouteHistogram);
		this.registry.registerMetric(httpResponseSizeHistogram);
		this.registry.registerMetric(httpResponseSizeLatencyRatio);

		client.collectDefaultMetrics({ ...this.registry, prefix: 'sas_' });
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
