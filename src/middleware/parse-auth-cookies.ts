import { unauthorized } from '../helpers/result';
import {
	Request, Response, NextFunction,
} from '../types/express';

/**
 * Constructs the authorization header based on cookies sent by the front end.
 *
 * Returns 401 when
 */
export function authCookieParser(cookieName = 'access-token') {
	return async function(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<void | Response> {
		const cookie = req.cookies[cookieName];

		// If session token is present, use that to set authorization header
		if (cookie) {
			// Zet autorisatie header voor het autoriseren van het achterliggende verzoek
			const token = `Bearer ${cookie}`;

			req.headers.authorization = token;

			next();
		}
		else {
			return unauthorized(res);
		}
	};
}

export default authCookieParser;
