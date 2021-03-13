import {
	Request, Response, NextFunction, Handler,
} from '../types/express';
import { wrapAsync } from '../helpers/wrap-async';
import { badRequest } from '../helpers/result';
import { Validator } from '../validator';
import { DTOConstructor } from '../types/constructors';
import { ContextError } from '../types/error';
import { isNonEmptyArray, isNonEmptyObject } from '../helpers/value-checks';

/**
 * Returns middleware that validates the stored model data.
 * Overwrites req.model with a frozen version of the validated DTO data.
 */
export const validateDto = <T>(dto: DTOConstructor<T>): Handler => {
	return wrapAsync(
		async (
			req: Request,
			res: Response,
			next: NextFunction
		): Promise<Response> => {
			if (!isNonEmptyObject(req.binding)) {
				throw new ContextError('ValidateDTO missing request binding');
			}

			const validator = new Validator<T>(dto, req.model);

			const validationErrors = await validator.validate();

			if (isNonEmptyArray(validationErrors)) {
				return badRequest(res);
			}

			req.model = Object.freeze(validator.dtoData());

			next();
		}
	);
};
