import { StatusCode } from '../types/http';
import {
	CommandResult, ICommandResult, CommandResultOpts,
} from '../command-result';
import { Response } from 'express';

export const ok = <T>(
	res: Response,
	data?: any,
	opts?: CommandResultOpts
): Response => {
	const result: ICommandResult<T> = {
		status: StatusCode.OK,
		data,
	};

	return new CommandResult(result, opts).send(res);
};

export const unauthorized = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: ICommandResult<T> = { status: StatusCode.UNAUTHORIZED };

	return new CommandResult(result, opts).send(res);
};

export const forbidden = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: ICommandResult<T> = { status: StatusCode.FORBIDDEN };

	return new CommandResult(result, opts).send(res);
};
export const badRequest = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: ICommandResult<T> = { status: StatusCode.BAD_REQUEST };

	return new CommandResult(result, opts).send(res);
};

export const notFound = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: ICommandResult<T> = { status: StatusCode.NOT_FOUND };

	return new CommandResult(result, opts).send(res);
};

export const noContent = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: ICommandResult<T> = { status: StatusCode.NO_CONTENT };

	return new CommandResult(result, opts).send(res);
};

export const created = <T>(
	res: Response,
	data?: any,
	opts?: CommandResultOpts
): Response => {
	const result: ICommandResult<T> = {
		status: StatusCode.CREATED,
		data,
	};

	return new CommandResult(result, opts).send(res);
};

export const internalError = <T>(
	res: Response,
	error?: Error,
	opts?: CommandResultOpts
): Response => {
	const result: ICommandResult<T> = {
		status: StatusCode.INTERNAL_SERVER_ERROR,
		error,
	};

	return new CommandResult(result, opts).send(res);
};

export const conflict = <T>(
	res: Response,
	opts?: CommandResultOpts
): Response => {
	const result: ICommandResult<T> = { status: StatusCode.CONFLICT };

	return new CommandResult(result, opts).send(res);
};
