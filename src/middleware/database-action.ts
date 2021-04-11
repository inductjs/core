import {
	Request, Response, NextFunction, Handler,
} from '../types/express';
import { wrapAsync } from '../helpers/wrap-async';
import { badRequest } from '../helpers/result';
import { InductQuery } from '../helpers/create-query';

export interface ActionOpts {
    resultProp?: string;
}

/**
 *  Returns middleware that executes the provided query and sets the result to req.result
 *  Optionally takes a property name where the result of the query will be stored. Default: req.result.data
 */
export function dbAction<T>(
	query: InductQuery<T>,
	resultProp?: string
): Handler {
	return wrapAsync(
		async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<Response> => {
			const [result, err] = await query.run(req.con, req.model);

			if (err) {
				return badRequest(res);
			}

			req.result[resultProp ?? 'data'] = result;

			next();
		}
	);
}
