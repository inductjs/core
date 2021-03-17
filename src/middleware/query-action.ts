import { InductService } from '../types/induct';
import {
	Request, Response, NextFunction, Handler,
} from '../types/express';
import { wrapAsync } from '../helpers/wrap-async';
import { badRequest } from '../helpers/result';

export interface ActionOpts {
    resultProp?: string;
}

/**
 *  Returns middleware that executes the provided query and sets the result to req.result
 *  Optionally takes a property name where the result of the query will be stored. Default: req.result.data
 */
export function queryAction<T>(
	query: keyof InductService<T>,
	resultProp?: string
): Handler
// Overload for optional service type argument
export function queryAction<T, S extends InductService<T>>(
	table: string,
	query: keyof S,
	resultProp?: string
): Handler {
	return wrapAsync(
		async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<Response> => {
			var q = req.db[query as string];

			if (typeof q !== 'function') {
				throw new TypeError('Selected service query is not a function');
			}

			const [result, err] = await q(req.model);

			if (err) {
				return badRequest(res);
			}

			req.result[resultProp ?? 'data'] = result;

			next();
		}

	);
};
