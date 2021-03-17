import { bindModel } from './middleware/bind-model';
import { verifyJWT } from './middleware/verify-jwt';
import { authCookieParser } from './middleware/parse-auth-cookies';
import { sendResult } from './middleware/send-result';
import { Handler } from './types/express';
import { BindingConfig } from './types/request-context';
import { ControllerOpts } from './induct-controller';
import { isNullOrUndefined } from './helpers/value-checks';
import initContext from './middleware/init-context';

interface HandlerOpts<T> {
	/** Handler should check if the logged-in user is an admin. Default: false */
	adminOnly?: boolean;
	/** Handler should check whether the authorization header contains a valid user token. Default: true*/
	authorize?: boolean;
	/** Handler should use generic send result middleware. Default: true */
	standardResult?: boolean;
	context?: BindingConfig<T>;
}

export const composeHandler = <T>(
	action: Handler | Handler[],
	cOpts?: ControllerOpts<T>,
	opts?: HandlerOpts<T>
): Handler[] => {
	const chain: Handler[] = [];

	if (isNullOrUndefined(cOpts)) {
			
	}

	chain.push(initContext(cOpts));

	if (opts.authorize !== false) {
		// @todo implement tests with cookies, don't use middleware in test for now
		if (process.env.NODE_ENV !== 'test') {
			chain.push(authCookieParser());
		}

		chain.push(verifyJWT);
	}

	chain.push(bindModel(opts.context));

	if (Array.isArray(action)) {
		chain.push(...action);
	}
	else {
		chain.push(action);
	}

	if (opts.standardResult !== false) {
		chain.push(sendResult);
	}

	return chain;
};
