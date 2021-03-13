import { ContextError, CommandError } from '../types/error';
import { ModelAction } from '../types/functions';
import {
	Request, Response, NextFunction, Handler,
} from '../types/express';
import { wrapAsync } from '../helpers/wrap-async';
import { isNullOrUndefined } from '../helpers/value-checks';
import { badRequest } from '../helpers/result';

interface ActionOpts {
    resultProp?: string;
}

/**
 *  Returns middleware that executes the provided query and sets the result to req.result
 *  Optionally takes a property name where the result of the query will be stored. Default: req.result.data
 */
export const queryAction = <T>(
	query: ModelAction<T>,
	opts?: ActionOpts
): Handler => {
	return wrapAsync(
		async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<Response> => {
			try {
				if (!isNullOrUndefined(req.con)) {
					throw new ContextError(`
					Query action missing required context
				`);
				}

				const [result, err] = await query(req.model);

				if (err) {
					return badRequest(res);
				}

				req.result[opts?.resultProp || 'data'] = result;

				next();
			}
			catch (e) {
				throw new CommandError(e);
			}
		}
	);
};
