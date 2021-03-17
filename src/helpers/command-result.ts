import { StatusCode } from '../types/http';
import { ValidationError } from '../types/error';
import { Response } from 'express';

export interface InductResult {
    /** Wrapper function around express' .json. Returns JSON response formed from data stored in ControllerResult instance */
    send: (res: Response) => Response;
    /** Wrapper for express.response.redirect */
    redirect: (res: Response, location: string) => void;
}
export interface CommandResultData<T> {
    /** HTTP Status code as integer */
    status: StatusCode;
    /** Data to be returned as the response body */
    data?: T;
    /** Optional extra information about the response */
    info?: string;
    /** Optional error message */
    error?: Error;
    blocked?: boolean;
    /** Array of occurred validation errors */
    validationErrors?: ValidationError[];
}

export interface CommandResultOpts {
    /** enables full error messages in response body */
    debug: boolean;
}

export function CommandResult<T>(
	data: CommandResultData<T>,
	opts?: CommandResultOpts
): InductResult {
	return {
		send(res: Response): Response {
			const response = {
				...data.data,
				info: data.info,
				error: opts?.debug
					? {
						name: data.error?.name,
						message: data.error?.message,
						stack: data.error?.stack,
					}
					: data.error?.name,
				validationErrors: data.validationErrors,
			};

			return res.status(data.status).send(response);
		},

		redirect(res: Response, location: string): void {
			return res.redirect(location);
		},
	};
}
