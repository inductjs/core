/* eslint-disable @typescript-eslint/no-namespace */
export { CommandResult } from './helpers/command-result';
export { getModelForClass, prop } from '@typegoose/typegoose';

// Module imports
import * as helpers from './helpers';
import * as middleware from './middleware';
import * as handlers from './handlers';
import * as types from './types';

// Definition of top level imports for consumer
export const { result, wrapAsync } = helpers;
export const { queryAction, validateDto } = middleware;
export { composeHandler } from './compose-handler';
export { Validator } from './validator';

export { SqlStrategy as SqlStrategy } from './strategies/sql-strategy';
export { ApplicationOpts } from './types/ApplicationOptions';
export {
	ContextError, QueryError, ValidationError, CommandError,
} from './types/error';
import { createApp as induct } from './induct-app';
import { DefaultSqlService } from './sql-service';
import { createController } from './induct-controller';

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
	helpers, handlers, middleware, types, induct, DefaultSqlService,
	createController,
};

