export interface IRouteInfo {
	path: string;
	methods: Record<string, boolean>;
}
export interface IRegisteredRoutes {
	stack: IRouterStackMiddleware[];
}

interface IRouterStackMiddleware {
	route?: IRouteInfo;
	name?: string;
	handle?: IHandle;
}

interface IHandle {
	stack: IHandler[];
}

interface IHandler {
	route?: IRouteInfo;
}
