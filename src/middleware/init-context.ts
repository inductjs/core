import {
	Request, Response, NextFunction, Handler,
} from '../types/express';
import { wrapAsync } from '../helpers/wrap-async';

/*
   Take one parameter: RequestConfig
   Have the controller inject a default config, but let the user customize with the parameter
*/
export function initContext(): Handler {
	return wrapAsync(
		async (req: Request, _res: Response, next: NextFunction) => {
			req.context = { user: {} };
			req.model = {};
			req.result = {};

			next();
		}
	);
}

export default initContext;
