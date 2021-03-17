import {
	Express, Request, Response, Handler,
} from 'express';
import { Route, ApplicationMetadata } from '../types/express-meta';

const regExpToPath = (pattern: string): string => {
	const startIdx = pattern.indexOf('/');
	const endIdx =
        pattern.indexOf('/(?') !== -1
        	? pattern.indexOf('/(?')
        	: pattern.indexOf('/?');

	return pattern
		.substr(startIdx, endIdx - 1)
		.replace(/\\/g, '')
		.slice(0, -1);
};

const applicationMetaData = (app: Express): ApplicationMetadata => {
	const meta: ApplicationMetadata = {
		path: app.mountpath[0],
		routers: [],
	};

	const routers = app._router.stack?.filter(r => r.name === 'router');

	for (const router of routers) {
		const routerRoutes: Route[] = [];

		for (const route of router.handle.stack) {
			const expRoute = route.route;

			route.route.stack.forEach(r => {
				routerRoutes.push({
					path: expRoute.path,
					method: r.method,
				});
			});
		}

		meta.routers.push({
			path: regExpToPath(router.regexp.source as string),
			routes: routerRoutes,
		});
	}

	return meta;
};

/** Returns a route handler that reads information about the available routes in an express application. */
export const metaHandler = (app: Express): Handler => {
	return async (req: Request, res: Response): Promise<Response> => {
		return res.status(200).json(applicationMetaData(app));
	};
};
