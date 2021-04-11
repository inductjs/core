import { consolidateRequestData } from './middleware/consolidate-req-data';
import { verifyJWT } from './middleware/verify-jwt';
import { authCookieParser } from './middleware/parse-auth-cookies';
import { sendResult } from './middleware/send-result';
import { Handler } from './types/express';
import { BindingConfig } from './types/request-context';
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

export const createHandler = <T>(
	action: Handler | Handler[],
	opts?: HandlerOpts<T>
): Handler[] => {
	const chain: Handler[] = [];

	chain.push(initContext());

	if (opts.authorize !== false) {
		// TODO: implement tests with cookies, don't use middleware in test for now
		if (process.env.NODE_ENV !== 'test') {
			chain.push(authCookieParser());
		}

		chain.push(verifyJWT);
	}

	chain.push(consolidateRequestData(opts.context));

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
