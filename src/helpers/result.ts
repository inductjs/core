import { StatusCode } from '../types/http';
import {
	CommandResult, CommandResultData, CommandResultOpts,
} from './command-result';
import { Response } from 'express';

export const ok = <T>(
	res: Response,
	data?: any,
	opts?: CommandResultOpts
): Response => {
	const result: CommandResultData<T> = {
		status: StatusCode.OK,
		data,
	};

	return CommandResult(result, opts).send(res);
};

export const unauthorized = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: CommandResultData<T> = { status: StatusCode.UNAUTHORIZED };

	return CommandResult(result, opts).send(res);
};

export const forbidden = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: CommandResultData<T> = { status: StatusCode.FORBIDDEN };

	return CommandResult(result, opts).send(res);
};
export const badRequest = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: CommandResultData<T> = { status: StatusCode.BAD_REQUEST };

	return CommandResult(result, opts).send(res);
};

export const notFound = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: CommandResultData<T> = { status: StatusCode.NOT_FOUND };

	return CommandResult(result, opts).send(res);
};

export const noContent = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: CommandResultData<T> = { status: StatusCode.NO_CONTENT };

	return CommandResult(result, opts).send(res);
};

export const created = <T>(
	res: Response,
	data?: any,
	opts?: CommandResultOpts
): Response => {
	const result: CommandResultData<T> = {
		status: StatusCode.CREATED,
		data,
	};

	return CommandResult(result, opts).send(res);
};

export const internalError = <T>(
	res: Response,
	error?: Error,
	opts?: CommandResultOpts
): Response => {
	const result: CommandResultData<T> = {
		status: StatusCode.INTERNAL_SERVER_ERROR,
		error,
	};

	return CommandResult(result, opts).send(res);
};

export const conflict = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: CommandResultData<T> = { status: StatusCode.CONFLICT };

	return CommandResult(result, opts).send(res);
};
