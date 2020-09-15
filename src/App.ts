import * as express from 'express';
import {
	Application,
	ErrorRequestHandler,
	Request,
	RequestHandler,
	Response,
} from 'express';

import * as packageJson from '../package.json';
import AbstractController from './controllers/AbstractController';
import { AbstractService } from './services/AbstractService';
import { IRegisteredRoutes, IRouteInfo } from './types/util';

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
		this.initControllers(controllers);
		this.initRoot();
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

	/**
	 * Mount the root route.
	 */
	private initRoot() {
		// Set up a root route
		this.app.get('/', (_req: Request, res: Response) =>
			res.send({
				docs: 'https://paritytech.github.io/substrate-api-sidecar/dist',
				github: 'https://github.com/paritytech/substrate-api-sidecar',
				version: packageJson.version,
				listen: `${this.host}:${this.port}`,
				routes: this.getRoutes(),
			})
		);
	}

	/**
	 * Get the routes currently mounted on the Express App. N.B. this uses
	 * a private property (`_router`) on the Express App, so it should be
	 * checked that this works as expected whenever updating Express dependencies.
	 */
	private getRoutes() {
		return (this.app._router as IRegisteredRoutes).stack.reduce(
			(acc, middleware) => {
				if (middleware.route) {
					// This middleware is a route mounted directly on the app (i.e. app.get('/test', fn)
					acc.push(this.extractPathAndMethod(middleware.route));
				} else if (middleware.name === 'router') {
					// This middleware is an express.Router (i.e. app.use('/', express.Router()))
					middleware.handle?.stack.forEach(({ route }) => {
						if (route) {
							acc.push(this.extractPathAndMethod(route));
						}
					});
				}

				return acc;
			},
			[] as { path: string; method: string }[]
		);
	}

	/**
	 * Helper function for `getRoutes`.
	 */
	private extractPathAndMethod({ path, methods }: IRouteInfo) {
		return {
			path,
			method: Object.keys(methods)[0],
		};
	}
}
