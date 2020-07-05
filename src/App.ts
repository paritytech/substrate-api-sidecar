import * as express from 'express';
import {
	ErrorRequestHandler,
	Request,
	RequestHandler,
	Response,
} from 'express';

import BaseController from './controllers/AbstractController';

interface AppConfiguration {
	controllers: BaseController[];
	preMiddleware: RequestHandler[];
	postMiddleware: ErrorRequestHandler[];
	port: number;
	host: string;
}

export default class App {
	private app: express.Application;
	private readonly port: number;
	private readonly host: string;

	/**
	 * @param appConfig configuration for app.
	 */
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

		// Setup a root route
		this.app.get('/', (_req: Request, res: Response) =>
			res.send(
				'Sidecar is running, go to /block to get latest finalized block'
			)
		);

		this.initControllers(controllers);
		this.initPostMiddleware(postMiddleware);
	}

	/**
	 * Mount middleware prior to mounting routes.
	 *
	 * @param preMiddleware Array of Middleware to mount prior to all controllers.
	 */
	private initPreMiddleware(preMiddleware: RequestHandler[]): void {
		for (const middleware of preMiddleware) {
			this.app.use(middleware);
		}
	}

	/**
	 * Mount the router from each each controller.
	 *
	 * @param controllers Array of AbstractController instances
	 */
	private initControllers(controllers: BaseController[]): void {
		for (const c of controllers) {
			this.app.use('/', c.router);
		}
	}

	/**
	 * Mount middleware after after mounting the routes.
	 *
	 * @param postMiddleware Array of middleware to mount last.
	 */
	private initPostMiddleware(postMiddleware: ErrorRequestHandler[]): void {
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
