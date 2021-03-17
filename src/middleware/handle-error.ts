
import { logError } from '../helpers/logging';
import { Response } from 'express';

export function errorHandler(err, req, res, next): Response {
	if (res.headersSent) {
		return next(err);
	}

	if (process.env.NODE_ENV !== 'production') {
		logError(`${err.name}: ${err.message}\n\n${err.stack}`);
	}

	const status = err.name === 'NotFoundError'
		? 404
		: 500;

	res.status(status).send({ error: err });
}
