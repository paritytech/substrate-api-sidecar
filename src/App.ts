import * as bodyParser from 'body-parser';
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';

import BaseController from './controllers/BaseController';

type Middleware = (
	req: Request,
	_res: Response,
	next: NextFunction
) => void | Promise<void>;

type AppConfiguration = {
	controllers: BaseController[];
	port: string;
	preMiddleware: Middleware[];
	postMiddleware: Middleware[];
};

export default class SidecarApp {
	private app: express.Application;
	private port: number;

	constructor({
		controllers,
		port,
		preMiddleware,
		postMiddleware,
	}: AppConfiguration) {
		this.app = express();
		this.port = port;

		this.initPreMiddlewares(preMiddleware);
		this.initializeControllers(controllers);
		this.initPostMiddlewares;
	}

	private initMiddleware() {
		this.app.use(bodyParser.json());
	}

	private initControllers(controllers: BaseController[]) {
		for (const c of controllers) {
			this.app.use('/', c.router);
		}
	}

	public listen() {
		this.app.listen(this.port, () => {
			console.log(`App listening on the port ${this.port}`);
		});
	}
}
