import {
	Request,
	Response,
	NextFunction,
} from '../types/express';
import { verify } from '../helpers/jwt';
import { unauthorized } from '../helpers/result';

const { JWT_SECRET_KEY } = process.env;

export const verifyJWT = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response> => {
	const token = req.headers?.authorization?.
		split(' ')[1]; // Split from 'Bearer'

	if (!token) {
		return unauthorized(res);
	}

	verify(token, JWT_SECRET_KEY)
		.then(data => {
			req.context.user = data;
			next();
		})
		.catch(() => unauthorized(res));
};
