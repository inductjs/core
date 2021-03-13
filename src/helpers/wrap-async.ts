import {
	Handler, NextFunction, Request, Response,
} from 'express';

export const wrapAsync = (fn: Handler) => {
	return function(req: Request, res: Response, next: NextFunction): void {
		try {
			fn(req, res, next);
		}
		catch (e) {
			next(e);
		}
	};
};
