import * as express from 'express';
import { Request, Response } from 'express';

import BaseController from './controllers/AbstractController';
import { Middleware } from './types/middleware_types';

interface AppConfiguration {
	controllers: BaseController[];
	preMiddleware: Middleware[];
	postMiddleware: Middleware[];
	port: number;
	host: string;
}

export default class App {
	private app: express.Application;
	private readonly port: number;
	private readonly host: string;

	constructor({
		controllers,
		preMiddleware,
		postMiddleware,
		host,
		port,
	}: AppConfiguration) {
		this.app = express();
		this.port = port;
		this.host = host;

		this.initPreMiddleware(preMiddleware);

		// Setup an index route
		this.app.get(
			'/',
			// eslint-disable-next-line @typescript-eslint/require-await
			async (_req: Request, res: Response) =>
				res.send(
					'Sidecar is running, go to /block to get latest finalized block'
				)
		);

		this.initControllers(controllers);
		this.initPostMiddleware(postMiddleware);
	}

	private initPreMiddleware(preMiddleware: Middleware[]): void {
		for (const middleware of preMiddleware) {
			this.app.use(middleware);
		}
	}

	private initControllers(controllers: BaseController[]): void {
		for (const c of controllers) {
			this.app.use('/', c.router);
		}
	}

	private initPostMiddleware(postMiddleware: Middleware[]): void {
		for (const middleware of postMiddleware) {
			this.app.use(middleware);
		}
	}

	listen(): void {
		this.app.listen(this.port, this.host, () => {
			console.log(`Listening on http://${this.host}:${this.port}/`);
		});
	}
}
