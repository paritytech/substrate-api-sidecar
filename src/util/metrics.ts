import express from 'express';
import { Application, Request, Response } from 'express';
import client from 'prom-client';

import { Log } from '../logging/Log';
import { parseArgs } from '../parseArgs';

export const httpErrorCounter = new client.Counter({
	name: 'sas_http_errors',
	help: 'Number of HTTP Errors',
});

interface IAppConfiguration {
	port: number;
	host: string;
}

export default class Metrics_App {
	private app: Application;
	private readonly port: number;
	private readonly host: string;

	/**
	 * @param appConfig configuration for app.
	 */
	constructor({ host }: IAppConfiguration) {
		const args = parseArgs();

		this.port = Number(args.prometheus_port);
		this.app = express();
		this.host = host;

		this.metricsEndpoint();
	}

	listen(): void {
		const { logger } = Log;
		this.app.listen(this.port, this.host, () => {
			logger.info(`Metrics Server started at http://${this.host}:${this.port}/`);
		});
	}

	/**
	 * Mount the metrics endpoint.
	 */
	private metricsEndpoint() {
		const register = new client.Registry();
		register.registerMetric(httpErrorCounter);
		client.collectDefaultMetrics({ register, prefix: 'sas_' });
		// Set up the metrics endpoint
		this.app.get('/metrics', (_req: Request, res: Response) => {
			void (async () => {
				res.set('Content-Type', register.contentType);
				res.send(await register.metrics());
			})();
		});
	}
}
