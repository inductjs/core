import {Express, Request, Response, Handler} from "express";
import {Route, ApplicationMetadata} from "../types/express-meta-schema";

const regExpToPath = (pattern: string): string => {
    const startIdx = pattern.indexOf("/");
    const endIdx =
        pattern.indexOf("/(?") !== -1
            ? pattern.indexOf("/(?")
            : pattern.indexOf("/?");

    return pattern
        .substr(startIdx, endIdx - 1)
        .replace(/\\/g, "")
        .slice(0, -1);
};

/** Returns a route handler that reads information about the available routes in an express application. */
export const metaHandler = (app: Express): Handler => {
    const meta: ApplicationMetadata = {
        path: app.mountpath[0],
        routers: [],
    };

    const routers = app._router.stack?.filter((route) => {
        return route.name === "router";
    });

    for (const router of routers) {
        const routerPath = regExpToPath(router.regexp.source as string);

        const routes = router.handle.stack;

        const routerRoutes: Route[] = [];

        for (const route of routes) {
            const expRoute = route.route;

            route.route.stack.forEach((r) => {
                routerRoutes.push({path: expRoute.path, method: r.method});
            });
        }

        meta.routers.push({
            path: routerPath,
            routes: routerRoutes,
        });
    }

    return async (req: Request, res: Response): Promise<Response> => {
        return res.status(200).json(meta);
    };
};
