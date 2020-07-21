import * as express from 'express';
import {
	Application,
	ErrorRequestHandler,
	Request,
	RequestHandler,
	Response,
} from 'express';

import AbstractController from './controllers/AbstractController';
import { AbstractService } from './services/AbstractService';

interface IAppConfiguration {
	controllers: AbstractController<AbstractService>[];
	preMiddleware: RequestHandler[];
	postMiddleware: ErrorRequestHandler[];
	port: number;
	host: string;
}

export default class App {
	private app: Application;
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
	}: IAppConfiguration) {
		this.app = express();
		this.port = port;
		this.host = host;

		this.initMiddleware(preMiddleware);

		// Set up a root route
		this.app.get('/', (_req: Request, res: Response) =>
			res.send(
				'Sidecar is running, go to /block to get latest finalized block'
			)
		);

		this.initControllers(controllers);
		this.initErrorMiddleware(postMiddleware);
	}

	/**
	 * Mount middleware prior to mounting routes.
	 *
	 * @param middleware array of Middleware to mount prior to all controllers.
	 */
	private initMiddleware(middleware: RequestHandler[]): void {
		for (const ware of middleware) {
			this.app.use(ware);
		}
	}

	/**
	 * Mount the router from each each controller.
	 *
	 * @param controllers array of Controllers
	 */
	private initControllers(
		controllers: AbstractController<AbstractService>[]
	): void {
		for (const c of controllers) {
			this.app.use('/', c.router);
		}
	}

	/**
	 * Mount middleware after after mounting the routes.
	 *
	 * @param errorMiddleware array of middleware to mount last.
	 */
	private initErrorMiddleware(errorMiddleware: ErrorRequestHandler[]): void {
		for (const ware of errorMiddleware) {
			this.app.use(ware);
		}
	}

	listen(): void {
		this.app.listen(this.port, this.host, () => {
			console.log(`Listening on http://${this.host}:${this.port}/`);
		});
	}
}
