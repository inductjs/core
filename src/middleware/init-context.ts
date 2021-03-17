import {
	Request, Response, NextFunction, Handler,
} from '../types/express';
import { wrapAsync } from '../helpers/wrap-async';
import { InductService } from '../types/induct';
import { ControllerOpts } from '../induct-controller';
import { isNullOrUndefined } from '../helpers/value-checks';
import { DefaultSqlService } from '../sql-service';

/*
   Take one parameter: RequestConfig
   Have the controller inject a default config, but let the user customize with the parameter
*/
export function initContext<T>(opts: ControllerOpts<T>): Handler {
	return wrapAsync(async (
		req: Request,
		res: Response,
		next: NextFunction
	) => {
		const { createService, con, table } = opts;

		const service: InductService<T> = isNullOrUndefined(createService)
			? DefaultSqlService(con, table)
			: createService(con, table);

		req.context = { user: {} };
		req.model = {};
		req.result = {};
		req.db = service;
		// req.config = Object.freeze(conf);

		next();
	});
}
export default initContext;
