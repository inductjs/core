import e from 'express';
import { ServiceFactory } from './types/induct';
import Knex from 'knex';
import { bindModel } from './middleware/bind-model';
import { verifyJWT } from './middleware/verify-jwt';
import { authCookieParser } from './middleware/parse-auth-cookies';
import { sendResult } from './middleware/send-result';
import { Handler } from './types/express';
import { BindingConfig } from './types/request-context';
import initContext from './middleware/init-context';
import DefaultSqlService from './sql-service';
import {isNullOrUndefined} from '@typegoose/typegoose/lib/internal/utils';

export interface HandlerOpts<T> {
	/** Handler should check if the logged-in user is an admin. Default: false */
	adminOnly?: boolean;
	/** Handler should check whether the authorization header contains a valid user token. Default: true*/
	authorize?: boolean;
	/** Handler should use generic send result middleware. Default: true */
	standardResult?: boolean;
	context?: BindingConfig<T>;
	authCookieName?: string;
}

export interface ControllerOpts<T> {
	con: Knex;
	table: string;
	path: string;
    createService?: ServiceFactory;
}

export interface InductController<T> {
	con: Knex;
	path: string;
	table: string;
	router: e.Router;
	composeHandler: (
		action: Handler | Handler[],
		controllerOpts: ControllerOpts<T>,
		opts: HandlerOpts<T>) => Handler[];
}


function composeHandler<T>(
	action: Handler | Handler[],
	controllerOpts?: ControllerOpts<T>,
	handlerOpts?: HandlerOpts<T>
): Handler[] {
	const chain: Handler[] = [];

	if (isNullOrUndefined(controllerOpts)) {
		var { con, table, path } = this as InductController<unknown>;

		controllerOpts = {
			con,
			table,
			path,
		};
	}

	chain.push(initContext(controllerOpts));

	if (handlerOpts.authorize !== false) {
		// TODO: implement tests with cookies, don't use middleware in test for now
		if (process.env.NODE_ENV !== 'test') {
			chain.push(authCookieParser(handlerOpts.authCookieName));
		}

		chain.push(verifyJWT);
	}

	chain.push(bindModel(handlerOpts.context));

	if (Array.isArray(action)) {
		chain.push(...action);
	}
	else {
		chain.push(action);
	}

	if (handlerOpts.standardResult !== false) {
		chain.push(sendResult);
	}

	return chain;
};

export function createController<T>(
	path: string,
	con: Knex,
	service?: ServiceFactory
): InductController<T> {
	const router = e.Router();

	return {
		con,
		path,
		router,
		composeHandler,
	};
}
