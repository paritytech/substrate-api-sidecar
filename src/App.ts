// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Substrate API Sidecar.
//
// Substrate API Sidecar is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import express from 'express';
import { Application, ErrorRequestHandler, Request, RequestHandler, Response } from 'express';
import { Server } from 'http';

import packageJson from '../package.json';
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
	constructor({ controllers, preMiddleware, postMiddleware, host, port }: IAppConfiguration) {
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
	private initControllers(controllers: AbstractController<AbstractService>[]): void {
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

	listen(): Server {
		return this.app.listen(this.port, this.host, () => {
			console.log(`Listening on http://${this.host}:${this.port}/`);
			console.log(
				`Check the root endpoint (http://${this.host}:${this.port}/) to see the available endpoints for the current node`,
			);
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
			}),
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
			[] as { path: string; method: string }[],
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
