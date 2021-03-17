import jwt, { SignOptions, VerifyOptions } from 'jsonwebtoken';

const {
	REFRESH_TOKEN_DURATION,
	SESSION_TOKEN_DURATION,
	JWT_SECRET,
} = process.env;


export const sign = async <T extends object>(
	payload: T,
	opts: SignOptions,
	secret?: string
): Promise<string> => {
	return new Promise((resolve, reject) => {
		jwt.sign(
			payload,
			secret ?? JWT_SECRET!,
			opts,
			(err: Error | null, token: string | undefined) => {
				if (err) {
					reject(err);
				}

				resolve(token as string);
			}
		);
	});
};

export const verify = async <T extends object>(
	token: string,
	secret: string,
	opts?: VerifyOptions
): Promise<T> => {
	const prom = new Promise<T>((resolve, reject) => {
		jwt.verify(token, secret, opts, (err, data) => {
			if (err || !data) {
				reject(err);
			}

			resolve(data as T);
		});
	});

	return prom;
};

export const signAuthTokens = async <T extends object>(payload: T): Promise<{
	sessionToken: string;
	refreshToken: string;
}> => {
	const signSession = sign(
		payload,
		{ expiresIn: SESSION_TOKEN_DURATION }
	);

	const signRefresh = sign(
		{
			...payload,
			isRefresh: true,
		}
		,
		{ expiresIn: REFRESH_TOKEN_DURATION }
	);

	const [sessionToken, refreshToken] = await Promise.all([
		signSession,
		signRefresh,
	]);

	return {
		sessionToken,
		refreshToken,
	};
};


export default sign;
