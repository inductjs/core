// Turn into middleware that interprets req.result object
import { CommandResult, InductResult } from '../helpers/command-result';
import { ValidationError } from '../types/error';
import { Request, Response } from '../types/express';
import { StatusCode } from '../types/http';
import { wrapAsync } from '../helpers/wrap-async';

function handleGet<T>(values: any): InductResult {
	let status: StatusCode;
	let data: T | T[];
	let info: string;
	let error: Error;
	let validationErrors: ValidationError[];

	if (values instanceof Error) {
		status = StatusCode.INTERNAL_SERVER_ERROR;
		error = values;
	}
	else if ((Array.isArray(values) && !values.length)) {
		status = StatusCode.NO_CONTENT;
	}
	else if (!values) {
		status = StatusCode.NOT_FOUND;
	}
	else {
		status = StatusCode.OK;
		data = values;
	}

	return CommandResult({
		status,
		data,
		info,
		error,
		validationErrors,
	});
}

function handleUpdate<T>(values: any): InductResult {
	let status: StatusCode;
	let data: T | T[];
	let info: string;
	let error: Error;
	let validationErrors: ValidationError[];

	if (values instanceof Error) {
		status = StatusCode.INTERNAL_SERVER_ERROR;
		error = values;
	}
	else if (values === null) {
		status = StatusCode.BAD_REQUEST;
	}
	else if (!values) {
		status = StatusCode.NOT_FOUND;
	}
	else {
		status = StatusCode.OK;
		data = values;
	}

	return CommandResult({
		status,
		data,
		info,
		error,
		validationErrors,
	});
}

function handlePost<T>(values: any): InductResult {
	let status: StatusCode;
	let data: T | T[];
	let info: string;
	let error: Error;
	let validationErrors: ValidationError[];

	if (values instanceof Error) {
		status = StatusCode.INTERNAL_SERVER_ERROR;
		error = values;
	}
	else if (values === null) {
		status = StatusCode.BAD_REQUEST;
	}
	else {
		status = StatusCode.CREATED;
		data = values;
	}

	return CommandResult({
		status,
		data,
		info,
		error,
		validationErrors,
	});
}

function handleDelete<T>(values: any): InductResult {
	let status: StatusCode;
	let data: T | T[];
	let info: string;
	let error: Error;
	let validationErrors: ValidationError[];

	if (values instanceof Error) {
		status = StatusCode.INTERNAL_SERVER_ERROR;
		error = values;
	}
	else if (values === null) {
		status = StatusCode.NOT_FOUND;
	}
	else {
		status = StatusCode.NO_CONTENT;
		data = values;
	}

	return CommandResult({
		status,
		data,
		info,
		error,
		validationErrors,
	});
}

export const sendResult = wrapAsync(async <T>(
	req: Request,
	res: Response,
): Promise<Response> => {
	let result: InductResult;

	const values = req.result;

	switch (req.method) {
		case 'GET':
			result = handleGet(values);
			break;
		case 'PATCH':
			result = handleUpdate(values);
			break;
		case 'POST':
			result = handlePost(values);
			break;
		case 'DELETE':
			result = handleDelete(values);
			break;
		default:
			result = null;
			break;
	}

	return result.send(res);
});
