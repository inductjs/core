/* eslint-disable @typescript-eslint/no-namespace */
export { CommandResult } from './helpers/command-result';

// Module imports
import * as helpers from './helpers';
import * as middleware from './middleware';
import * as handlers from './handlers';
import * as types from './types';

// Definition of top level imports for consumer
export const {
	result, wrapAsync, jwt, log,
} = helpers;
export const {
	dbAction: createDbAction,
	consolidateRequestData,
	bindModel,
	errorHandler,
} = middleware;
export const {
	QueryType,
	buildCreateQuery,
	buildDeleteQuery,
	buildFindAllQuery,
	buildUpdateQuery,
	buildFindQuery,
	createQuery,
} = helpers.queries;

export { createHandler } from './create-handler';
export { Validator as DTO } from './middleware/dto-validation';
export { ApplicationOpts } from './types/ApplicationOptions';
export {
	ContextError,
	QueryError,
	ValidationError,
	CommandError,
} from './types/error';
import { createApplication } from './induct-app';

export const {
	ok,
	unauthorized,
	forbidden,
	notFound,
	noContent,
	conflict,
	created,
	internalError,
	badRequest,
} = result;

export {
	helpers, handlers, middleware, types, createApplication,
};
